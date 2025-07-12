import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiInfo, FiStar, FiFilm, FiCalendar } from 'react-icons/fi';

const MovieCard = ({ movie, saveSearchState, searchTerm, contentType, pagination, allMovies, movies }) => {
  // Get current location to pass as state to detail page
  const location = useLocation();
  // State to track image loading errors
  const [hasImageError, setHasImageError] = React.useState(false);
  
  // Validate if the poster URL is actually valid and not empty
  const isPosterValid = (url) => {
    if (!url || url === 'N/A' || url.trim() === '') return false;
    // Check for common issues in the OMDb API responses
    if (url.includes('null') || url === 'https://' || url === 'http://') return false;
    return true;
  };
  
  const isPosterAvailable = isPosterValid(movie.Poster) && !hasImageError;
  
  // Get appropriate type badge styles
  const getTypeBadgeClasses = (type) => {
    switch(type) {
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
  
  const handleCardClick = () => {
    if (saveSearchState && searchTerm) {
      // Save the latest state before navigating
      saveSearchState(
        searchTerm,
        contentType,
        pagination.currentPage,
        allMovies && allMovies.length ? allMovies : movies,
        pagination.totalResults
      );
    }
  };
  return (
    <Link 
      to={`/movies/${movie.imdbID}`}
      state={{ from: location.pathname }}
      onClick={handleCardClick}
    >
      <div className="movie-card bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden h-full flex flex-col transform transition duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="h-64 sm:h-72 overflow-hidden relative bg-gray-50 border-b border-gray-100">
          
          {/* IMDb Rating Badge - Top Right */}
          <div className="absolute top-0 right-0 z-10 m-2">
            <div className="flex items-center space-x-1 bg-gray-900 bg-opacity-70 text-white px-2 py-1 rounded-md text-xs border border-gray-700">
              <FiStar className="text-yellow-400" />
              <span>{movie.imdbRating || movie.rating || '8.3'}</span>
            </div>
          </div>
          
          {/* Image or Placeholder */}
          {isPosterAvailable ? (
            <>
              <div className="flex justify-center items-center w-full h-full p-2">
                <img 
                  src={movie.Poster} 
                  alt={`${movie.Title} poster`}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105 rounded-sm"
                  onError={() => setHasImageError(true)}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-center p-4">
              <div>
                <FiFilm className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No Image Available</p>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">{movie.Title}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-800">{movie.Title}</h3>
          
          {/* Year and Type */}
          <div className="mt-auto pt-3 flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <FiCalendar className="mr-1.5 text-sm text-gray-500" />
              <p className="text-sm font-medium">{movie.Year}</p>
            </div>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTypeBadgeClasses(movie.Type)}`}>
              {movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Button Section */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md text-sm font-medium py-2 transition-all duration-150 ease-in-out shadow-sm">
            <FiInfo className="mr-2" /> View Details
          </button>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
