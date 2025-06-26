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

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router
	.route('/me')
	.put(validateUserProfileUpdate, updateUserProfile)
	.delete(deleteUserAccount);

/**
 * @swagger
 * /users/me/movies:
 *   get:
 *     summary: Get user's movie collection
 *     description: Retrieve all movies in the authenticated user's collection
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User's movie collection
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserMovie'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Add movie to user's collection
 *     description: Add a movie to the authenticated user's collection with a watch status
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID of the movie to add
 *               status:
 *                 type: string
 *                 enum: [planned_to_watch, watching, watched, dropped]
 *                 default: planned_to_watch
 *                 description: Watch status for the movie
 *     responses:
 *       201:
 *         description: Movie added to collection successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMovie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router
	.route('/me/movies')
	.get(getUserMovies)
	.post(validateAddUserMovie, addUserMovie);

/**
 * @swagger
 * /users/me/movies/{movieId}/review:
 *   get:
 *     summary: Get user's review for a specific movie
 *     description: Retrieve the authenticated user's review for a specific movie
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: User's review for the movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Create user's review for a movie
 *     description: Create a new review for a movie by the authenticated user
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - message
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5)
 *               message:
 *                 type: string
 *                 description: Review message
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update user's review for a movie
 *     description: Update the authenticated user's review for a specific movie
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5)
 *               message:
 *                 type: string
 *                 description: Review message
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete user's review for a movie
 *     description: Delete the authenticated user's review for a specific movie
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router
	.route('/me/movies/:movieId/review')
	.get(validateUserMovieReviewGet, getUserMovieReview)
	.post(validateUserMovieReviewCreation, createUserMovieReview)
	.put(validateUserMovieReviewUpdate, updateUserMovieReview)
	.delete(validateUserMoviePathParams, deleteUserMovieReview);

/**
 * @swagger
 * /users/me/movies/{movieId}:
 *   get:
 *     summary: Get specific movie in user's collection
 *     description: Retrieve a specific movie from the authenticated user's collection
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie in user's collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMovie'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update movie status in user's collection
 *     description: Update the watch status of a movie in the authenticated user's collection
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planned_to_watch, watching, watched, dropped]
 *                 description: New watch status
 *     responses:
 *       200:
 *         description: Movie status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMovie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Remove movie from user's collection
 *     description: Remove a movie from the authenticated user's collection
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie removed from collection successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movie removed from collection"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router
	.route('/me/movies/:movieId')
	.get(validateUserMoviePathParams, getSingleUserMovie)
	.put(validateUserMovieStatusUpdate, updateUserMovie)
	.delete(validateUserMoviePathParams, deleteUserMovie);

/**
 * @swagger
 * /users/me/reviews:
 *   get:
 *     summary: Get user's reviews
 *     description: Retrieve all reviews by the authenticated user, optionally filtered by movie ID
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: Optional movie ID to filter reviews
 *     responses:
 *       200:
 *         description: User's reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/me/reviews').get(getUserReviews);

export default router;
