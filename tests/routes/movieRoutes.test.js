// Integration tests for movie routes using supertest
import request from 'supertest';
import express from 'express';
import mockingoose from 'mockingoose';
import mongoose from 'mongoose';	// To create mock auto-generated id hashes

import Review from '../../src/models/Review.js';
import Movie from '../../src/models/Movie.js';

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the middlewares
// We must mock 'ensureAuthenticated' to simply call next() and let the request proceed.
const mockAuthMiddleware = jest.fn((req, res, next) => next());

// For authenticating a user
await jest.unstable_mockModule('../../src/middlewares/authMiddleware.js', () => ({
	__esModule: true,
	default: mockAuthMiddleware,
}));

// for the movie
const mockValidator = jest.fn((req, res, next) => next());
await jest.unstable_mockModule('../../src/middlewares/movieValidators.js', () => ({
  // Need to mock ALL the validators to make the test simpler
  validateMovieId: mockValidator,
  validateMovieCreation: mockValidator,
  validateMovieUpdate: mockValidator,
  validateMovieListQuery: mockValidator,
}));

// For some reason it wasn't letting me straight import the movieRoutes without adding an await or it was throwing errors
const { default: movieRoutes } = await import(
	'../../src/routes/movieRoutes.js'
);

// Create test app
const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

app.use((req, res, next) => {
    req.user = { id: new mongoose.Types.ObjectId() };
    next();
});

