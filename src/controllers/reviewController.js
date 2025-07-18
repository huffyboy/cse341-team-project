import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
// import Movie from '../models/Movie.js';

// Essentially Admin Controls for all reviews

// GET movies/:movieId/reviews
// Get all reviews for a specific movie
const getMovieReviews = asyncHandler(async (req, res) => {
	const { movieId } = req.params;

	// Logic to fetch all reviews for a movie
	const reviews = await Review.find({ movie: movieId })
		.populate('user', 'username') // only populate user's username
		.sort({ createdAt: -1 }); // newest reviews first

	res.status(200).json({
		success: true,
		message: "Movie's reviews list",
		movieId,
		count: reviews.length,
		data: reviews,
	});
});

// @route   /reviews/:reviewId
// Update a specific review
const updateReview = asyncHandler(async (req, res) => {
	const { movieId } = req.params;
	const { reviewId, rating, message } = req.body;

	// Validation
	if (!reviewId) {
		res.status(400);
		throw new Error('reviewId is required in the request body.');
	}
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
	const review = await Review.findById(reviewId);

	if (!review) {
		res.status(404);
		throw new Error('Review not found.');
	}

	if (review.movie !== movieId) {
		res.status(400);
		throw new Error('Review does not belong to the specified movie.');
	}

	// Update the review
	review.rating = rating;
	review.message = message;
	const updatedReview = await review.save();

	res.status(200).json(updatedReview);
});

// DELETE /reviews/:reviewId
// Delete a specific review
const deleteReview = asyncHandler(async (req, res) => {
	const { reviewId } = req.body;

	if (!reviewId) {
		res.status(400);
		throw new Error('reviewId is required in the request body.');
	}

	// Find and delete the review
	const deletedReview = await Review.findByIdAndDelete(reviewId);

	if (!deletedReview) {
		res.status(404);
		throw new Error('Review not found.');
	}

	res.status(200).json({
		message: 'Review deleted successfully',
		reviewId,
	});
});

// New controllers for /reviews/:reviewId routes
// @route   /reviews/:reviewId
// Update a specific review (reviewId from URL params)
const updateReviewByParams = asyncHandler(async (req, res) => {
	const { reviewId } = req.params;
	const { rating, message } = req.body;

	// Validation
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
	const review = await Review.findById(reviewId);

	if (!review) {
		res.status(404);
		throw new Error('Review not found.');
	}

	// Update the review
	review.rating = rating;
	review.message = message;
	const updatedReview = await review.save();

	res.status(200).json(updatedReview);
});

// DELETE /reviews/:reviewId
// Delete a specific review (reviewId from URL params)
const deleteReviewByParams = asyncHandler(async (req, res) => {
	const { reviewId } = req.params;

	// Find and delete the review
	const deletedReview = await Review.findByIdAndDelete(reviewId);

	if (!deletedReview) {
		res.status(404);
		throw new Error('Review not found.');
	}

	res.status(200).json({
		message: 'Review deleted successfully',
		reviewId,
	});
});

export {
	getMovieReviews,
	updateReview,
	deleteReview,
	updateReviewByParams,
	deleteReviewByParams,
};
