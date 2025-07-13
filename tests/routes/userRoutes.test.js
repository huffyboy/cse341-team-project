// Integration tests for user routes using supertest
import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/userRoutes.js';
import UserMovie from '../../src/models/UserMovie.js';
import Movie from '../../src/models/Movie.js';
import Review from '../../src/models/Review.js';

// Mocking Middleware
// This is the crucial part. We replace the actual 'ensureAuthenticated'
// with a mock version that automatically provides a `req.user` object.
const mockAuthMiddleware = (req, res, next) => {
	req.user = { _id: 'mockUserId123', name: 'Mock User' };
	next();
};

// Create test app
const app = express();
app.use(express.json());
app.use('/users', mockAuthMiddleware, userRoutes);

// Mocking Mongoose with jest
jest.mock('../../src/models/UserMovie.js');
jest.mock('../../src/models/Movie.js');
jest.mock('../../src/models/Review.js');

describe('User Routes - Integration Tests', () => {
	describe('PUT /users/me', () => {
		test('should update user profile with 200 status', async () => {
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
			// Act: Make HTTP request to delete account
			const response = await request(app).delete('/users/me').expect(200);

			// Assert: Verify successful deletion
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('userId');
			expect(response.body.message).toBe('User account deleted successfully');
		});

		test('should return 404 when user not found', async () => {
			// Act: Make HTTP request with non-existent user
			const response = await request(app).delete('/users/me').expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('GET /users/me/movies', () => {
		test('should return user movie collection with 200 status', async () => {
			const mockData = [{ _id: 'usermovie1', status: 'watched' }];
			UserMovie.aggregate.mockResolvedValue(mockData);

			const response = await request(app).get('/users/me/movies').expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.count).toBe(1);
			expect(response.body.data[0]._id).toBe('usermovie1');

			// Verify mock worked
			expect(
				UserMovie.aggregate.mock.calls[0][0][0].$match.user.toString()
			).toBe('mockUserId123');
		});
	});

	describe('POST /users/me/movies', () => {
		test('should add movie to user collection with 201 status', async () => {
			Movie.findById.mockResolvedValue({ _id: 'movie123', title: 'Inception' });
			UserMovie.findOne.mockResolvedValue(null); // Not already in collection
			// Mock the save() and populate() chain

			const save = jest.fn().mockResolvedValue(true);
			UserMovie.mockImplementation(() => ({ save }));
			UserMovie.findById.mockReturnValue({
				populate: jest.fn().mockResolvedValue({
					_id: 'usermovie456',
					movie: {
						_id: 'movie123',
						title: 'Inception',
					},
					status: 'planned_to_watch',
				}),
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
			const mockData = {
				_id: 'usermovie1',
				status: 'watched',
				movie: {
					_id: 'movie123',
					title: 'The Lord of the Rings: The Fellowship of the Ring',
				},
			};
			UserMovie.findOne.mockReturnValue({
				populate: jest.fn().mockResolvedValue(mockData),
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
			UserMovie.findOne.mockReturnValue({
				populate: jest.fn().mockResolvedValue(null),
			});

			await request(app).get('/users/me/movies/notfound').expect(404);
		});
	});

	describe('GET /users/me/movies/:movieId/review', () => {
		test('should return user review for a specific movie with 200 status', async () => {
			// Create a mock review that we expect the database to return.
			const mockReview = {
				_id: 'review789',
				user: 'mockUserId123', // This ID comes from our mockAuthMiddleware
				movie: 'movie123',
				rating: 5,
				message: 'This was a masterpiece!',
				createdAt: new Date().toISOString(),
			};

			// Arrange: Tell the mock Review model to return our mockReview when findOne is called.
			Review.findOne.mockResolvedValue(mockReview);

			// Act: Make the API request.
			const response = await request(app)
				.get('/users/me/movies/movie123/review')
				.expect(200);

			// Assert: Check that the controller was called with the correct IDs.
			expect(Review.findOne).toHaveBeenCalledWith({
				user: 'mockUserId123',
				movie: 'movie123',
			});

			// Assert: Check that the response body contains the correct review data.
			expect(response.body.rating).toBe(5);
			expect(response.body.message).toBe('This was a masterpiece!');
			expect(response.body._id).toBe('review789');
		});

		it('should return 404 when the user has not reviewed the movie', async () => {
			Review.findOne.mockResolvedValue(null);

			// Make the API request to a movie ID we pretend has no review.
			const response = await request(app)
				.get('/users/me/movies/movie-not-reviewed/review')
				.expect(404);

			// Assert: Check that the controller was called correctly.
			expect(Review.findOne).toHaveBeenCalledWith({
				user: 'mockUserId123',
				movie: 'movie-not-reviewed',
			});

			// Assert: Check that the error message from the controller is correct.
			expect(response.body.message).toBe(
				'Review by you for this movie not found.'
			);
		});
	});
});
