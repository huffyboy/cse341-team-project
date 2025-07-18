// Integration tests for user routes using supertest
import request from 'supertest';
import express from 'express';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the middlewares
const mockAuthMiddleware = jest.fn((req, res, next) => {
	req.user = { _id: 'mockUserId123', name: 'Mock User' };
	next();
});

// Mock validation middlewares
const mockValidateUserProfileUpdate = jest.fn((req, res, next) => next());
const mockValidateAddUserMovie = jest.fn((req, res, next) => next());
const mockValidateUserMovieStatusUpdate = jest.fn((req, res, next) => next());
const mockValidateUserMovieReviewGet = jest.fn((req, res, next) => next());
const mockValidateUserMovieReviewCreation = jest.fn((req, res, next) => next());
const mockValidateUserMovieReviewUpdate = jest.fn((req, res, next) => next());
const mockValidateUserMoviePathParams = jest.fn((req, res, next) => next());

// Mock authentication middleware
await jest.unstable_mockModule('../../src/middlewares/authMiddleware.js', () => ({
	__esModule: true,
	default: mockAuthMiddleware,
}));

// Mock review validators
await jest.unstable_mockModule('../../src/middlewares/reviewValidators.js', () => ({
	__esModule: true,
	reviewBodyValidationRules: [(req, res, next) => next()],
}));

// Mock movie validators
await jest.unstable_mockModule('../../src/middlewares/movieValidators.js', () => ({
	__esModule: true,
	movieIdParamValidationRules: [(req, res, next) => next()],
}));

// Mock user validators
await jest.unstable_mockModule('../../src/middlewares/userValidators.js', () => ({
	__esModule: true,
	validateUserProfileUpdate: mockValidateUserProfileUpdate,
	validateAddUserMovie: mockValidateAddUserMovie,
	validateUserMovieStatusUpdate: mockValidateUserMovieStatusUpdate,
	validateUserMovieReviewGet: mockValidateUserMovieReviewGet,
	validateUserMovieReviewCreation: mockValidateUserMovieReviewCreation,
	validateUserMovieReviewUpdate: mockValidateUserMovieReviewUpdate,
	validateUserMoviePathParams: mockValidateUserMoviePathParams,
}));

// Mock the user controller functions
const mockUpdateUserProfile = jest.fn();
const mockDeleteUserAccount = jest.fn();
const mockGetUserMovies = jest.fn();
const mockAddUserMovie = jest.fn();
const mockGetSingleUserMovie = jest.fn();
const mockUpdateUserMovie = jest.fn();
const mockDeleteUserMovie = jest.fn();
const mockGetUserReviews = jest.fn();
const mockCreateUserMovieReview = jest.fn();
const mockGetUserMovieReview = jest.fn();
const mockUpdateUserMovieReview = jest.fn();
const mockDeleteUserMovieReview = jest.fn();

await jest.unstable_mockModule('../../src/controllers/userController.js', () => ({
	__esModule: true,
	updateUserProfile: mockUpdateUserProfile,
	deleteUserAccount: mockDeleteUserAccount,
	getUserMovies: mockGetUserMovies,
	addUserMovie: mockAddUserMovie,
	getSingleUserMovie: mockGetSingleUserMovie,
	updateUserMovie: mockUpdateUserMovie,
	deleteUserMovie: mockDeleteUserMovie,
	getUserReviews: mockGetUserReviews,
	createUserMovieReview: mockCreateUserMovieReview,
	getUserMovieReview: mockGetUserMovieReview,
	updateUserMovieReview: mockUpdateUserMovieReview,
	deleteUserMovieReview: mockDeleteUserMovieReview,
}));

// Mock the models
const mockUserMovie = {
	aggregate: jest.fn(),
	findOne: jest.fn(),
	findById: jest.fn(),
	mockImplementation: jest.fn(),
};
const mockMovie = {
	findById: jest.fn(),
};
const mockReview = {
	findOne: jest.fn(),
};

await jest.unstable_mockModule('../../src/models/UserMovie.js', () => ({
	__esModule: true,
	default: mockUserMovie,
}));

await jest.unstable_mockModule('../../src/models/Movie.js', () => ({
	__esModule: true,
	default: mockMovie,
}));

await jest.unstable_mockModule('../../src/models/Review.js', () => ({
	__esModule: true,
	default: mockReview,
}));

// Import the routes after mocking
const { default: userRoutes } = await import('../../src/routes/userRoutes.js');

// Create test app
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack,
	});
});

