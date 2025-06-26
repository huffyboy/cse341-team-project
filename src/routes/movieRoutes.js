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

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve all movies from the database with optional filtering
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for movie title
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by release year
 *     responses:
 *       200:
 *         description: List of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *   post:
 *     summary: Create a new movie
 *     description: Add a new movie to the database (requires authentication)
 *     tags: [Movies]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 description: Movie title
 *               year:
 *                 type: number
 *                 description: Release year
 *               rating:
 *                 type: string
 *                 description: Content rating (PG-13, PG, etc.)
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of genres
 *               length:
 *                 type: number
 *                 description: Movie length in minutes
 *               description:
 *                 type: string
 *                 description: Movie description
 *               director:
 *                 type: string
 *                 description: Movie director
 *               posterUrl:
 *                 type: string
 *                 description: Movie poster URL
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Movie already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movie with this title and year already exists"
 */
router
	.route('/')
	.get(validateMovieListQuery, getAllMovies)
	.post(ensureAuthenticated, validateMovieCreation, createMovie);

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Get movie by ID
 *     description: Retrieve a specific movie by its ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update movie
 *     description: Update a movie's information (requires authentication)
 *     tags: [Movies]
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
 *               title:
 *                 type: string
 *                 description: Movie title
 *               year:
 *                 type: number
 *                 description: Release year
 *               rating:
 *                 type: string
 *                 description: Content rating (PG-13, PG, etc.)
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of genres
 *               length:
 *                 type: number
 *                 description: Movie length in minutes
 *               description:
 *                 type: string
 *                 description: Movie description
 *               director:
 *                 type: string
 *                 description: Movie director
 *               posterUrl:
 *                 type: string
 *                 description: Movie poster URL
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Movie already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movie with this title and year already exists"
 *   delete:
 *     summary: Delete movie
 *     description: Delete a movie from the database (requires authentication)
 *     tags: [Movies]
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
 *         description: Movie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Movie deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Deleted movie ID
 *                     title:
 *                       type: string
 *                       description: Deleted movie title
 *       400:
 *         description: Validation error or business logic error
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ValidationError'
 *               - schema:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Cannot delete movie with existing reviews"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router
	.route('/:movieId')
	.get(validateMovieId, getMovieById)
	.put(
		ensureAuthenticated, // Don't want to allow this behavior unless authenticated user
		validateMovieUpdate,
		updateMovie
	)
	.delete(ensureAuthenticated, validateMovieId, deleteMovie);

/**
 * @swagger
 * /movies/{movieId}/reviews:
 *   get:
 *     summary: Get movie reviews
 *     description: Retrieve all reviews for a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: List of movie reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a review (Administrative)
 *     description: Update a specific review for a movie (requires authentication)
 *     tags: [Movies]
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
 *               - reviewId
 *             properties:
 *               reviewId:
 *                 type: string
 *                 description: Review ID to update
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
 *     summary: Delete a review (Administrative)
 *     description: Delete a specific review for a movie (requires authentication)
 *     tags: [Movies]
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
 *               - reviewId
 *             properties:
 *               reviewId:
 *                 type: string
 *                 description: Review ID to delete
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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