describe('Movie Routes - Integration Tests', () => {

	beforeEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe('GET /movies', () => {
		test('Should return all movies with 200 status', async () => {
			// Arrange: Mock data that the "database" will return
			const mockMovies = [
				{ _id: 'id1', title: 'Inception', year: 2010 },
				{ _id: 'id2', title: 'The Matrix', year: 1999 },
			];
			mockingoose(Movie).toReturn(mockMovies, 'find');

			// Act: Make the HTTP request
			const response = await request(app).get('/movies');

			// Asserts
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(2);
			expect(response.body.data[0].title).toBe('Inception');
			expect(response.body.data[1].year).toBe(1999);
		});

		test('Returning movies based on filters', async () => {
			const movieId = new mongoose.Types.ObjectId().toString();

			const filteredMovie = [
				{
					_id: movieId,
					title: 'Inception',
					year: 2010,
					genre: ['Sci-Fi', 'Suspense'],
				},
			];

			// Mockingoose will match this mock to the `find` call
			mockingoose(Movie).toReturn(filteredMovie, 'find');

			// Act
			const response = await request(app).get('/movies?genre=Suspense&year=2010'); // These are our params for filters (imitating html route)

			// Asserts
			expect(response.status).toBe(200);
			expect(response.body.data.length).toBe(1);
			expect(response.body.data[0].year).toBe(2010);
			expect(response.body.data[0].title).toBe('Inception');
			expect(response.body.data[0]._id).toBe(movieId);
		});
	});

	describe('GET /movies/:movieId', () => {
		test('should return movie by ID with 200 status', async () => {
			const movieId = new mongoose.Types.ObjectId();

			const mockMovie = {
				_id: movieId,
				title: 'Test Movie',
				year: 2023
			};

			// Now we only need one mock, because the validator is bypassed
			mockingoose(Movie).toReturn(mockMovie, 'findOne');

			// Act
			const response = await request(app).get(`/movies/${movieId.toString()}`);

			// Assert
			expect(response.status).toBe(200);
			expect(response.body._id).toBe(movieId.toString());
		});

		test('should return 404 for non-existent movie', async () => {
			// Return null to mock no movie found
			mockingoose(Movie).toReturn(null, 'findById');

			// Act
			const response = await request(app).get('/movies/no_movie');

			// Assert
			expect(response.status).toBe(404);
		});
	});

	describe('POST /movies', () => {
		test('should create new movie with 201 status', async () => {
			const movieData = {
				title: 'Test Movie',
				year: 2023,
				genre: ['Action'],
				director: 'Test Director',
			};

			const movieId = new mongoose.Types.ObjectId().toString();

			// Explicitly mock BOTH database calls the controller makes.
			mockingoose(Movie).toReturn(null, 'findOne');

			// 2. Mock the save operation to return the document with a new _id.
			mockingoose(Movie).toReturn({ _id: movieId, ...movieData }, 'save');

			// Act: Make HTTP request to create movie
			const response = await request(app)
				.post('/movies')
				.send(movieData)
				.expect(201);

			// Asserts
			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Movie created successfully');
			expect(response.body.data.title).toBe('Test Movie');
			expect(response.body.data._id).toBe(movieId);
		});

		test('should return 409 when movie already exists', async () => {
			// Arrange: Duplicate movie data
			const movieData = {
				title: 'Existing Movie',
				year: 2023,
			};

			// This simulates the movie already being in the database because it's returning a movie with data
			mockingoose(Movie).toReturn(movieData, 'findOne');

			// Act: Make HTTP request with duplicate data
			const response = await request(app)
				.post('/movies')
				.send(movieData)
				.expect(409);

				// Assert
			expect(response.status).toBe(409);
			expect(response.text).toContain('Movie with this title and year already exists');
		});
	});

	describe('PUT /movies/:movieId', () => {
		// Let's start definining just once for all nested tests in this route
		const validMovieId = new mongoose.Types.ObjectId().toString();

		test('should update movie with 200 status', async () => {

			const updateData = {
				title: 'Updated Movie Title',
				year: 2024,
			};

			// Arrange: The original document that findById should return.
			const originalMovie = {
				_id: validMovieId,
				title: 'Original Movie Title',
				year: 2023,
			};

			// Arrange: The final document that findByIdAndUpdate should return.
			const updatedMovieDocument = {
				_id: validMovieId,
				...updateData, // The document now reflects the updates
			};

			// Mock return of the non updated movie
			mockingoose(Movie).toReturn(originalMovie, 'findOne');

			// Now, we mock the update
			mockingoose(Movie).toReturn(updatedMovieDocument, 'findOneAndUpdate');

			// Make the HTTP request to update the movie
			const response = await request(app)
				.put(`/movies/${validMovieId}`)
				.send(updateData)
				.expect(200);

			// Assert
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Movie updated successfully');
			expect(response.body.data.title).toBe('Updated Movie Title');
			expect(response.body.data.year).toBe(2024);
		});

		test('should return 404 when movie to update is not found', async () => {
			// Arrange: Some update data. It doesn't really matter what it is.
			const updateData = {
				title: 'This update will fail',
			};
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			// --- THE FIX: Mock the first database call to simulate "not found" ---
			// Mock the findById check to return null. This will trigger the error path.
			mockingoose(Movie).toReturn(null, 'findById');

			// Act: Make the HTTP request with an ID we know will "not be found".
			const response = await request(app)
				.put(`/movies/${nonExistentId}`)
				.send(updateData)
				.expect(404);

			// Assert: Verify the error response text, just like in the previous test.
			expect(response.status).toBe(404);
			expect(response.text).toContain('Movie not found');
		});
	});

	describe('DELETE /movies/:movieId', () => {
		const validMovieId = new mongoose.Types.ObjectId().toString();

		test('should delete movie with 200 status', async () => {
			// Arrange: The movie document that we expect to be "found" and then "deleted".
			const movieToDelete = {
				_id: validMovieId,
				title: 'Movie To Be Deleted',
				year: 2000,
			};

			// Mock the findMovie
			mockingoose(Movie).toReturn(movieToDelete, 'findOne');

			// Mock the `Review.find` check to return an empty array (no reviews).
			mockingoose(Review).toReturn([], 'find');

			// Mock the final delete call.
			mockingoose(Movie).toReturn(movieToDelete, 'findOneAndDelete');

			// Act: Make the HTTP request to delete the movie.
			const response = await request(app)
				.delete(`/movies/${validMovieId}`)
				.expect(200);

			// Asserts
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Movie deleted successfully');
			expect(response.body.data.id).toBe(validMovieId);
			expect(response.body.data.title).toBe('Movie To Be Deleted');
		});

		test('should return 400 when movie has reviews and CANNOT be deleted', async () => {
			// Arrange
			const movieWithReviews = {
				_id: validMovieId,
				title: 'Movie With Reviews',
			};

			// Mock review document.
			const existingReview = {
				_id: 'reviewId123',
				movie: validMovieId,
				rating: 5,
			};

			// Mock to return the movie.
			mockingoose(Movie).toReturn(movieWithReviews, 'findOne');

			// Mock `Review.find` to return an array with at least one review.
			mockingoose(Review).toReturn([existingReview], 'find');

			// Act: Make the HTTP request.
			const response = await request(app)
				.delete(`/movies/${validMovieId}`)
				.expect(400);

			// Assert: Check the error message in the response text.
			expect(response.status).toBe(400);
			expect(response.text).toContain('Cannot delete movie with existing reviews');
		});

		test('should return 404 when movie to delete is not found', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			// This will trigger the first `if` block and throw the 404 error.
			mockingoose(Movie).toReturn(null, 'findOne');

			// Act: Make the HTTP request.
			const response = await request(app)
				.delete(`/movies/${nonExistentId}`)
				.expect(404);

			// Assert
			expect(response.status).toBe(404);
			expect(response.text).toContain('Movie not found');
		});
	});

	describe('PUT /movies/:movieId/reviews', () => {
		const movieId = new mongoose.Types.ObjectId();
		const reviewId = new mongoose.Types.ObjectId();

		beforeEach(() => {
			mockingoose.resetAll();
			jest.clearAllMocks();
		});

		test('should update a review and return 200 status', async () => {
			// Arrange
			const updateData = {
				reviewId,
				rating: 5,
				message: 'This was an amazing movie!'
			};

			const originalReview = {
				_id: reviewId,
				rating: 3,
				message: 'It was okay.',
				save: jest.fn(),
			};

			const updatedReview = {
				_id: reviewId,
				rating: 5,
				message: 'This was an amazing movie!',
			};

			// Mock findById
			mockingoose(Review).toReturn(originalReview, 'findOne');

			// Mock the save method
			originalReview.save.mockResolvedValue(updatedReview);

			// Act
			const response = await request(app)
				.put(`/movies/${movieId.toString()}/reviews`)
				.send(updateData);

			// Assert
			expect(response.status).toBe(200);
			expect(response.body.rating).toBe(5);
			expect(response.body.message).toBe('This was an amazing movie!');

			// Verify the save method was called
			expect(originalReview.save).toHaveBeenCalled();
		});
	});

	// 	test('should update a review and return 200 status', async () => {
	// 		// Arrange
	// 		const updateData = { reviewId, rating: 5, message: 'This was an amazing movie!' };

	// 		// This is the document that findById will return.
	// 		const originalReview = {
	// 			_id: reviewId,
	// 			rating: 3,
	// 			message: 'It was okay.',
	// 			save: jest.fn(),
	// 		};

	// 		// This is what the mocked .save() method will return.
	// 		const updatedReview = {
	// 			_id: reviewId,
	// 			rating: 5,
	// 			message: 'This was an amazing movie!',
	// 		};

	// 		// 1. We only need ONE findById mock now, for the single call inside the controller.
	// 		mockingoose(Review).toReturn(originalReview, 'findOne');

	// 		// 2. Mock the .save() instance method.
	// 		originalReview.save.mockResolvedValue(updatedReview);

	// 		// Act
	// 		const response = await request(app)
	// 			.put(`/movies/${movieId}/reviews`)
	// 			.send(updateData)
	// 			.expect(200);

	// 		// Assert
	// 		expect(response.status).toBe(200);
	// 		expect(response.body.rating).toBe(5);
	// 		expect(response.body.message).toBe('This was an amazing movie!');
	// 	});

	// 	test('should return 404 if the review to update is not found', async () => {
	// 		// Arrange
	// 		const updateData = {
	// 			reviewId: reviewId,
	// 			rating: 5,
	// 			message: 'This update will fail.',
	// 		};

	// 		// Mock not finding a review to update
	// 		mockingoose(Review).toReturn(null, 'findById');

	// 		// Act
	// 		const response = await request(app)
	// 			.put(`/movies/${movieId}/reviews`)
	// 			.send(updateData)
	// 			.expect(404);

	// 		// Assert
	// 		expect(response.status).toBe(404);
	// 		expect(response.text).toContain('Review not found.');
	// 	});

	// 	test('should return 400 if required fields are missing', async () => {
	// 		// Arrange: Body is missing the 'message' field.
	// 		const incompleteData = {
	// 			reviewId: reviewId,
	// 			rating: 4,
	// 		};
	// 		// So, no DB mocks are needed here because the validation
	// 		// logic runs BEFORE any database calls.

	// 		// Act
	// 		const response = await request(app)
	// 			.put(`/movies/${movieId}/reviews`)
	// 			.send(incompleteData)
	// 			.expect(400);

	// 		// Assert
	// 		expect(response.status).toBe(400);
	// 		expect(response.text).toContain('Rating and message are required for updating a review.');
	// 	});

	// 	test('should return 400 for an invalid rating value', async () => {
	// 		// Arrange: Rating is out of bounds.
	// 		const badData = {
	// 			reviewId: reviewId,
	// 			rating: 10, // Invalid rating - must be between 1 and 5
	// 			message: 'A valid message',
	// 		};

	// 		// Act
	// 		const response = await request(app)
	// 			.put(`/movies/${movieId}/reviews`)
	// 			.send(badData)
	// 			.expect(400);

	// 		// Assert
	// 		expect(response.status).toBe(400);
	// 		expect(response.text).toContain('Rating must be a number between 1 and 5.');
	// 	});

	describe('DELETE /movies/:movieId/reviews', () => {
		test('should delete review for movie with 200 status', async () => {
		});
	});
});
