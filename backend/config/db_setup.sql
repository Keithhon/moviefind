-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS moviefind;

-- Use the database
USE moviefind;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Movies table
CREATE TABLE IF NOT EXISTS saved_movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  imdb_id VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  poster TEXT,
  year VARCHAR(10),
  runtime VARCHAR(20),
  imdb_rating VARCHAR(5),
  language VARCHAR(100),
  type VARCHAR(20) DEFAULT 'movie',
  plot TEXT,
  genre VARCHAR(255),
  director VARCHAR(255),
  actors TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
