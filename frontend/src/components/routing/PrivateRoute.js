import React from 'react';
import { Navigate } from 'react-router-dom';

// Component to protect routes that require authentication
const PrivateRoute = ({ isAuthenticated, loading, children }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;
