import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiFilter, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { moviesAPI } from '../../services/api';
import MovieCard from './MovieCard';

const MovieSearch = () => {
  // Session storage key for persisting search state
  const STORAGE_KEY = 'moviefind_search_state';
  
  // State initialization
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('any');
  const [allMovies, setAllMovies] = useState([]); // All unfiltered search results
  const [movies, setMovies] = useState([]); // Filtered results for display
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if search has been performed
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalResults: 0,
    totalPages: 0
  });
  const [isFiltering, setIsFiltering] = useState(false); // Tracks if we're filtering local data
  
  // Handle outside clicks for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    // Add event listener only when dropdown is shown
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Save search state to session storage
  const saveSearchState = useCallback((term, type, page, movieResults, totalResults) => {
    const stateToSave = {
      searchTerm: term,
      contentType: type,
      currentPage: page,
      results: movieResults,
      totalResults,
      timestamp: Date.now() // Add timestamp to track freshness
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, []);

  // Handle search with API call - now only fetches results without filtering
  const handleSearch = useCallback(async (page = 1, searchTermToUse = null, typeToUse = null, saveState = true) => {
    // Get search term from parameter or current state
    searchTermToUse = searchTermToUse || searchTerm;
    typeToUse = typeToUse || contentType;
    
    if (!searchTermToUse || searchTermToUse.trim().length < 2) {
      setError('Please enter at least 2 characters to search');
      return;
    }
    
    // Reset error and set loading
    setError('');
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      if (searchTermToUse) {
        // Call the API
        const response = await moviesAPI.searchMovies(searchTermToUse.trim(), page, typeToUse === 'any' ? undefined : typeToUse);
        
        if (response && response.data && response.data.Response === 'True') {
          const results = response.data.Search;
          
          // Store both all results and currently visible results
          setAllMovies(results);
          
          // Set pagination data
          const totalResults = parseInt(response.data.totalResults);
          setPagination({
            currentPage: page,
            totalResults,
            totalPages: Math.ceil(totalResults / 50) // Now handling 50 results per page
          });
          
          // Apply any current filter to the fresh search results
          const currentContentType = contentType;
          if (currentContentType === 'any') {
            // Just show all results
            setMovies(results);
            setError('');
          } else {
            // Filter by content type
            setIsFiltering(true);
            const filteredResults = results.filter(item => {
              return item.Type === currentContentType;
            });
            
            if (filteredResults.length === 0) {
              setError(`No ${currentContentType}s found in the search results. Try a different search or filter.`);
            } else {
              setError('');
            }
            
            setMovies(filteredResults);
          }
          
          // Save state to session storage if requested (default)
          if (saveState) {
            saveSearchState(searchTermToUse, contentType, page, results, totalResults);
          }
        } else {
          // OMDb returned an error
          setError(response.data.Error || 'Failed to fetch movies');
          setMovies([]);
          setPagination({
            currentPage: 1,
            totalResults: 0,
            totalPages: 0
          });
        }
      }
    } catch (err) {
      console.error('Error searching movies:', err);
      setError('An error occurred while searching. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, contentType, saveSearchState]);

  // Check session storage for previous search state
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      
      if (savedState) {
        const { searchTerm: savedTerm, contentType: savedType, currentPage: savedPage } = JSON.parse(savedState);
        
        if (savedTerm && savedTerm.trim()) {
          setSearchTerm(savedTerm);
          setContentType(savedType);
          // Always trigger a new search to fetch the correct results page
          handleSearch(savedPage, savedTerm, savedType, false);
        }
      } else {
        // Focus the search input on initial load if no session state
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (err) {
      console.error('Error restoring session state:', err);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [handleSearch]);

  // Handle input changes
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Modified filter change handler that doesn't trigger new searches
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    
    // Update content type state
    setContentType(newType);
    
    // Filter results locally
    setIsFiltering(true);
    
    // If we have all results from the API, filter them
    if (allMovies.length > 0) {
      if (newType === 'any') {
        setMovies(allMovies);
        setError('');
      } else {
        const filteredResults = allMovies.filter(item => {
          return item.Type === newType;
        });
        
        if (filteredResults.length === 0) {
          setError(`No ${newType}s found in the search results. Try a different search or filter.`);
        } else {
          setError('');
        }
        
        setMovies(filteredResults);
      }
    } else if (searchTerm) {
      // If no allMovies but we have a search term, trigger a search
      handleSearch(1, searchTerm);
    }
    
    // Update the session storage with the new filter
    if (searchTerm && allMovies.length) {
      saveSearchState(searchTerm, newType, pagination.currentPage, allMovies, pagination.totalResults);
    }
  };

  // Handle Filter UI Click
  const handleFilterClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1, searchTerm);
  };

  // Page navigation handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      handleSearch(page, searchTerm);
    }
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    // Show maximum 5 pages centered around current page
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Adjust startPage if we hit the end boundary
    startPage = Math.max(1, Math.min(startPage, totalPages - maxPages + 1));
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Search for Movies</h1>
        <p className="text-center text-gray-600 text-lg">Find movies, TV series, and games from our extensive collection</p>
      </div>
      
      {/* Search Form */}
      <div className="mb-10 bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-4xl mx-auto">
        {/* Search form with improved interaction */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 search-form">
          {/* Search input wrapper with improved structure */}
          <div className="relative flex-1 z-0">
            {/* Enhanced search field */}
            <div className="flex items-center w-full border-2 border-indigo-100 rounded-xl bg-white focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all duration-200 ease-in-out relative shadow-sm hover:shadow">
              {/* Search icon */}
              <div className="pl-4 py-3.5 flex items-center pointer-events-none">
                <FiSearch className="h-6 w-6 text-indigo-500 flex-shrink-0" />
              </div>
              
              {/* Input field - simplified with no absolute positioning */}
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder="Enter movie title..."
                className="flex-grow px-3 py-3.5 focus:outline-none bg-transparent w-full text-lg font-medium text-gray-800 placeholder-gray-400"
                autoComplete="off"
                ref={inputRef}
              />
              
              {/* Clear button - now part of the flex layout */}
              {searchTerm && (
                <button 
                  type="button" 
                  className="pr-4 py-3 flex items-center"
                  onClick={() => {
                    // Clear the search input
                    setSearchTerm('');
                    
                    // Reset movies array and pagination
                    setMovies([]);
                    setAllMovies([]);
                    setPagination({
                      currentPage: 1,
                      totalResults: 0,
                      totalPages: 0
                    });
                    
                    // Clear any errors
                    setError('');
                    setIsFiltering(false);
                    
                    // Remove from session storage
                    sessionStorage.removeItem(STORAGE_KEY);
                    
                    // Focus the input again for better UX
                    if (inputRef.current) inputRef.current.focus();
                  }}
                >
                  <FiX className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors" />
                </button>
              )}
            </div>
          </div>
          
          {/* Filter dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* Filter trigger button */}
            <button
              type="button"
              className="h-full min-h-[58px] min-w-[100px] rounded-xl border-2 border-indigo-100 bg-white px-5 inline-flex items-center justify-center text-gray-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm hover:shadow font-medium"
              onClick={handleFilterClick}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <FiFilter className="h-5 w-5 text-indigo-500" />
              <span className="ml-2 sm:inline">Filter</span>
            </button>
            
            {/* Dropdown menu */}
            {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                      {/* Any Type */}
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                          contentType === 'any' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                        }`}
                        onClick={(e) => { 
                          handleTypeChange({ target: { value: 'any' } }); 
                          setShowDropdown(false);
                        }}
                        role="menuitem"
                      >
                        <span className="mr-2 text-sm text-gray-600">Any Type</span>
                      </button>
                      
                      {/* Movies */}
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                          contentType === 'movie' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                        }`}
                        onClick={(e) => { 
                          handleTypeChange({ target: { value: 'movie' } }); 
                          setShowDropdown(false);
                        }}
                        role="menuitem"
                      >
                        <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs mr-2">Movie</span>
                      </button>
                      
                      {/* Series */}
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                          contentType === 'series' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                        }`}
                        onClick={(e) => { 
                          handleTypeChange({ target: { value: 'series' } }); 
                          setShowDropdown(false);
                        }}
                        role="menuitem"
                      >
                        <span className="bg-purple-100 text-purple-800 py-1 px-2 rounded-full text-xs mr-2">Series</span>
                      </button>
                      
                      {/* Games */}
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                          contentType === 'game' ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'
                        }`}
                        onClick={(e) => { 
                          handleTypeChange({ target: { value: 'game' } }); 
                          setShowDropdown(false);
                        }}
                        role="menuitem"
                      >
                        <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs mr-2">Game</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center whitespace-nowrap text-lg"
                disabled={loading}
              >
                <FiSearch className="mr-2 h-5 w-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
      </div>
      
      {/* Current Filter display - removed from here since we'll place it in the results section */}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        </div>
      )}
      
      {/* Display Error */}
      {error && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {/* Results and Pagination */}
      {!loading && searchPerformed && movies.length > 0 && (
        <div className="mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">Results</h2>
              <div className="text-sm font-medium text-indigo-600 bg-indigo-50 py-1 px-4 rounded-full shadow-sm ml-3">
                {isFiltering ? (
                  // Show filtered count
                  <>Showing {movies.length === 0 ? 0 : ((pagination.currentPage - 1) * 10 + 1)} - {Math.min(pagination.currentPage * 10, movies.length)} of {movies.length} results</>
                ) : (
                  // Show unfiltered count
                  <>Showing {(pagination.currentPage - 1) * 10 + 1} - {Math.min(pagination.currentPage * 10, pagination.totalResults)} of {pagination.totalResults} results</>
                )}
              </div>
            </div>
            
            {/* Filter badge moved here */}
            {contentType !== 'any' && searchTerm.trim() && (
              <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm mt-2 md:mt-0">
                <span className="mr-2 text-sm text-gray-600 font-medium">Filtered by:</span>
                <span className={`
                  py-1 px-3 text-sm font-medium rounded-full 
                  ${contentType === 'movie' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                    contentType === 'series' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                    contentType === 'game' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                `}>
                  {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </span>
                
                {isFiltering && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 py-1 px-2 rounded-full">(filtered locally)</span>
                )}
              </div>
            )}
          </div>
          {/* Movie grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.imdbID} 
                movie={movie} 
                saveSearchState={saveSearchState}
                searchTerm={searchTerm}
                contentType={contentType}
                pagination={pagination}
                allMovies={allMovies}
                movies={movies}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      pagination.currentPage === page
                        ? 'z-10 bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <FiArrowRight className="h-4 w-4 ml-1" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* No Results */}
      {!loading && searchPerformed && movies.length === 0 && !error && (
        <div className="max-w-4xl mx-auto text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg text-gray-600 font-medium">No movies found</p>
          <p className="text-gray-500 mt-1">Try a different search term or adjust your filter.</p>
        </div>
      )}
      
      {/* Initial State */}
      {!loading && !searchPerformed && (
        <div className="max-w-4xl mx-auto text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-gray-500 text-lg">Search for movies to see results here</p>
          <p className="text-gray-400 text-sm mt-2">Try searching for a movie title like "Inception" or "The Matrix"</p>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
