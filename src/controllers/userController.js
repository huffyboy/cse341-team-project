import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import UserMovie from '../models/UserMovie.js';

// USERS

// PUT /users/me
// Update current authenticated user's profile
const updateUserProfile = asyncHandler(async (req, res) => {
	try {
		const userId = req.user._id; // From 'ensureAuthenticated' middleware
		const updates = {
			name: req.body.name,
			email: req.body.email,
		};

		const updatedUser = await User.findByIdAndUpdate(userId, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ message: 'Profile updated successfully', user: updatedUser });
	} catch (err) {
		console.error('Update error:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /users/me
// Delete current authenticated user's account
const deleteUserAccount = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	// Find and delete the user
	const deletedUser = await User.findByIdAndDelete(userId);

	if (!deletedUser) {
		res.status(404);
		throw new Error('User not found');
	}

	// Also delete all reviews and movie statuses by this user
	await Review.deleteMany({ user: userId });
	await UserMovie.deleteMany({ user: userId });

	res.status(200).json({
		message: 'User account deleted successfully',
		userId: req.user?._id,
	});
});

// USER MOVIE COLLECTION

// GET  /users/me/movies
// Get all movies in the authenticated user's collection
const getUserMovies = asyncHandler(async (req, res) => {
	// const userId = req.user._id;
	// const { genre, year, status } = req.query; // Adjust as needed
	// Logic to fetch user's movies with filters

	res.status(200).json({
		message: "User's movie collection list",
		userId: req.user?._id,
		filters: req.query,
	});
});

// POST users/me/movies
// Add a movie to the authenticated user's collection
const addUserMovie = asyncHandler(async (req, res) => {
	// const userId = req.user._id;
	// const { movieId, status, userRating, notes } = req.body;
	// Logic to add and link movie to user's collection

	res.status(201).json({
		message: "Movie added to user's collection",
		userId: req.user?._id,
		data: req.body,
	});
});

// GET /users/me/movies/:movieId
// Get a specific movie from the authenticated user's collection
const getSingleUserMovie = asyncHandler(async (req, res) => {
	// const userId = req.user._id;
	// const { movieId } = req.params;
	// Logic to fetch a specific movie from user's collection

	res.status(200).json({
		message: "Specific movie from user's collection",
		userId: req.user?._id,
		movieId: req.params.movieId,
	});
});

// PUT /users/me/movies/:movieId
// Update a movie in the authenticated user's collection
const updateUserMovie = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;
	const { status } = req.body;
	// Logic to update user's movie entry
	const validStatuses = ['planned_to_watch', 'watching', 'watched', 'dropped'];
	if (!validStatuses.includes(status)) {
		return res.status(400).json({ message: 'Invalid status value' });
	}
	try {
		const updated = await UserMovie.findOneAndUpdate(
			{ user: userId, movie: movieId },
			{ status },
			{ new: true }
		);
		if (!updated) {
			return res
				.status(404)
				.json({ message: 'Movie not found in your collection' });
		}

		res.status(200).json({
			message: "User's movie entry updated",
			userId: req.user?._id,
			movieId: req.params.movieId,
			userMovie: updated,
		});
	} catch (err) {
		console.error('Error updating movie status:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /users/me/movies/:movieId
// Remove a movie from the authenticated user's collection
const deleteUserMovie = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;
	// Logic to remove movie from user's collection
	try {
		const deleted = await UserMovie.findOneAndDelete({
			user: userId,
			movie: movieId,
		});

		if (!deleted) {
			return res.status(200).json({
				message: "Movie removed from user's collection",
				userId: req.user?._id,
				movieId: req.params.movieId,
			});
		}

		res.json({ message: 'Movie removed from your collection' });
	} catch (err) {
		console.error('Error deleting movie:', err);
		res.status(500).json({ message: 'Server error' });
	}

	r;
});

// USER REVIEW SPECIFIC

// GET /users/me/reviews
// Get all reviews by the authenticated user
const getUserReviews = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.query;

	// Set our filters
	const filter = {
		user: userId,
	};
	if (movieId) {
		filter.movie = movieId;
	}

	// Fetch reviews by the current user
	const reviews = await Review.find(filter)
		.populate('movie', 'title year genre director posterUrl')
		.sort({ createdAt: -1 }); // Sort by newest first

	res.status(200).json({
		message: "User's reviews list",
		userId,
		count: reviews.length,
		reviews,
	});
});

