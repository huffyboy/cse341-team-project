// Integration tests for review routes using supertest
import request from 'supertest';
import express from 'express';
import mockingoose from 'mockingoose';
import mongoose from 'mongoose';
import Review from '../../src/models/Review.js';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock the middlewares
const mockAuthMiddleware = jest.fn((req, res, next) => next());
const mockValidator = jest.fn((req, res, next) => next());

// Mock authentication middleware
await jest.unstable_mockModule('../../src/middlewares/authMiddleware.js', () => ({
	__esModule: true,
	default: mockAuthMiddleware,
}));

// Mock validation middlewares
await jest.unstable_mockModule('../../src/middlewares/reviewValidators.js', () => ({
	__esModule: true,
	validateReviewUpdate: mockValidator,
	validateReviewId: mockValidator,
}));

// Import the routes after mocking
const { default: reviewRoutes } = await import('../../src/routes/reviewRoutes.js');

// Create test app
const app = express();
app.use(express.json());

// Add user to request
app.use((req, res, next) => {
	req.user = { _id: new mongoose.Types.ObjectId(), username: 'testuser' };
	next();
});

app.use('/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack,
	});
});

describe('Review Routes - Integration Tests', () => {
	beforeEach(() => {
		mockingoose.resetAll();
		jest.clearAllMocks();
	});

	describe('PUT /reviews/:reviewId', () => {
		test('should update review with 200 status', async () => {
			// Arrange: Mock review data
			const reviewId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 3,
				message: 'Old review message',
			};

			const reviewData = {
				rating: 4,
				message: 'Updated review message',
			};

			// Mock the database operations
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Make HTTP request to update review
			const response = await request(app)
				.put(`/reviews/${reviewId}`)
				.send(reviewData)
				.expect(200);

			// Assert: Verify successful update
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('rating');
			expect(response.body).toHaveProperty('message');
		});

		test('should return 404 when review not found', async () => {
			// Arrange: Review update data
			const reviewId = new mongoose.Types.ObjectId();
			const reviewData = {
				rating: 4,
				message: 'Updated review message',
			};

			// Mock the database to return null (review not found)
			mockingoose(Review).toReturn(null, 'findById');

			// Act: Make HTTP request with invalid review ID
			const response = await request(app)
				.put(`/reviews/${reviewId}`)
				.send(reviewData)
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('DELETE /reviews/:reviewId', () => {
		test('should delete review with 200 status', async () => {
			// Arrange: Mock review data
			const reviewId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			
			const deletedReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 4,
				message: 'Deleted review',
			};

			// Mock the database operations
			mockingoose(Review).toReturn(deletedReview, 'findOneAndDelete');

			// Act: Make HTTP request to delete review
			const response = await request(app)
				.delete(`/reviews/${reviewId}`)
				.expect(200);

			// Assert: Verify successful deletion
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('reviewId');
		});

		test('should return 404 when review not found', async () => {
			// Arrange: Mock review data
			const reviewId = new mongoose.Types.ObjectId();

			// Mock the database to return null (review not found)
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act: Make HTTP request with invalid review ID
			const response = await request(app)
				.delete(`/reviews/${reviewId}`)
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});
});
