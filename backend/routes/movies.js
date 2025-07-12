const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const db = require('../config/db');

// @route   POST api/movies/search-by-title
// @desc    Search movies by title using OMDb API (50 results per page)
// @access  Private
router.post('/search-by-title', auth, async (req, res) => {
  const { title, page = 1, type = '' } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    // Calculate which 5 pages we need to fetch from OMDb API
    // Since OMDb returns 10 results per page, we need to fetch 5 pages to get 50 results
    const omdbStartPage = (page - 1) * 5 + 1; // Convert our page to OMDb page
    const omdbEndPage = omdbStartPage + 4; // Get 5 pages total
    
    let allResults = [];
    let totalResults = 0;
    
    // Create an array of promises for parallel requests
    const requests = [];
    
    for (let omdbPage = omdbStartPage; omdbPage <= omdbEndPage; omdbPage++) {
      // Create params object with required fields
      const params = {
        apikey: process.env.OMDB_API_KEY || '73eb9cf4', // Using provided API key as fallback
        s: title,
        page: omdbPage
      };
      
      // Only add type parameter if it's provided and not empty
      if (type && type !== 'any') {
        params.type = type.toLowerCase();
      }
      
      requests.push(axios.get('https://www.omdbapi.com/', { params }));
    }
    
    // Execute all requests in parallel
    const responses = await Promise.allSettled(requests);
    
    // Process the responses
    responses.forEach(response => {
      if (response.status === 'fulfilled' && 
          response.value.data && 
          response.value.data.Response === 'True') {
        
        // Get total results from the first successful response
        if (!totalResults) {
          totalResults = parseInt(response.value.data.totalResults);
        }
        
        // Add movies to the combined results
        if (response.value.data.Search && Array.isArray(response.value.data.Search)) {
          allResults = [...allResults, ...response.value.data.Search];
        }
      }
    });
    
    if (allResults.length === 0) {
      return res.status(404).json({ message: 'No movies found' });
    }
    
    // Create a new response object with the combined results
    const combinedResponse = {
      Response: 'True',
      Search: allResults,
      totalResults: totalResults,
      // Include original page number for frontend reference
      requestedPage: page
    };

    res.json(combinedResponse);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// IMPORTANT: This route must be defined BEFORE the /:id route
// @route   GET api/movies/collection
// @desc    Get user's saved movies
// @access  Private
router.get('/collection', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching movie collection for user ID:', userId);
    
    // Get user's saved movies
    const [rows] = await db.execute(
      'SELECT * FROM saved_movies WHERE user_id = ? ORDER BY saved_at DESC',
      [userId]
    );

    console.log(`Found ${rows.length} movies in collection`);
    // Always return an array, even if empty
    res.json(rows || []);
  } catch (error) {
    console.error('Error fetching saved movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/movies/:id
// @desc    Get movie details by IMDB ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  const imdbId = req.params.id;

  try {
    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: process.env.OMDB_API_KEY || '73eb9cf4', // Using provided API key as fallback
        i: imdbId,
        plot: 'full'
      }
    });

    if (response.data.Response === 'False') {
      return res.status(404).json({ message: response.data.Error || 'Movie not found' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/movies/save
// @desc    Save a movie to user's collection
// @access  Private
router.post('/save', auth, async (req, res) => {
  const userId = req.user.id;
  console.log('Saving movie for user ID:', userId);
  console.log('Request body:', JSON.stringify(req.body));
  
  // Safety check for user ID
  if (!userId) {
    console.error('Missing user ID in request');
    return res.status(401).json({ message: 'User authentication failed' });
  }

  try {
    const { 
      imdb_id, // Changed to match frontend and database naming convention
      title, 
      poster, 
      year, 
      runtime, 
      imdb_rating, // Changed to match frontend and database naming convention
      language,
      type // Content type: movie, series, or game
    } = req.body;

    // Validate required fields
    if (!imdb_id || !title) {
      console.error('Missing required fields', { imdb_id, title });
      return res.status(400).json({ message: 'Movie ID and title are required' });
    }

    // Truncate long fields to match database column limits
    const truncatedTitle = title?.substring(0, 255) || '';
    const truncatedYear = year?.substring(0, 10) || '';
    const truncatedRuntime = runtime?.substring(0, 20) || '';
    const truncatedLanguage = language?.substring(0, 100) || '';
    
    console.log('Checking if movie exists in collection...');
    try {
      // Check if movie is already saved by the user
      const [existingMovies] = await db.execute(
        'SELECT * FROM saved_movies WHERE user_id = ? AND imdb_id = ?',
        [userId, imdb_id]
      );

      if (existingMovies.length > 0) {
        console.log('Movie already exists in collection');
        return res.status(400).json({ message: 'Movie already saved in your collection' });
      }
      
      console.log('Movie not found in collection, proceeding to save');

      // Prepare data with defaults for any missing fields - only include columns that exist in the database
      const movieData = [
        userId,
        imdb_id || '',
        truncatedTitle,
        poster || 'N/A',
        truncatedYear,
        truncatedRuntime,
        imdb_rating?.substring(0, 5) || '',
        truncatedLanguage,
        type || 'movie' // Default to movie if not specified
      ];

      console.log('Executing database insert with data:', movieData);
      // Save the movie - only include columns that exist in the database
      const [result] = await db.execute(
        `INSERT INTO saved_movies 
        (user_id, imdb_id, title, poster, year, runtime, imdb_rating, language, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        movieData
      );

      console.log('Movie saved successfully with ID:', result.insertId);

      res.status(201).json({ 
        id: result.insertId,
        message: 'Movie added to your collection'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ 
        message: 'Database error while saving movie', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      message: 'Failed to save movie to collection', 
      error: error.message 
    });
  }
});

// @route   DELETE api/movies/:id
// @desc    Delete a saved movie
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.id;
    
    console.log(`Deleting movie ID ${movieId} for user ID ${userId}`);
    
    // Delete the movie if it belongs to the user
    const [result] = await db.execute(
      'DELETE FROM saved_movies WHERE id = ? AND user_id = ?',
      [movieId, userId]
    );

    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Movie not found or not authorized' });
    }

    res.json({ message: 'Movie removed from collection' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
