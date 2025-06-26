import asyncHandler from 'express-async-handler';
// import Movie from '../models/Movie.js';

// GET /api/v1/movies
// Get all movies from the global catalog
const getAllMovies = asyncHandler(async (req, res) => {
	// const { genre, year, director, titleSearch } = req.query; // example
	// Logic to fetch all movies with filters

	res.status(200).json({
		message: 'List of all movies (stub)',
		filters: req.query,
	});
});

// GET /api/v1/movies/:movieId
// Get a single movie by ID from the global catalog
const getMovieById = asyncHandler(async (req, res) => {
	// const { movieId } = req.params;

	res.status(200).json({
		message: 'Single movie details (stub)',
		movieId: req.params.movieId,
	});
});

// POST /movies
// Create a new movie in the global catalog
const createMovie = asyncHandler(async (req, res) => {
	// const { title, year, rating, genre, length, description, director } = req.body;
	// Logic to create a new movie

	res.status(201).json({
		message: 'Movie created (stub)',
		data: req.body,
	});
});

// PUT /movies/:movieId
// Update a movie in the global catalog
const updateMovie = asyncHandler(async (req, res) => {
	// const { movieId } = req.params;
	// const updateData = req.body;
	// Logic to update a movie

	res.status(200).json({
		message: 'Movie updated (stub)',
		movieId: req.params.movieId,
		data: req.body,
	});
});

// DELETE /movies/:movieId
// Delete a movie from the global catalog
const deleteMovie = asyncHandler(async (req, res) => {
	// const { movieId } = req.params;
	// Logic to delete a movie

	res
		.status(200)
		.json({ message: 'Movie deleted (stub)', movieId: req.params.movieId });
});

export { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
