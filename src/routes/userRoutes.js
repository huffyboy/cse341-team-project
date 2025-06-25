import express from 'express';
// import { body, param } from 'express-validator';
import {
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
} from '../controllers/userController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';
import {
	validateUserProfileUpdate,
	validateAddUserMovie,
	validateUserMovieStatusUpdate,
	validateUserMovieReviewGet,
	validateUserMovieReviewCreation,
	validateUserMovieReviewUpdate,
	validateUserMoviePathParams, // For GET single user movie & DELETE user movie
} from '../middlewares/userValidators.js';

const router = express.Router();

// All routes here are protected and refer to the authenticated user ('/me')
router.use(ensureAuthenticated);

// Route for the user data
router
	.route('/me')
	.put(
		// Location of ## Swagger comments will go
		validateUserProfileUpdate,
		updateUserProfile
	)
	.delete(deleteUserAccount);

// Route for all the movies in User's Collection
router
	.route('/me/movies')
	.get(getUserMovies)
	.post(validateAddUserMovie, addUserMovie);

// Route for the user's specific review of a specific movie
router
	.route('/me/movies/:movieId/review')
	.get(validateUserMovieReviewGet, getUserMovieReview)
	.post(validateUserMovieReviewCreation, createUserMovieReview)
	.put(validateUserMovieReviewUpdate, updateUserMovieReview)
	.delete(validateUserMoviePathParams, deleteUserMovieReview);

// Routes for a specific movie in the user's collection (status management)
router
	.route('/me/movies/:movieId')
	.get(validateUserMoviePathParams, getSingleUserMovie)
	.put(validateUserMovieStatusUpdate, updateUserMovie)
	.delete(validateUserMoviePathParams, deleteUserMovie);

// This gets all user reviews, or one by ?movieId query
router.route('/me/reviews').get(getUserReviews);

export default router;
