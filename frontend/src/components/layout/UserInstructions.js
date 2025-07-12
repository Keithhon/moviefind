import React, { useState } from 'react';
import { FiSearch, FiSave, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const UserInstructions = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-8 transition-all duration-300 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-indigo-600 mr-2">🎬</span> How to Use MovieFind
        </h2>
        <button 
          onClick={toggleCollapse} 
          className="text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
          aria-label={isCollapsed ? "Expand instructions" : "Collapse instructions"}
        >
          {isCollapsed ? <FiChevronDown className="h-6 w-6" /> : <FiChevronUp className="h-6 w-6" />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
          {/* Step 1 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <FiSearch className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-800">Search for Movies</h3>
            </div>
            <p className="text-sm text-gray-700">
              Enter a movie title in the search bar below and click the "Search" button to find movies from the OMDb API.
            </p>
            <p className="text-sm text-blue-600 mt-2 font-medium">
              Example: Try typing "Inception"
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 rounded-full p-2 mr-3">
                <FiSave className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-800">Save to Collection</h3>
            </div>
            <p className="text-sm text-gray-700">
              Click any movie from the search results to view details. Then click "Save to Collection" to store it to your personal list.
            </p>
            <p className="text-sm text-purple-600 mt-2 font-medium">
              Save your favorite movies for easy access
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <FiTrash2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800">Manage Collection</h3>
            </div>
            <p className="text-sm text-gray-700">
              Navigate to the "My Collection" tab to view all saved movies. Click on a movie to view it again or click Delete to remove it.
            </p>
            <p className="text-sm text-green-600 mt-2 font-medium">
              Organize and maintain your movie library
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInstructions;