describe('User Routes - Integration Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('PUT /users/me', () => {
		test('should update user profile with 200 status', async () => {
			// Arrange: Mock the controller response
			mockUpdateUserProfile.mockImplementation((req, res) => {
				res.status(200).json({
					message: 'Profile updated successfully',
					user: { _id: 'mockUserId123', name: 'Updated Name', email: 'updated@example.com' }
				});
			});

			// Arrange: Profile update data
			const profileData = {
				name: 'Updated Name',
				email: 'updated@example.com',
			};

			// Act: Make HTTP request to update profile
			const response = await request(app)
				.put('/users/me')
				.send(profileData)
				.expect(200);

			// Assert: Verify successful update
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('user');
			expect(response.body.message).toBe('Profile updated successfully');
		});

		test('should return 404 when user not found', async () => {
			// Arrange: Mock the controller to return 404
			mockUpdateUserProfile.mockImplementation((req, res) => {
				res.status(404).json({
					message: 'User not found'
				});
			});

			// Arrange: Profile update data
			const profileData = {
				name: 'Updated Name',
			};

			// Act: Make HTTP request with non-existent user
			const response = await request(app)
				.put('/users/me')
				.send(profileData)
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('DELETE /users/me', () => {
		test('should delete user account with 200 status', async () => {
			// Arrange: Mock the controller response
			mockDeleteUserAccount.mockImplementation((req, res) => {
				res.status(200).json({
					message: 'User account deleted successfully',
					userId: 'mockUserId123'
				});
			});

			// Act: Make HTTP request to delete account
			const response = await request(app).delete('/users/me').expect(200);

			// Assert: Verify successful deletion
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('userId');
			expect(response.body.message).toBe('User account deleted successfully');
		});

		test('should return 404 when user not found', async () => {
			// Arrange: Mock the controller to return 404
			mockDeleteUserAccount.mockImplementation((req, res) => {
				res.status(404).json({
					message: 'User not found'
				});
			});

			// Act: Make HTTP request with non-existent user
			const response = await request(app).delete('/users/me').expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('GET /users/me/movies', () => {
		test('should return user movie collection with 200 status', async () => {
			// Arrange: Mock the controller response
			mockGetUserMovies.mockImplementation((req, res) => {
				res.status(200).json({
					success: true,
					count: 1,
					data: [{ _id: 'usermovie1', status: 'watched' }]
				});
			});

			const response = await request(app).get('/users/me/movies').expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(1);
			expect(response.body.data[0]._id).toBe('usermovie1');
		});
	});

	describe('POST /users/me/movies', () => {
		test('should add movie to user collection with 201 status', async () => {
			// Arrange: Mock the controller response
			mockAddUserMovie.mockImplementation((req, res) => {
				res.status(201).json({
					success: true,
					message: 'Movie added to your collection.',
					data: {
						_id: 'usermovie456',
						movie: {
							_id: 'movie123',
							title: 'Inception',
						},
						status: 'planned_to_watch',
					}
				});
			});

			const response = await request(app)
				.post('/users/me/movies')
				.send({ movieId: 'movie123', status: 'planned_to_watch' })
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe('planned_to_watch');
			expect(response.body.data.movie.title).toBe('Inception');
		});
	});

	describe('GET /users/me/movies/:movieId', () => {
		test('should return specific user movie with 200 status', async () => {
			// Arrange: Mock the controller response
			mockGetSingleUserMovie.mockImplementation((req, res) => {
				res.status(200).json({
					success: true,
					data: {
						_id: 'usermovie1',
						status: 'watched',
						movie: {
							_id: 'movie123',
							title: 'The Lord of the Rings: The Fellowship of the Ring',
						},
					}
				});
			});

			const response = await request(app)
				.get('/users/me/movies/movie123')
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.movie.title).toBe(
				'The Lord of the Rings: The Fellowship of the Ring'
			);
		});

		test('should return 404 if movie is not in user collection', async () => {
			// Arrange: Mock the controller to return 404
			mockGetSingleUserMovie.mockImplementation((req, res) => {
				res.status(404).json({
					message: 'Movie not found in your collection. Add it to your list first or check the ID.'
				});
			});

			await request(app).get('/users/me/movies/notfound').expect(404);
		});
	});

	describe('GET /users/me/movies/:movieId/review', () => {
		test('should return user review for a specific movie with 200 status', async () => {
			// Arrange: Mock the controller response
			mockGetUserMovieReview.mockImplementation((req, res) => {
				res.status(200).json({
					_id: 'review789',
					user: 'mockUserId123',
					movie: 'movie123',
					rating: 5,
					message: 'This was a masterpiece!',
					createdAt: new Date().toISOString(),
				});
			});

			// Act: Make the API request.
			const response = await request(app)
				.get('/users/me/movies/movie123/review')
				.expect(200);

			// Assert: Check that the response body contains the correct review data.
			expect(response.body.rating).toBe(5);
			expect(response.body.message).toBe('This was a masterpiece!');
			expect(response.body._id).toBe('review789');
		});
	});
});
