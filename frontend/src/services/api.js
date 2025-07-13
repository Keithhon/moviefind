import axios from 'axios';

const baseURL = '/api';

// Create an instance of axios with default config
const api = axios.create({
  baseURL
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUser: () => api.get('/auth/user')
};

// Movies API services
export const moviesAPI = {
  searchMovies: (title, page = 1, type = '') => api.post('/movies/search-by-title', { title, page, type }),
  getMovieDetails: (id) => api.get(`/movies/${id}`),
  getSavedMovies: () => {
    console.log('Fetching saved movies collection');
    return api.get('/movies/collection')
      .then(response => {
        console.log('Get saved movies response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error getting saved movies:', error.response?.data || error.message);
        throw error;
      });
  },
  saveMovie: (movieData) => {
    console.log('Sending saveMovie request with data:', movieData);
    return api.post('/movies/save', movieData)
      .then(response => {
        console.log('Save movie API success response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Save movie API error:', error.response?.data || error.message);
        throw error;
      });
  },
  deleteMovie: (id) => {
    console.log('Sending delete request for movie ID:', id);
    return api.delete(`/movies/${id}`)
      .then(response => {
        console.log('Delete movie API success response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Delete movie API error:', error.response?.data || error.message);
        throw error;
      });
  }
};

export default api;
