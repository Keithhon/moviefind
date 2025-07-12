import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiGrid, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = ({ isAuthenticated, logout, user }) => {
  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V20M17 4V20M3 8H7M17 8H21M3 12H21M3 16H7M17 16H21M4 20H20C20.5523 20 21 19.5523 21 19V5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="ml-2 text-xl font-semibold text-gray-800">MovieFind</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/movies/search" 
                  className="flex items-center text-gray-600 hover:text-indigo-700 mx-3 transition duration-150 ease-in-out"
                >
                  <FiSearch className="mr-1" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
                <Link 
                  to="/movies/collection" 
                  className="flex items-center text-gray-600 hover:text-indigo-700 mx-3 transition duration-150 ease-in-out"
                >
                  <FiGrid className="mr-1" />
                  <span className="hidden sm:inline">My Collection</span>
                </Link>
                
                {/* User Menu */}
                <div className="ml-3 relative flex items-center">
                  <div className="flex items-center">
                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1 mr-3">
                      <FiUser className="mr-1 text-indigo-600" />
                      <span className="text-sm text-gray-800">
                        {user?.username || 'User'}
                      </span>
                    </div>
                    <button 
                      onClick={logout}
                      className="flex items-center bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-2 rounded-md transition duration-150 ease-in-out shadow-sm hover:shadow"
                    >
                      <FiLogOut className="mr-1" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-indigo-700 mx-3 transition duration-150 ease-in-out"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
