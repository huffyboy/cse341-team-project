import express from 'express';
import {
	getAllMovies,
	getMovieById,
	createMovie,
	updateMovie,
	deleteMovie,
} from '../controllers/movieController.js';
import {
	getMovieReviews,
	updateReview,
	deleteReview,
} from '../controllers/reviewController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';
import {
	validateMovieCreation,
	validateMovieUpdate,
	validateMovieId,
	validateMovieListQuery,
} from '../middlewares/movieValidators.js';
import {
	validateReviewUpdate,
	validateReviewId,
} from '../middlewares/reviewValidators.js';

const router = express.Router();

// All movie listings
router
	.route('/')
	.get(validateMovieListQuery, getAllMovies)
	.post(ensureAuthenticated, validateMovieCreation, createMovie);

// Specific Movie from the global database
router
	.route('/:movieId')
	.get(validateMovieId, getMovieById)
	.put(
		ensureAuthenticated, // Don't want to allow this behavior unless authenticated user
		validateMovieUpdate,
		updateMovie
	)
	.delete(ensureAuthenticated, validateMovieId, deleteMovie);

// Routes for reviews related to a specific movie
router
	.route('/:movieId/reviews')
	.get(validateMovieId, getMovieReviews)

	// I THINK WE CAN DELETE THESE ROUTES
	.put(
		// Generic Administrative
		ensureAuthenticated,
		validateReviewUpdate,
		updateReview
	)
	.delete(
		// Generic Administrative
		ensureAuthenticated,
		validateReviewId,
		deleteReview
	);

export default router;