// GET /users/me/movies/:movieId/review
// Get a review of a movie by the authenticated user
const getUserMovieReview = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;
	const review = await Review.findOne({ user: userId, movie: movieId });

	if (!review) {
		res.status(404); // Review Not Found
		throw new Error('Review by you for this movie not found.');
	}

	res.status(200).json(review);
});

// POST users/me/movies/:movieId/review
// Create a review of a movie by the authenticated user
const createUserMovieReview = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;
	const { rating, message } = req.body;

	// Checking if the movie exists
	const movieExists = await Movie.findById(movieId);
	if (!movieExists) {
		res.status(404);
		throw new Error('Movie not found, cannot create review.');
	}

	// Checking if the user has already reviewed this movie
	const existingReview = await Review.findOne({ user: userId, movie: movieId });
	if (existingReview) {
		res.status(409); // 409 Conflict
		throw new Error(
			'You have already reviewed this movie. Please update your existing review.'
		);
	}

	// Validation for rating and message - Express will do this later
	if (rating === undefined || message === undefined) {
		res.status(400);
		throw new Error(
			'Rating and review message are required to create a review.'
		);
	}
	if (typeof rating !== 'number' || rating < 1 || rating > 5) {
		res.status(400);
		throw new Error('Rating must be a number between 1 and 5.');
	}
	if (typeof message !== 'string' || message.trim() === '') {
		res.status(400);
		throw new Error('Review message cannot be empty.');
	}

	// Create and save the new review
	const newReview = new Review({
		user: userId,
		movie: movieId,
		rating,
		message,
	});

	await newReview.save();

	res.status(201).json(newReview); // 201 Created
});

// PUT /users/me/movies/:movieId/review
// Update a review of a movie by the authenticated user
const updateUserMovieReview = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;
	const { rating, message } = req.body; // Expecting rating and/or message for update

	// Need to update to express Validator
	if (rating === undefined || message === undefined) {
		res.status(400);
		throw new Error('Rating and message are required for updating a review.');
	}
	if (typeof rating !== 'number' || rating < 1 || rating > 5) {
		res.status(400);
		throw new Error('Rating must be a number between 1 and 5.');
	}
	if (typeof message !== 'string' || message.trim() === '') {
		res.status(400);
		throw new Error('Review message cannot be empty.');
	}

	// Find the review
	const review = await Review.findOne({ user: userId, movie: movieId });

	if (!review) {
		res.status(404);
		throw new Error(
			'Review by you for this movie not found. Unable to update.'
		);
	}

	// Found, let's update
	review.rating = rating;
	review.message = message;
	const updatedReview = await review.save();

	res.status(200).json(updatedReview);
});

// DELETE /users/me/movies/:movieId/review
// Delete the authenticated user's review for a specific movie
const deleteUserMovieReview = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { movieId } = req.params;

	// This will return the deleted doc
	const result = await Review.findOneAndDelete({
		user: userId,
		movie: movieId,
	});

	if (!result) {
		res.status(404);
		throw new Error(
			'Review by you for this movie not found, unable to delete.'
		);
	}

	res.status(200).json({ message: 'Review successfully deleted.' });
});

export {
	updateUserProfile,
	deleteUserAccount,
	getUserMovies,
	addUserMovie,
	getSingleUserMovie,
	updateUserMovie,
	deleteUserMovie,
	getUserReviews,
	createUserMovieReview,
	getUserMovieReview,
	updateUserMovieReview,
	deleteUserMovieReview,
};
