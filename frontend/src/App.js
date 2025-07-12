import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/layout/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MovieSearch from './components/movies/MovieSearch';
import MovieDetails from './components/movies/MovieDetails';
import MovieCollection from './components/movies/MovieCollection';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by verifying token in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Load user data
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    }
    
    setLoading(false);
  }, []);

  // Login user
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#4CAF50',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#F44336',
              color: '#fff',
            },
          },
        }}
      />
      <Navbar isAuthenticated={isAuthenticated} logout={logout} user={user} />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Login login={login} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Register login={login} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/movies/search" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                <MovieSearch />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/movies/:id" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                <MovieDetails />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/movies/collection" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} loading={loading}>
                <MovieCollection />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
