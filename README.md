# MovieFind

A full-stack web application for searching and saving your favorite movies.

## Features

- User authentication (register/login)
- Movie search using OMDb API
- View detailed movie information
- Save movies to your personal collection
- View and manage your movie collection

## Tech Stack

### Frontend

- React
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express
- JWT for authentication
- bcrypt for password hashing

### Database

- MySQL

## Getting Started

1. Clone this repository
2. Install dependencies for both frontend and backend:

   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up your MySQL database
4. Create a `.env` file in the backend directory with your configuration
5. Start the backend server:
   ```
   cd backend
   npm start
   ```
6. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_DATABASE=moviefind
JWT_SECRET=your_jwt_secret
OMDB_API_KEY=your_omdb_api_key
```
