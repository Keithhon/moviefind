import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiSave, FiList } from 'react-icons/fi';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to MovieFind</h1>
        <p className="text-2xl text-gray-600">Your personal movie discovery and collection app</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="text-indigo-600 mr-3 text-4xl">🎬</span> How to Use MovieFind
          </h2>
          <Link to="/movies/search" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 px-6 rounded-lg transition-colors font-medium flex items-center text-lg">
            <FiSearch className="mr-2 h-5 w-5" /> Start Searching
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-blue-50 rounded-xl p-7 border border-blue-100 h-full flex flex-col shadow-sm">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 rounded-full p-4 mr-4">
                <FiSearch className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-800 text-xl">Search for Movies</h3>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              Enter a movie title in the search bar below and click the "Search" button to find movies from the OMDb API.
            </p>
            <div className="bg-white rounded-lg p-4 mt-auto border border-blue-100 shadow-sm">
              <p className="text-blue-600 font-medium mb-2 text-lg">Example:</p>
              <p className="text-gray-600 text-lg">Try typing "Inception"</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-purple-50 rounded-xl p-7 border border-purple-100 h-full flex flex-col shadow-sm">
            <div className="flex items-center mb-5">
              <div className="bg-purple-100 rounded-full p-4 mr-4">
                <FiSave className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-800 text-xl">Save to Collection</h3>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              Click any movie from the search results to view details. Then click "Save to Collection" to store it to your personal list.
            </p>
            <div className="bg-white rounded-lg p-4 mt-auto border border-purple-100 shadow-sm">
              <p className="text-purple-600 font-medium text-lg">Save your favorite movies for easy access</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-green-50 rounded-xl p-7 border border-green-100 h-full flex flex-col shadow-sm">
            <div className="flex items-center mb-5">
              <div className="bg-green-100 rounded-full p-4 mr-4">
                <FiList className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 text-xl">Manage Collection</h3>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              Navigate to the "My Collection" tab to view all saved movies. Click on a movie to view it again or click Delete to remove it.
            </p>
            <div className="bg-white rounded-lg p-4 mt-auto border border-green-100 shadow-sm">
              <p className="text-green-600 font-medium text-lg">Organize and maintain your movie library</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Buttons removed as requested */}
    </div>
  );
};

export default Dashboard;
