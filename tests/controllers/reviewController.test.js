// Unit tests for review controller - Testing behavior and scenarios
import mockingoose from 'mockingoose';
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
		it('should update existing review successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4, message: 'Updated review message' }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 3,
				message: 'Old review message',
				save: () =>
					Promise.resolve({
						_id: 'review123',
						user: 'user123',
						movie: 'movie123',
						rating: 4,
						message: 'Updated review message',
					}),
			};
			mockingoose(Review).toReturn(existingReview, 'findById');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(4);
			expect(res.data.message).toBe('Updated review message');
		});

		it('should handle rating change from 1 to 5', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 5, message: 'Excellent movie!' }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 1,
				message: 'Terrible movie',
				save: () =>
					Promise.resolve({
						_id: 'review123',
						user: 'user123',
						movie: 'movie123',
						rating: 5,
						message: 'Excellent movie!',
					}),
			};
			mockingoose(Review).toReturn(existingReview, 'findById');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(5);
			expect(res.data.message).toBe('Excellent movie!');
		});
	});

	describe('updateReview - Error Scenarios', () => {
		it('should return 404 when review not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'nonexistent' },
				{ rating: 4, message: 'Test message' }
			);

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		it('should return 400 when rating is missing', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating and message are required for updating a review.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when message is missing', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4 }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating and message are required for updating a review.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when rating is less than 1', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 0, message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when rating is greater than 5', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 6, message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when rating is not a number', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 'invalid', message: 'Test message' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when message is empty', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4, message: '' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when message is only whitespace', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4, message: '   ' }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});

		it('should return 400 when message is not a string', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4, message: 123 }
			);

			// Act & Assert: Verify error handling
			await expect(updateReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});
	});

	describe('updateReview - Edge Cases', () => {
		it('should handle special characters in message', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 5, message: 'Amazing movie! 🎬 100% recommend! 💯' }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 3,
				message: 'Old message',
				save: () =>
					Promise.resolve({
						_id: 'review123',
						user: 'user123',
						movie: 'movie123',
						rating: 5,
						message: 'Amazing movie! 🎬 100% recommend! 💯',
					}),
			};
			mockingoose(Review).toReturn(existingReview, 'findById');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Amazing movie! 🎬 100% recommend! 💯');
		});

		it('should handle very long message', async () => {
			// Arrange: Setup test with request and response
			const longMessage = 'A'.repeat(1000);
			const { req, res } = createMockReqRes(
				{ reviewId: 'review123' },
				{ rating: 4, message: longMessage }
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 3,
				message: 'Old message',
				save: () =>
					Promise.resolve({
						_id: 'review123',
						user: 'user123',
						movie: 'movie123',
						rating: 4,
						message: longMessage,
					}),
			};
			mockingoose(Review).toReturn(existingReview, 'findById');

			// Act: Call the function
			await updateReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe(longMessage);
		});
	});

	describe('deleteReview - Success Scenarios', () => {
		it('should delete review successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: 'review123' });

			// Arrange: Specify what the database will return
			const deletedReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 4,
				message: 'Deleted review',
			};
			mockingoose(Review).toReturn(deletedReview, 'findByIdAndDelete');

			// Act: Call the function
			await deleteReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Review deleted successfully');
			expect(res.data.reviewId).toBe('review123');
		});

		it('should handle deletion of different review IDs', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: 'review456' });

			// Arrange: Specify what the database will return
			const deletedReview = {
				_id: 'review456',
				user: 'user456',
				movie: 'movie456',
				rating: 5,
				message: 'Another deleted review',
			};
			mockingoose(Review).toReturn(deletedReview, 'findByIdAndDelete');

			// Act: Call the function
			await deleteReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Review deleted successfully');
			expect(res.data.reviewId).toBe('review456');
		});
	});

	describe('deleteReview - Error Scenarios', () => {
		it('should return 404 when review not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		it('should handle database errors during deletion', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: 'review123' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(
				new Error('Database connection failed'),
				'findByIdAndDelete'
			);

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('deleteReview - Edge Cases', () => {
		it('should handle invalid review ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
		});

		it('should handle empty review ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ reviewId: '' });

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findByIdAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteReview(req, res)).rejects.toThrow('Review not found.');
			expect(res.statusCode).toBe(404);
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
