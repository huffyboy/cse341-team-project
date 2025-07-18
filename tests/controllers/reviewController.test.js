// Unit tests for review controller - Testing behavior and scenarios
import mockingoose from 'mockingoose';
import mongoose from 'mongoose';
import Review from '../../src/models/Review.js';
import {
	updateReview,
	deleteReview,
	getMovieReviews,
} from '../../src/controllers/reviewController.js';

describe('Review Controller - Behavior and Scenario Testing', () => {
	// Helper function to create mock request/response objects
	const createMockReqRes = (paramsData = {}, bodyData = {}) => {
		const req = {
			params: paramsData,
			body: bodyData,
		};

		const res = {
			statusCode: null,
			data: null,
			status(code) {
				this.statusCode = code;
				return this;
			},
			json(data) {
				this.data = data;
				return this;
			},
		};

		return { req, res };
	};

	// Reset all mocks before each test
	beforeEach(() => {
		mockingoose.resetAll();
	});

	describe('updateReview - Success Scenarios', () => {
		test('should update existing review successfully', async () => {
			// Arrange: Setup test with request and response
			 const reviewId = new mongoose.Types.ObjectId();
			 const movieId = new mongoose.Types.ObjectId();
			 const userId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes(
				{ movieId: movieId },
				{ reviewId: reviewId, rating: 4, message: 'Updated review message' }
			);

			// Arrange: Define the data the database should "find".
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 3,
				message: 'Old review message',
			};

			// Mock the underlying 'findOne' operation instead of the 'findById' alias.
			// mockingoose will return a mock document with a working .save() method.
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(4);
			expect(res.data.message).toBe('Updated review message');
		});

		test('should handle rating change from 1 to 5', async () => {

			const reviewId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();

			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: movieId },
				{ reviewId: reviewId, rating: 5, message: "Terrible movie" } // Only updating the rating
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 1,
				message: 'Terrible movie'
			};
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(5);
			expect(res.data.message).toBe('Terrible movie');
		});
	});

	describe('updateReview - Error Scenarios', () => {
		test('should return 404 when review not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'nonexistent', rating: 4, message: 'Test message' }
			);

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		test('should return 400 when rating is missing', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating and message are required for updating a review.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when message is missing', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 4 }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating and message are required for updating a review.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when rating is less than 1', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 0, message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when rating is greater than 5', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 6, message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when rating is not a number', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 'invalid', message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when message is empty', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 4, message: '' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when message is only whitespace', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 4, message: '   ' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should return 400 when message is not a string', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ reviewId: 'review123', rating: 4, message: 123 }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});
	});

	describe('updateReview - Edge Cases', () => {
		test('should handle special characters in message', async () => {
			// Arrange: Setup test with request and response
			const reviewId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes(
				{ movieId: movieId },
				{ reviewId: reviewId, rating: 5, message: 'Amazing movie! 🎬 100% recommend! 💯' }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 3,
				message: 'Old message'

			};
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Amazing movie! 🎬 100% recommend! 💯');
		});

		test('should handle very long message', async () => {
			// Arrange: Setup test with request and response
			const reviewId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			const longMessage = 'A'.repeat(1500); // 1500 length string should be accepted.
			const { req, res } = createMockReqRes(
				{ movieId: movieId },
				{ reviewId: reviewId, rating: 4, message: longMessage }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 3,
				message: 'Old message'
			};
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(4);
			expect(res.data.message).toBe(longMessage);
		});
	});

	describe('deleteReview - Success Scenarios', () => {
		test('should delete review successfully', async () => {
			const reviewId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{ reviewId: reviewId }
			);

			// Arrange: Specify what the database will return
			const deletedReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 4,
				message: 'Deleted review',
			};
			mockingoose(Review).toReturn(deletedReview, 'findOneAndDelete');

			// Act: Call the function
			await deleteReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Review deleted successfully');
			expect(res.data.reviewId).toBe(reviewId);
		});

		test('should handle deletion of different review IDs', async () => {
			const reviewId = new mongoose.Types.ObjectId();
			const reviewId2 = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			// Let's make 2 existing reviews and only delete 1 of them, then confirm other still exists
			const deletedReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 5,
				message: 'This is my review 1',
			};
			const deletedReview2 = {
				_id: reviewId2,
				user: userId,
				movie: movieId,
				rating: 5,
				message: 'This is my review 2',
			};

			// Arrange: Setup test with request and response
			// Create moqs of each review
			var { req, res } = createMockReqRes(
				{},
				{ reviewId: reviewId }
			);

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(deletedReview, 'findOneAndDelete');

			// Act: Call the function
			await deleteReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Review deleted successfully');
			expect(res.data.reviewId).toBe(deletedReview._id);

			// Now work on 2nd
			var { req, res } = createMockReqRes(
				{},
				{ reviewId: reviewId2 }
			);

			mockingoose(Review).toReturn(deletedReview2, 'findOneAndDelete');
			// Act: Call the function
			await deleteReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Review deleted successfully');
			expect(res.data.reviewId).toBe(deletedReview2._id);
		});
	});

	describe('deleteReview - Error Scenarios', () => {
		test('should return 404 when review not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, { reviewId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		test('should handle database errors during deletion', async () => {
			const reviewId = new mongoose.Types.ObjectId();
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, { reviewId: 'review123' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(
				new Error('Database connection failed'),
				'findOneAndDelete'
			);

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('deleteReview - Edge Cases', () => {
		test('should handle invalid review ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, { reviewId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		test('should handle empty review ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, { reviewId: '' });

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('reviewId is required in the request body.');
			expect(res.statusCode).toBe(400);
		});
	});

	describe('getMovieReviews - Success Scenarios', () => {
		test('should return all reviews for a specific movie', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const mockReviews = [
				{
					_id: 'review1',
					user: { name: 'User A' },
					movie: 'movie123',
					rating: 5,
					message: 'Amazing movie!',
				},
				{
					_id: 'review2',
					user: { name: 'User B' },
					movie: 'movie123',
					rating: 4,
					message: 'Great film!',
				},
			];
			// Mock the .populate() call
			mockingoose(Review).toReturn(mockReviews, 'find');

			// Call the function
			await getMovieReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.count).toBe(2);
			expect(res.data.data).toHaveLength(2);
			expect(res.data.data[0].message).toBe('Amazing movie!');
		});

		test('should return empty array when no reviews exist', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie456' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn([], 'find');

			// Act: Call the function
			await getMovieReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.count).toBe(0);
			expect(res.data.data).toEqual([]);
		});
	});

	describe('getMovieReviews - Error Scenarios', () => {
		test('should handle database errors gracefully', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(
				new Error('Database connection failed'),
				'find'
			);

			// Verify error handling
			await expect(getMovieReviews(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});
});
