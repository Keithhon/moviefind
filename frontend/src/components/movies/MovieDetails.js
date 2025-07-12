import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { moviesAPI } from '../../services/api';
import { FiClock, FiCalendar, FiGlobe, FiStar, FiBookmark, FiArrowLeft, FiFilm, FiAward, FiUsers, FiEdit3, FiLayers } from 'react-icons/fi';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    success: false,
    error: ''
  });
  
  // Determine if we have search results to go back to
  const [hasSearchHistory, setHasSearchHistory] = useState(false);

  // Check if we have a search state to go back to and record the referrer
  useEffect(() => {
    // Store the referrer path when component mounts
    const referrer = document.referrer;
    const prevPath = location.state?.from || '';
    
    // Check if we came from the search page
    const fromSearch = 
      prevPath.includes('/movies/search') || 
      referrer.includes('/movies/search') ||
      sessionStorage.getItem('moviefind_search_state');
      
    setHasSearchHistory(!!fromSearch);
    
    // Store the current path so we can return if needed
    sessionStorage.setItem('moviefind_last_details_page', window.location.pathname);
  }, [location.state]);

  // Fetch movie details when component mounts or ID changes
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await moviesAPI.getMovieDetails(id);
        setMovie(response.data);
      } catch (err) {
        setError('Failed to fetch movie details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);
  
  // Function to handle back to search navigation
  const handleBackToSearch = () => {
    // If we have search history or came from search page, go back to search
    if (hasSearchHistory) {
      navigate('/movies/search');
    } else {
      // Otherwise try browser back navigation first
      try {
        navigate(-1);
      } catch (err) {
        console.error('Error navigating back:', err);
        // Fallback to search page
        navigate('/movies/search');
      }
    }
  };

  // Function to save movie to collection
  const saveToCollection = async () => {
    setSaveStatus({ saving: true, success: false, error: '' });
    
    try {
      if (!movie || !movie.imdbID || !movie.Title) {
        throw new Error('Invalid movie data. Missing required fields.');
      }
      
      // Determine if this is a game based on title, platform, or other factors
      let contentType = movie.Type || 'movie';
      
      // Check if this is a game based on known game platforms or titles
      const titleLower = movie.Title ? movie.Title.toLowerCase() : '';
      const isGamePlatform = movie.Poster && (
        movie.Poster.includes('xbox') || 
        movie.Poster.includes('playstation') || 
        movie.Poster.includes('nintendo') ||
        titleLower.includes('game')
      );
      
      // Special case for known games
      if (isGamePlatform || 
          titleLower.includes('disney infinity') || 
          titleLower.includes('the godfather game') || 
          (titleLower.includes('godfather') && movie.Poster && movie.Poster.toLowerCase().includes('xbox'))) {
        contentType = 'game';
        console.log('Identified as a game based on platform/title:', movie.Title);
      }
      
      // Extract relevant movie data and ensure all fields exist with default values if needed
      // IMPORTANT: Field names must match database columns exactly (snake_case)
      const movieData = {
        imdb_id: movie.imdbID, // Using snake_case to match database column
        title: movie.Title,
        poster: movie.Poster !== 'N/A' ? movie.Poster : '',
        year: movie.Year || '',
        runtime: movie.Runtime || '',
        imdb_rating: movie.imdbRating || '', // Using snake_case to match database column
        language: movie.Language || '',
        type: contentType // Use our enhanced content type detection
      };
      
      // Log the content type to confirm it's being correctly handled
      console.log('Saving content with type:', contentType, '(Original type:', movie.Type, ')');
      console.log('Saving movie:', movieData);
      
      try {
        const response = await moviesAPI.saveMovie(movieData);
        console.log('Save response:', response.data);
        
        setSaveStatus({ 
          saving: false, 
          success: true, 
          error: '' 
        });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        let errorMessage = 'Failed to save movie. Please try again.';
        
        if (apiError.response) {
          console.log('Error response:', apiError.response);
          errorMessage = apiError.response.data?.message || errorMessage;
          if (apiError.response.data?.error) {
            console.error('Server error details:', apiError.response.data.error);
          }
        }
        
        setSaveStatus({ 
          saving: false, 
          success: false, 
          error: errorMessage 
        });
      }
    } catch (err) {
      console.error('Client-side error:', err);
      setSaveStatus({ 
        saving: false, 
        success: false, 
        error: err.message || 'Failed to process movie data'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium mt-4">Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-6" role="alert">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="font-bold text-lg">{error || 'Movie not found'}</p>
          </div>
          <p className="text-sm mb-4">We couldn't retrieve the details for this movie. Please try again or go back.</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if a valid poster is available
  const isPosterAvailable = movie.Poster && movie.Poster !== 'N/A' && !imageError;

  return (
    <div className="max-w-6xl mx-auto p-4 mb-12">
      <div className="mb-6">
        <button 
          onClick={handleBackToSearch} 
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors shadow-sm"
        >
          <FiArrowLeft className="mr-2" />
          {hasSearchHistory ? 'Back to Search Results' : 'Back to Search'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="md:flex">
          {/* Poster column */}
          <div className="md:w-1/3 p-6">
            {isPosterAvailable ? (
              <img 
                src={movie.Poster} 
                alt={`${movie.Title} poster`} 
                className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300" 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg shadow-md">
                <FiFilm className="h-20 w-20 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center font-medium">No poster available</p>
              </div>
            )}
          </div>
          {/* Movie details column */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center">
              {movie.Title} 
              <span className="flex items-center text-gray-600 ml-2 text-xl">
                <FiCalendar className="inline-block mr-1" />
                ({movie.Year})
              </span>
            </h1>
            
            <div className="flex flex-wrap items-center text-gray-600 mb-4">
              {movie.Runtime !== 'N/A' && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg shadow-sm mr-4">
                  <FiClock className="h-4 w-4 text-indigo-500 mr-1" />
                  <span className="text-gray-700">{movie.Runtime}</span>
                </div>
              )}
              <span>{movie.Rated}</span>
            </div>
            
            <div className="mb-6">
              {movie.Type && (
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wide shadow-sm">
                    {movie.Type}
                  </span>
                </div>
              )}
            </div>
            
            {movie.imdbRating !== 'N/A' && (
              <div className="mb-6">
                <div className="inline-flex items-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <FiStar className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium text-gray-800">{movie.imdbRating}</span>
                  <span className="text-gray-600">/10 IMDb Rating</span>
                </div>
              </div>
            )}
            
            {movie.Rated !== 'N/A' && (
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg shadow-sm">
                <FiAward className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-gray-700">{movie.Rated}</span>
              </div>
            )}
            
            <div className="bg-gray-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Plot Summary</h3>
              <p className="text-gray-700 italic">{movie.Plot}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 mb-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              {movie.Director !== 'N/A' && (
                <div className="flex items-start">
                  <FiEdit3 className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <span className="text-gray-600 font-semibold block">Director</span> 
                    <span className="text-gray-800">{movie.Director}</span>
                  </div>
                </div>
              )}
              
              {movie.Writer !== 'N/A' && (
                <div className="flex items-start">
                  <FiEdit3 className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <span className="text-gray-600 font-semibold block">Writer</span> 
                    <span className="text-gray-800">{movie.Writer}</span>
                  </div>
                </div>
              )}
              
              {movie.Actors !== 'N/A' && (
                <div className="flex items-start">
                  <FiUsers className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <span className="text-gray-600 font-semibold block">Actors</span> 
                    <span className="text-gray-800">{movie.Actors}</span>
                  </div>
                </div>
              )}
              
              {movie.Language !== 'N/A' && (
                <div className="flex items-start">
                  <FiGlobe className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <span className="text-gray-600 font-semibold block">Language</span> 
                    <span className="text-gray-800">{movie.Language}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={saveToCollection}
                  disabled={saveStatus.saving}
                  className="flex items-center px-5 py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {saveStatus.saving ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      <span>Saving to collection...</span>
                    </>
                  ) : (
                    <>
                      <FiBookmark className="h-5 w-5 mr-2" />
                      <span>Save to My Collection</span>
                    </>
                  )}
                </button>
                
                <Link 
                  to="/movies/collection" 
                  className="inline-flex items-center px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                >
                  <FiLayers className="h-5 w-5 mr-2 text-indigo-500" />
                  View Collection
                </Link>
              </div>
              
              {/* Success message */}
              {saveStatus.success && (
                <div className="flex items-center bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-lg shadow-sm mt-4" role="alert">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <span className="font-medium">Success!</span>
                    <span className="block sm:inline ml-1">Movie added to your collection!</span>
                  </div>
                </div>
              )}
              
              {/* Error display */}
              {saveStatus.error && (
                <div className="flex items-center bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-sm mt-4" role="alert">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <span className="font-medium">Error:</span>
                    <span className="block sm:inline ml-1">{saveStatus.error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
