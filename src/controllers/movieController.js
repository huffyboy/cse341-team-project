import asyncHandler from 'express-async-handler';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';

// GET /movies
// Get all movies from the global catalog
const getAllMovies = asyncHandler(async (req, res) => {
	const { genre, year, director, title } = req.query;

	// Build dynamic filter
	const filter = {};

	if (genre) filter.genre = genre;
	if (year) filter.year = Number(year); // Ensure year is numeric
	if (director) filter.director = director;

	// Case-insensitive partial match for title
	if (title) {
		filter.title = { $regex: title, $options: 'i' };
	}

	const movies = await Movie.find(filter);

	res.status(200).json({
		success: true,
		count: movies.length,
		data: movies,
	});
});

// GET /movies/:movieId
// Get a single movie by ID from the global catalog
const getMovieById = asyncHandler(async (req, res) => {
	const { movieId } = req.params;
	const movie = await Movie.findById(movieId);

	if (!movie) {
		res.status(404);
		throw new Error('Movie not found');
	}

	res.status(200).json(movie);
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

	// const title = existingMovie.title;
	// const id = existingMovie._id;

	// Find and delete the movie
	try {
		const deletedMovie = await Movie.findByIdAndDelete(movieId);
		if (!deletedMovie) {
			res.status(404);
			throw new Error('Movie not found during deletion');
		}

		res.status(200).json({
			success: true,
			message: 'Movie deleted successfully',
			data: {
				id: deletedMovie._id,
				title: deletedMovie.title,
			},
		});
	} catch (error) {
		res.status(500);
		throw new Error('Database connection failed');
	}
});

export { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
