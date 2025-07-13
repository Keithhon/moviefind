import React from 'react';
import { FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">MovieFind</h2>
            <p className="text-gray-300 text-sm">Find and save your favorite movies</p>
          </div>
          
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end mb-3">
              <a 
                href="https://github.com/Keithhon/moviefind" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-300 p-1 hover:bg-gray-700 rounded-full"
                aria-label="View project on GitHub"
                title="View project on GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Conestoga College. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by OMDb API
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
