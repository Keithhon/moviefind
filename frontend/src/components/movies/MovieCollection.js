import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiTrash2, FiInfo, FiFilm, FiCalendar, FiStar, FiSearch } from 'react-icons/fi';
import { moviesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Separate component to handle each movie item and its own image error state
const MovieItem = ({ movie, onDelete }) => {
  const [hasImageError, setImageError] = useState(!movie.poster || movie.poster === 'N/A');
  
  // Validate if the poster URL is actually valid and not empty
  const isPosterValid = (url) => {
    if (!url || url === 'N/A' || url.trim() === '') return false;
    // Check for common issues in the API responses
    if (url.includes('null') || url === 'https://' || url === 'http://') return false;
    return true;
  };
  
  const isPosterAvailable = isPosterValid(movie.poster) && !hasImageError;
  
  // Get appropriate type badge styles - EXACTLY match MovieCard component styling
  const getTypeBadgeClasses = (type) => {
    switch(type.toLowerCase()) {
      case 'movie':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'series':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'game':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };
  
  // Determine movie type with special handling for known games like Disney Infinity
  const determineCorrectType = () => {
    // First check if type is already specified
    if (movie.type && movie.type.toLowerCase() !== 'movie') {
      return movie.type.toLowerCase();
    }
    if (movie.Type && movie.Type.toLowerCase() !== 'movie') {
      return movie.Type.toLowerCase();
    }
    
    // Check for game platform indicators in poster or title
    const titleLower = movie.title ? movie.title.toLowerCase() : '';
    const posterLower = movie.poster ? movie.poster.toLowerCase() : '';
    
    // Check for game platforms or keywords
    const isGamePlatform = posterLower.includes('xbox') || 
      posterLower.includes('playstation') || 
      posterLower.includes('nintendo') ||
      titleLower.includes('game');
      
    // Special case handling for games
    if (isGamePlatform ||
        titleLower.includes('disney infinity') || 
        titleLower.includes('the godfather game') || 
        (titleLower.includes('godfather') && posterLower.includes('xbox'))) {
      console.log('Identified as a game in collection:', movie.title);
      return 'game';
    }
    
    // Default to provided type or 'movie' as fallback
    return (movie.type || movie.Type || 'movie').toLowerCase();
  };
  
  const movieType = determineCorrectType();
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transform transition duration-300 hover:-translate-y-1" data-testid="movie-item">
      {/* Image Container */}
      <div className="h-64 sm:h-72 overflow-hidden relative bg-gray-50 border-b border-gray-100">
        
        {/* IMDb Badge - Top Right */}
        {movie.imdb_rating && movie.imdb_rating !== 'N/A' && (
          <div className="absolute top-0 right-0 z-10 m-2">
            <div className="flex items-center space-x-1 bg-gray-900 bg-opacity-70 text-white px-2 py-1 rounded-md text-xs border border-gray-700">
              <FiStar className="text-yellow-400" />
              <span>{movie.imdb_rating}</span>
            </div>
          </div>
        )}
        
        {/* Image or Placeholder */}
        {isPosterAvailable ? (
          <>
            <div className="flex justify-center items-center w-full h-full p-2">
              <img 
                src={movie.poster} 
                alt={`${movie.title} poster`} 
                className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105 rounded-sm"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-center p-4">
            <div>
              <FiFilm className="h-16 w-16 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No Image Available</p>
              <p className="text-gray-500 text-sm mt-1 line-clamp-1">{movie.title}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-800">{movie.title}</h3>
        
        {/* Year and Type */}
        <div className="mt-auto pt-3 flex justify-between items-center">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-1.5 text-sm text-gray-500" />
            <p className="text-sm font-medium">{movie.year}</p>
          </div>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTypeBadgeClasses(movieType)}`}>
            {movieType.charAt(0).toUpperCase() + movieType.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex space-x-2">
        <Link 
          to={`/movies/${movie.imdb_id}`}
          className="flex-grow inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out"
        >
          <FiInfo className="mr-2" />
          View Details
        </Link>
        <button 
          onClick={() => onDelete(movie.id, movie.title || 'this movie')} 
          className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white text-sm rounded-md shadow-sm hover:shadow transition-all duration-150 ease-in-out"
          aria-label={`Remove ${movie.title || 'movie'} from collection`}
        >
          <FiTrash2 className="mr-2" />
          Remove
        </button>
      </div>
    </div>
  );
};

const MovieCollection = () => {
  // State initialization
  const [savedMovies, setSavedMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Apply sorting to the movies array - defining this before it's used in other functions
  const applySorting = useCallback((order, moviesToSort) => {
    if (!Array.isArray(moviesToSort) || moviesToSort.length === 0) {
      console.log('No movies to sort or invalid array');
      return [];
    }
    
    let sortedMovies = [...moviesToSort];
    console.log('Sorting movies with order:', order);
    
    if (order === 'none') {
      // For "Sort by Rating" option, sort by newest first (reverse chronological order)
      // Assuming higher IDs mean newer movies, or using created_at if available
      sortedMovies.sort((a, b) => {
        // First try to use created_at or date fields if available
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        // Otherwise sort by ID in descending order (assuming higher ID = newer)
        return b.id - a.id;
      });
      console.log('Sorted by newest first (reverse chronological order)');
      setFilteredMovies(sortedMovies);
      return sortedMovies;
    }
    
    if (sortedMovies.length > 0) {
      // Log the first movie to see what properties are available
      console.log('Sample movie for sorting:', {
        title: sortedMovies[0].title,
        available_fields: Object.keys(sortedMovies[0]),
        imdb_rating: sortedMovies[0].imdb_rating,
        rating: sortedMovies[0].rating
      });
    }
    
    if (order === 'high-to-low') {
      // Sort by rating high to low
      sortedMovies.sort((a, b) => {
        // Try different possible rating field names
        const ratingA = parseFloat(a.imdb_rating || a.rating || a.imdbRating || 0);
        const ratingB = parseFloat(b.imdb_rating || b.rating || b.imdbRating || 0);
        return ratingB - ratingA;
      });
      
      // Log the top 3 movies after sorting
      if (sortedMovies.length > 0) {
        const topThree = sortedMovies.slice(0, 3).map(m => 
          `${m.title} (${m.imdb_rating || m.rating || 'no rating'})`
        );
        console.log('Top rated movies:', topThree);
      }
    } else if (order === 'low-to-high') {
      // Sort by rating low to high
      sortedMovies.sort((a, b) => {
        const ratingA = parseFloat(a.imdb_rating || a.rating || a.imdbRating || 0);
        const ratingB = parseFloat(b.imdb_rating || b.rating || b.imdbRating || 0);
        return ratingA - ratingB;
      });
      
      // Log the bottom 3 movies after sorting
      if (sortedMovies.length > 0) {
        const bottomThree = sortedMovies.slice(0, 3).map(m => 
          `${m.title} (${m.imdb_rating || m.rating || 'no rating'})`
        );
        console.log('Lowest rated movies:', bottomThree);
      }
    }
    
    setFilteredMovies(sortedMovies);
    return sortedMovies;
  }, []);
  
  // Simple helper function to determine correct content type
  const getCorrectContentType = useCallback((movie) => {
    // Handle missing movie object
    if (!movie) return 'movie';
    
    // Check for existing type field
    const typeField = movie.type || movie.Type || '';
    
    // Handle special cases for known titles
    if (movie.title) {
      const title = movie.title.toLowerCase();
      
      // Disney Infinity is always a game
      if (title.includes('disney infinity')) {
        return 'game';
      }
      
      // Disney Gallery shows should be categorized as series
      if (title.includes('disney gallery')) {
        return 'series';
      }
    }
    
    // Handle based on stored type
    if (typeField.toLowerCase() === 'series') return 'series';
    if (typeField.toLowerCase() === 'game') return 'game';
    
    // Look for series indicators in title
    if (movie.title && (movie.title.includes('Season') || movie.title.includes('Series'))) {
      return 'series';
    }
    
    // Default to movie
    return 'movie';
  }, []);

  // Function to apply type filtering - memoized to avoid unnecessary re-renders
  const applyTypeFilter = useCallback((type) => {
    console.log(`Applying filter: ${type}, Movies available: ${savedMovies?.length || 0}`);
    
    if (!Array.isArray(savedMovies) || savedMovies.length === 0) {
      console.log('No movies to filter');
      setFilteredMovies([]);
      return;
    }
    
    let results;
    if (type === 'all') {
      console.log('Setting all movies');
      results = [...savedMovies];
    } else {
      // Use our special content type helper to handle special cases
      results = savedMovies.filter(movie => {
        const correctType = getCorrectContentType(movie);
        return correctType === type.toLowerCase();
      });
      console.log(`Filtered to ${results.length} ${type} items`);
    }
    
    // Apply current sorting if active
    if (sortOrder !== 'none') {
      // We don't call applySorting directly to avoid dependency cycle
      // Instead we apply the same sorting logic inline
      let sortedMovies = [...results];
      
      if (sortOrder === 'high-to-low') {
        sortedMovies.sort((a, b) => {
          const ratingA = parseFloat(a.imdb_rating || a.rating || a.imdbRating || 0);
          const ratingB = parseFloat(b.imdb_rating || b.rating || b.imdbRating || 0);
          return ratingB - ratingA;
        });
      } else if (sortOrder === 'low-to-high') {
        sortedMovies.sort((a, b) => {
          const ratingA = parseFloat(a.imdb_rating || a.rating || a.imdbRating || 0);
          const ratingB = parseFloat(b.imdb_rating || b.rating || b.imdbRating || 0);
          return ratingA - ratingB;
        });
      }
      
      setFilteredMovies(sortedMovies);
    } else {
      // For "Sort by Rating" (none), sort by newest first (reverse chronological order)
      let sortedMovies = [...results];
      sortedMovies.sort((a, b) => {
        // First try to use created_at or date fields if available
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        // Otherwise sort by ID in descending order (assuming higher ID = newer)
        return b.id - a.id;
      });
      console.log('Type filter applied with newest first ordering');
      setFilteredMovies(sortedMovies);
    }
  }, [savedMovies, getCorrectContentType, sortOrder]);
  
  // Group movies by type for category organization
  const moviesByCategory = useCallback(() => {
    const categories = {
      movie: [],
      series: [],
      game: [],
      other: []
    };
    
    // Make sure we have movies to process
    if (!Array.isArray(filteredMovies) || filteredMovies.length === 0) {
      console.log('No filtered movies to categorize');
      return categories;
    }
    
    // Categorize each movie
    filteredMovies.forEach(movie => {
      const type = getCorrectContentType(movie);
      
      if (type === 'movie') {
        categories.movie.push(movie);
      } else if (type === 'series') {
        categories.series.push(movie);
      } else if (type === 'game') {
        categories.game.push(movie);
      } else {
        categories.other.push(movie);
      }
    });
    
    // Log the count in each category
    console.log(`Categorized: Movies: ${categories.movie.length}, Series: ${categories.series.length}, Games: ${categories.game.length}, Other: ${categories.other.length}`);
    
    return categories;
  }, [filteredMovies, getCorrectContentType]);

  // Monitor saved and filtered movies
  useEffect(() => {
    console.log('savedMovies state updated:', savedMovies?.length || 0);
    
    // Check if we have the expected field names (snake_case from database)
    if (Array.isArray(savedMovies) && savedMovies.length > 0) {
      const firstMovie = savedMovies[0];
      console.log('First movie fields:', Object.keys(firstMovie));
      console.log('Rating in first movie:', firstMovie.imdb_rating || firstMovie.rating || 'Not available');
    }
  }, [savedMovies]);
  
  // Monitor filtered movies and current sort order
  useEffect(() => {
    if (filteredMovies) {
      console.log(`Filtered movies updated: ${filteredMovies.length} items, sort: ${sortOrder}`);
    }
  }, [filteredMovies, sortOrder]);
  
  // Helper function to determine content type based on title and poster
  const determineContentType = (movie) => {
    // First check if type is already specified
    if (movie.type && movie.type.toLowerCase() !== 'movie') {
      return movie.type.toLowerCase();
    }
    
    // Check for game platform indicators in poster or title
    const titleLower = movie.title ? movie.title.toLowerCase() : '';
    const posterLower = movie.poster ? movie.poster.toLowerCase() : '';
    
    // Check for game platforms or keywords
    const isGamePlatform = posterLower.includes('xbox') || 
      posterLower.includes('playstation') || 
      posterLower.includes('nintendo') ||
      titleLower.includes('game');
      
    // Special case handling for games
    if (isGamePlatform ||
        titleLower.includes('disney infinity') || 
        titleLower.includes('the godfather game') || 
        (titleLower.includes('godfather') && posterLower.includes('xbox'))) {
      console.log('Identified as a game in collection:', movie.title);
      return 'game';
    }
    
    // Check for series
    if (movie.type === 'series') {
      return 'series';
    }
    
    // Default to movie
    return movie.type || 'movie';
  };
  
  // Define fetchSavedMovies with useCallback before it's used in useEffect
  const fetchSavedMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting to fetch saved movies...');
      const response = await moviesAPI.getSavedMovies();
      
      // Ensure we're always working with an array
      const movies = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched saved movies:', movies.length);
      
      // Log some sample data to help debug rating issues
      if (movies.length > 0) {
        console.log('First movie data:', movies[0]);
        console.log('Available fields:', Object.keys(movies[0]));
        console.log('Rating field value:', movies[0].imdb_rating || movies[0].rating || 'Not found');
      }
      
      // Process movies to ensure correct content type
      const processedMovies = movies.map(movie => ({
        ...movie,
        // Use our determineContentType helper function
        type: determineContentType(movie)
      }));
      
      setSavedMovies(processedMovies);
      
      let moviesForDisplay;
      
      // Apply the current filter
      if (selectedType === 'all') {
        moviesForDisplay = processedMovies;
      } else {
        moviesForDisplay = processedMovies.filter(movie => determineContentType(movie) === selectedType.toLowerCase());
      }
      
      // Apply the current sort if any is selected
      if (sortOrder !== 'none' && moviesForDisplay.length > 0) {
        console.log('Applying sort order on fetch:', sortOrder);
        applySorting(sortOrder, moviesForDisplay);
      } else {
        // For default "Sort by Rating" option, sort by newest first
        let sortedMovies = [...moviesForDisplay];
        sortedMovies.sort((a, b) => {
          // First try to use created_at or date fields if available
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          // Otherwise sort by ID in descending order (assuming higher ID = newer)
          return b.id - a.id;
        });
        console.log('Applied newest-first ordering on fetch');
        setFilteredMovies(sortedMovies);
      }
      
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch your collection. Please try again.');
      setSavedMovies([]);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, sortOrder, applySorting]);
  
  // Initial data fetch
  useEffect(() => {
    console.log('Component mounted, fetching movies...');
    fetchSavedMovies();
    
    // Cleanup function for when component unmounts
    return () => {
      console.log('MovieCollection component unmounting...');
    };
  }, [fetchSavedMovies]);
  
  // State for controlling dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  // Handle filter dropdown click
  const handleFilterClick = () => {
    setShowDropdown(prev => !prev);
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    const newType = type;
    setSelectedType(newType);
    
    // Close dropdown after selection
    setShowDropdown(false);
    
    // Immediately apply filtering
    applyTypeFilter(newType);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // State for controlling sort dropdown visibility
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = React.useRef(null);

  // Handle sort dropdown click
  const handleSortClick = () => {
    setShowSortDropdown(prev => !prev);
  };
  
  // Handle sort change
  const handleSortChange = (order) => {
    const newSortOrder = order;
    setSortOrder(newSortOrder);
    applySorting(newSortOrder, filteredMovies);
    
    // Close dropdown after selection
    setShowSortDropdown(false);
  };
  
  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleDelete = async (id, movieTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${movieTitle}" from your collection?`)) {
      return;
    }
    
    console.log('Deleting movie with ID:', id);
    
    if (!id) {
      setError('Cannot delete movie: Missing ID');
      console.error('Missing movie ID for delete operation');
      toast.error('Error: Missing movie ID');
      return;
    }

    const deletePromise = moviesAPI.deleteMovie(id);
    
    toast.promise(
      deletePromise,
      {
        loading: `Removing "${movieTitle}"...`,
        success: () => {
          // Update both savedMovies and filteredMovies state to remove the deleted movie
          setSavedMovies(prevMovies => (prevMovies || []).filter((movie) => movie.id !== id));
          setFilteredMovies(prevMovies => (prevMovies || []).filter((movie) => movie.id !== id));
          return `"${movieTitle}" removed from your collection`;
        },
        error: (err) => {
          console.error('Error deleting movie:', err);
          return `Failed to remove "${movieTitle}". Please try again.`;
        }
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }
    );
    
    try {
      await deletePromise;
      console.log('Movie successfully removed from collection');
    } catch (err) {
      setError('Failed to delete movie. Please try again.');
      console.error('Error deleting movie:', err);
    }
  };

  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      console.log('MovieCollection component unmounting...');
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 mb-4 rounded-full bg-blue-200"></div>
          <div className="h-4 w-32 mb-2 rounded bg-blue-200"></div>
          <div className="h-3 w-24 rounded bg-blue-100"></div>
        </div>
        <p className="text-gray-500 mt-4">Loading your collection...</p>
      </div>
    );
  }
  if (!loading && !error && filteredMovies && filteredMovies.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500 text-lg">
          {selectedType === 'all'
            ? 'Your collection is empty. Start adding movies to build your collection!'
            : `No ${selectedType.toLowerCase() === 'movie' ? 'movies' : selectedType.toLowerCase() === 'series' ? 'series' : selectedType.toLowerCase() === 'game' ? 'games' : 'items'} found in your collection.`}
        </p>
        <Link to="/" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <FiSearch className="mr-2" /> Search for Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl" data-testid="movie-collection">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">My Collection</h1>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          {/* Type Filter - Icon Only */}
          <div className="relative z-10">
            {/* Dropdown container with improved click handling */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleFilterClick}
                className="flex items-center justify-center h-[54px] px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                aria-haspopup="true"
                aria-expanded={showDropdown}
                title="Filter by content type"
              >
                <FiFilter className="h-5 w-5" />
                <span className="sr-only">Filter content</span>
              </button>
              
              {/* Custom dropdown menu with improved styling and state management */}
              {showDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`${selectedType === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Any Type
                    </button>
                    <button
                      onClick={() => handleFilterChange('movie')}
                      className={`${selectedType === 'movie' ? 'bg-blue-100 text-blue-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Movies
                    </button>
                    <button
                      onClick={() => handleFilterChange('series')}
                      className={`${selectedType === 'series' ? 'bg-purple-100 text-purple-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Series
                    </button>
                    <button
                      onClick={() => handleFilterChange('game')}
                      className={`${selectedType === 'game' ? 'bg-green-100 text-green-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Games
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sort Filter - Icon Only */}
          <div className="relative z-10">
            {/* Dropdown container with improved click handling */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={handleSortClick}
                className="flex items-center justify-center h-[54px] px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                aria-haspopup="true"
                aria-expanded={showSortDropdown}
                title="Sort by rating"
              >
                <FiStar className="h-5 w-5" />
                <span className="sr-only">Sort content</span>
              </button>
              
              {/* Custom dropdown menu with improved styling and state management */}
              {showSortDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleSortChange('none')}
                      className={`${sortOrder === 'none' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Sort by Rating
                    </button>
                    <button
                      onClick={() => handleSortChange('high-to-low')}
                      className={`${sortOrder === 'high-to-low' ? 'bg-yellow-100 text-yellow-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Rating: High to Low
                    </button>
                    <button
                      onClick={() => handleSortChange('low-to-high')}
                      className={`${sortOrder === 'low-to-high' ? 'bg-yellow-100 text-yellow-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                      role="menuitem"
                    >
                      Rating: Low to High
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedType === 'all' ? (
        // Categorized view when showing all types
        <div className="space-y-12">
          {/* Movies Section */}
          {moviesByCategory().movie.length > 0 && (
            <section>
              <div className="flex items-center mb-6 border-b border-gray-200 pb-2">
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center mr-3">
                  Movies
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{moviesByCategory().movie.length} {moviesByCategory().movie.length === 1 ? 'Movie' : 'Movies'}</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 px-2 bg-indigo-50/30 p-6 rounded-xl">
                {moviesByCategory().movie.map((movie) => (
                  <MovieItem 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Series Section */}
          {moviesByCategory().series.length > 0 && (
            <section>
              <div className="flex items-center mb-6 border-b border-gray-200 pb-2">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center mr-3">
                  Series
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{moviesByCategory().series.length} Series</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 px-2 bg-purple-50/30 p-6 rounded-xl">
                {moviesByCategory().series.map((movie) => (
                  <MovieItem 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Games Section */}
          {moviesByCategory().game.length > 0 && (
            <section>
              <div className="flex items-center mb-6 border-b border-gray-200 pb-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center mr-3">
                  Games
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{moviesByCategory().game.length} {moviesByCategory().game.length === 1 ? 'Game' : 'Games'}</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 px-2 bg-green-50/30 p-6 rounded-xl">
                {moviesByCategory().game.map((movie) => (
                  <MovieItem 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* Other Section - for content with unspecified type */}
          {moviesByCategory().other.length > 0 && (
            <section>
              <div className="flex items-center mb-6 border-b border-gray-200 pb-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center mr-3">
                  Other Content
                </div>
                <h2 className="text-xl font-semibold text-gray-700">{moviesByCategory().other.length} {moviesByCategory().other.length === 1 ? 'Item' : 'Items'}</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 px-2 bg-blue-50/30 p-6 rounded-xl">
                {moviesByCategory().other.map((movie) => (
                  <MovieItem 
                    key={movie.id} 
                    movie={movie} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          
          {/* If all categories are empty, this shouldn't happen but just in case */}
          {moviesByCategory().movie.length === 0 && 
           moviesByCategory().series.length === 0 && 
           moviesByCategory().game.length === 0 && 
           moviesByCategory().other.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No movies found in your collection.</p>
            </div>
          )}
        </div>
      ) : (
        // Filtered view - showing only one type
        <div>
          <div className="flex items-center mb-6 border-b border-gray-200 pb-2">
            <div className={`px-3 py-1 rounded-md text-sm font-medium inline-flex items-center mr-3 ${
              selectedType === 'movie' ? 'bg-indigo-100 text-indigo-800' : 
              selectedType === 'series' ? 'bg-purple-100 text-purple-800' : 
              selectedType === 'game' ? 'bg-green-100 text-green-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </div>
            <h2 className="text-xl font-semibold text-gray-700">{filteredMovies.length} {filteredMovies.length === 1 ? 
              (selectedType === 'movie' ? 'Movie' : selectedType === 'series' ? 'Series' : selectedType === 'game' ? 'Game' : 'Item') : 
              (selectedType === 'movie' ? 'Movies' : selectedType === 'series' ? 'Series' : selectedType === 'game' ? 'Games' : 'Items')}</h2>
          </div>
          
          <div className={`grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 px-2 p-6 rounded-xl ${
            selectedType === 'movie' ? 'bg-indigo-50/30' : 
            selectedType === 'series' ? 'bg-purple-50/30' : 
            selectedType === 'game' ? 'bg-green-50/30' : 
            'bg-blue-50/30'
          }`}>
            {filteredMovies.map((movie) => (
              <MovieItem 
                key={movie.id} 
                movie={movie} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCollection;