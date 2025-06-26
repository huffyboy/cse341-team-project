import asyncHandler from 'express-async-handler';
// import Review from '../models/Review.js';
// import Movie from '../models/Movie.js';

// Essentially Admin Controls for all reviews

// GET movies/:movieId/reviews
// Get all reviews for a specific movie
const getMovieReviews = asyncHandler(async (req, res) => {
	// const { movieId } = req.params;
	// Logic to fetch all reviews for a movie

	res.status(200).json({
		message: 'List of reviews for a movie',
		movieId: req.params.movieId,
	});
});

// @route   /reviews/:reviewId
// Update a specific review
const updateReview = asyncHandler(async (req, res) => {
	// const { reviewId } = req.params;
	// const { rating, message } = req.body;
	// Logic to update a review,

	res.status(200).json({
		message: 'Review updated',
		reviewId: req.params.reviewId,
		data: req.body,
	});
});

// DELETE /reviews/:reviewId
// Delete a specific review
const deleteReview = asyncHandler(async (req, res) => {
	// const { reviewId } = req.params;
	// Logic to delete a review, ensuring user owns it

	res.status(200).json({
		message: 'Review deleted',
		reviewId: req.params.reviewId,
	});
});

export { getMovieReviews, updateReview, deleteReview };
