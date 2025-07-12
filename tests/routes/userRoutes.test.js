// Integration tests for user routes using supertest
import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/userRoutes.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

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
		test.skip('should return user movie collection with 200 status', async () => {
			// TODO: Implement when getUserMovies function is fully implemented
		});
	});

	describe('POST /users/me/movies', () => {
		test.skip('should add movie to user collection with 201 status', async () => {
			// TODO: Implement when addUserMovie function is fully implemented
		});
	});

	describe('GET /users/me/movies/:movieId', () => {
		test.skip('should return specific user movie with 200 status', async () => {
			// TODO: Implement when getSingleUserMovie function is fully implemented
		});
	});

	describe('GET /users/me/movies/:movieId/review', () => {
		test.skip('should return user review for specific movie with 200 status', async () => {
			// TODO: Implement when getUserMovieReview function is fully implemented
		});
	});
});
