// Integration tests for review routes using supertest
import request from 'supertest';
import express from 'express';
import reviewRoutes from '../../src/routes/reviewRoutes.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/reviews', reviewRoutes);

describe('Review Routes - Integration Tests', () => {
	describe('GET /movies/:movieId/reviews', () => {
		test.skip('should return all reviews for movie with 200 status', async () => {
			// TODO: Kathryn - just change "test.skip" to "test" above to enable this test
			// Act: Make HTTP request to get movie reviews
			const response = await request(app)
				.get('/movies/movie123/reviews')
				.expect(200);

			// Assert: Verify response structure
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('movieId');
		});
	});

	describe('PUT /reviews/:reviewId', () => {
		test('should update review with 200 status', async () => {
			// Arrange: Review update data
			const reviewData = {
				rating: 4,
				message: 'Updated review message',
			};

			// Act: Make HTTP request to update review
			const response = await request(app)
				.put('/reviews/review123')
				.send(reviewData)
				.expect(200);

			// Assert: Verify successful update
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('rating');
			expect(response.body).toHaveProperty('message');
		});

		test('should return 404 when review not found', async () => {
			// Arrange: Review update data
			const reviewData = {
				rating: 4,
				message: 'Updated review message',
			};

			// Act: Make HTTP request with invalid review ID
			const response = await request(app)
				.put('/reviews/nonexistent')
				.send(reviewData)
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('DELETE /reviews/:reviewId', () => {
		test('should delete review with 200 status', async () => {
			// Act: Make HTTP request to delete review
			const response = await request(app)
				.delete('/reviews/review123')
				.expect(200);

			// Assert: Verify successful deletion
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('reviewId');
		});

		test('should return 404 when review not found', async () => {
			// Act: Make HTTP request with invalid review ID
			const response = await request(app)
				.delete('/reviews/nonexistent')
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});
});
