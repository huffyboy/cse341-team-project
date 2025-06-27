import asyncHandler from 'express-async-handler';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';

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
	const { movieId } = req.params;
	try {
		const movie = await Movie.getMovieById(movieId);
		if (!movie) {
		  return res.status(404).json({ message: 'Movie not found' });
		}
		return res.json(movie);
	  } catch (err){
		return res.status(400).json({ message: 'Error retrieving movie' });
	  };

	res.status(200).json({
		message: 'Single movie details (stub)',
		movieId: req.params.movieId,
	});
});

// POST /movies
// Create a new movie in the global catalog
const createMovie = asyncHandler(async (req, res) => {
	const {
		title,
		year,
		rating,
		genre,
		length,
		description,
		director,
		posterUrl,
	} = req.body;

	// Check if movie with same title and year already exists
	const existingMovie = await Movie.findOne({ title, year });
	if (existingMovie) {
		res.status(409);
		throw new Error('Movie with this title and year already exists');
	}

	// Create new movie document
	const newMovie = new Movie({
		title,
		year,
		rating,
		genre,
		length,
		description,
		director,
		posterUrl,
	});

	// Save to database
	const savedMovie = await newMovie.save();

	res.status(201).json({
		success: true,
		message: 'Movie created successfully',
		data: savedMovie,
	});
});

// PUT /movies/:movieId
// Update a movie in the global catalog
const updateMovie = asyncHandler(async (req, res) => {
	const { movieId } = req.params;
	const updateData = req.body;

	// Check if movie exists before updating
	const existingMovie = await Movie.findById(movieId);
	if (!existingMovie) {
		res.status(404);
		throw new Error('Movie not found');
	}

	// If title and year are being updated, check for duplicates
	if (updateData.title && updateData.year) {
		const duplicateMovie = await Movie.findOne({
			title: updateData.title,
			year: updateData.year,
			_id: { $ne: movieId }, // Exclude current movie from duplicate check
		});
		if (duplicateMovie) {
			res.status(409);
			throw new Error('Movie with this title and year already exists');
		}
	}

	// Find movie by ID and update it
	const updatedMovie = await Movie.findByIdAndUpdate(movieId, updateData, {
		new: true, // Return the updated document
		runValidators: true, // Run schema validators on update
	});

	res.status(200).json({
		success: true,
		message: 'Movie updated successfully',
		data: updatedMovie,
	});
});

// DELETE /movies/:movieId
// Delete a movie from the global catalog
const deleteMovie = asyncHandler(async (req, res) => {
	const { movieId } = req.params;

	// Check if movie exists before deleting
	const existingMovie = await Movie.findById(movieId);
	if (!existingMovie) {
		res.status(404);
		throw new Error('Movie not found');
	}

	// Check for related reviews before deletion (optional requirement)
	const relatedReviews = await Review.find({ movie: movieId });
	if (relatedReviews.length > 0) {
		res.status(400);
		throw new Error('Cannot delete movie with existing reviews');
	}

	// Find and delete the movie
	const deletedMovie = await Movie.findByIdAndDelete(movieId);

	res.status(200).json({
		success: true,
		message: 'Movie deleted successfully',
		data: {
			id: deletedMovie._id,
			title: deletedMovie.title,
		},
	});
});

export { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
