// Unit tests for user controller - Testing behavior and scenarios
import mockingoose from 'mockingoose';
import User from '../../src/models/User.js';
import Review from '../../src/models/Review.js';
import Movie from '../../src/models/Movie.js';
import UserMovie from '../../src/models/UserMovie.js';
import {
	deleteUserAccount,
	getUserReviews,
	// getUserMovieReview,
	createUserMovieReview,
	updateUserMovieReview,
	deleteUserMovieReview,
	updateUserProfile,
	updateUserMovie,
	deleteUserMovie,
} from '../../src/controllers/userController.js';

describe('User Controller - Behavior and Scenario Testing', () => {
	// Helper function to create mock request/response objects
	const createMockReqRes = (userData = { _id: 'user123' }, queryData = {}) => {
		const req = {
			user: userData,
			query: queryData,
			params: {},
			body: {},
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

	describe('getUserReviews - Success Scenarios', () => {
		it('should return all reviews when user has multiple reviews', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			const mockReviews = [
				{
					_id: 'review1',
					user: 'user123',
					movie: {
						_id: 'movie1',
						title: 'The Matrix',
						year: 1999,
						genre: ['Action', 'Sci-Fi'],
						director: 'Wachowski Sisters',
						posterUrl: 'https://example.com/matrix.jpg',
					},
					rating: 5,
					message: 'Revolutionary film!',
					createdAt: new Date('2023-01-15'),
				},
				{
					_id: 'review2',
					user: 'user123',
					movie: {
						_id: 'movie2',
						title: 'Inception',
						year: 2010,
						genre: ['Action', 'Thriller'],
						director: 'Christopher Nolan',
						posterUrl: 'https://example.com/inception.jpg',
					},
					rating: 4,
					message: 'Mind-bending plot!',
					createdAt: new Date('2023-02-20'),
				},
			];
			mockingoose(Review).toReturn(mockReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe("User's reviews list");
			expect(res.data.userId).toBe('user123');
			expect(res.data.count).toBe(2);
			expect(res.data.reviews).toHaveLength(2);
			// Check that reviews have the expected structure
			expect(res.data.reviews[0]).toHaveProperty('rating');
			expect(res.data.reviews[0]).toHaveProperty('message');
		});

		it('should return empty array when user has no reviews', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn([], 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(0);
			expect(res.data.reviews).toEqual([]);
			expect(res.data.userId).toBe('user123');
		});

		it('should filter reviews by movieId when provided', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.movieId = 'movie1'; // Add filter parameter

			// Arrange: Specify what the database will return
			const filteredReviews = [
				{
					_id: 'review1',
					user: 'user123',
					movie: {
						_id: 'movie1',
						title: 'The Matrix',
						year: 1999,
						genre: ['Action', 'Sci-Fi'],
						director: 'Wachowski Sisters',
						posterUrl: 'https://example.com/matrix.jpg',
					},
					rating: 5,
					message: 'Revolutionary film!',
					createdAt: new Date('2023-01-15'),
				},
			];
			mockingoose(Review).toReturn(filteredReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1);
			expect(res.data.reviews).toHaveLength(1);
			// Check that the review has the expected movie ID
			expect(res.data.reviews[0].movie._id).toBe('movie1');
		});

		it('should sort reviews by newest first', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			const mockReviews = [
				{
					_id: 'review1',
					user: 'user123',
					movie: { _id: 'movie1', title: 'Old Movie' },
					rating: 3,
					message: 'Old review',
					createdAt: new Date('2023-01-01'),
				},
				{
					_id: 'review2',
					user: 'user123',
					movie: { _id: 'movie2', title: 'New Movie' },
					rating: 5,
					message: 'New review',
					createdAt: new Date('2023-12-01'),
				},
			];
			mockingoose(Review).toReturn(mockReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.reviews).toHaveLength(2);
			// Check that reviews are sorted by date (newest first)
			const dates = res.data.reviews.map((r) => r.createdAt);
			expect(dates[0] >= dates[1]).toBe(true);
		});
	});

	describe('getUserReviews - Error Scenarios', () => {
		it('should handle database connection errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(
				new Error('Database connection failed'),
				'find'
			);

			// Act & Assert: Verify error handling
			await expect(getUserReviews(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});

		it('should handle missing user ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(null);

			// Act & Assert: Verify error handling
			await expect(getUserReviews(req, res)).rejects.toThrow();
		});

		it('should handle invalid movieId filter', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.movieId = 'invalid-movie-id';

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn([], 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(0);
		});
	});

	describe('getUserReviews - Edge Cases', () => {
		it('should handle very large result sets', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			// Create array of 1000 mock reviews
			const manyReviews = Array.from({ length: 1000 }, (_, i) => ({
				_id: `review${i}`,
				user: 'user123',
				movie: { _id: `movie${i}`, title: `Movie ${i}` },
				rating: 3,
				message: `Review ${i}`,
				createdAt: new Date(),
			}));
			mockingoose(Review).toReturn(manyReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1000);
			expect(res.data.reviews).toHaveLength(1000);
		});

		it('should handle reviews with special characters in messages', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			const mockReviews = [
				{
					_id: 'review1',
					user: 'user123',
					movie: { _id: 'movie1', title: 'Test Movie' },
					rating: 5,
					message: 'Great movie! 🎬 100% recommend! 💯',
					createdAt: new Date(),
				},
			];
			mockingoose(Review).toReturn(mockReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.reviews[0].message).toBe(
				'Great movie! 🎬 100% recommend! 💯'
			);
		});
	});

	describe('deleteUserAccount - Success Scenarios', () => {
		it('should delete user and all their reviews successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(
				{ _id: 'user123', name: 'Test User' },
				'findOneAndDelete'
			);
			mockingoose(Review).toReturn({ deletedCount: 5 }, 'deleteMany');

			// Act: Call the function
			await deleteUserAccount(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data).toEqual({
				message: 'User account deleted successfully',
				userId: 'user123',
			});
		});
	});

	describe('deleteUserAccount - Error Scenarios', () => {
		it('should return 404 when user not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(null, 'findOneAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteUserAccount(req, res)).rejects.toThrow(
				'User not found'
			);
			expect(res.statusCode).toBe(404);
		});

		it('should handle database errors during deletion', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(
				new Error('Database error'),
				'findOneAndDelete'
			);

			// Act & Assert: Verify error handling
			await expect(deleteUserAccount(req, res)).rejects.toThrow(
				'Database error'
			);
		});
	});

	describe('getUserMovieReview - Success Scenarios', () => {
		test.skip('should return user review for specific movie', async () => {
			// TODO: Implement when getUserMovieReview function is fully implemented
		});
	});

	describe('getUserMovieReview - Error Scenarios', () => {
		test.skip('should return 404 when review not found', async () => {
			// TODO: Implement when getUserMovieReview function is fully implemented
		});
	});

	describe('getUserMovies - Success Scenarios', () => {
		test.skip('should return user movie collection successfully', async () => {
			// TODO: Implement when getUserMovies function is fully implemented
		});
	});

	describe('getUserMovies - Error Scenarios', () => {
		test.skip('should handle database errors gracefully', async () => {
			// TODO: Implement when getUserMovies function is fully implemented
		});
	});

	describe('addUserMovie - Success Scenarios', () => {
		test.skip('should add movie to user collection successfully', async () => {
			// TODO: Implement when addUserMovie function is fully implemented
		});
	});

	describe('addUserMovie - Error Scenarios', () => {
		test.skip('should return 404 when movie not found', async () => {
			// TODO: Implement when addUserMovie function is fully implemented
		});
	});

	describe('getSingleUserMovie - Success Scenarios', () => {
		test.skip('should return specific user movie successfully', async () => {
			// TODO: Implement when getSingleUserMovie function is fully implemented
		});
	});

	describe('getSingleUserMovie - Error Scenarios', () => {
		test.skip('should return 404 when user movie not found', async () => {
			// TODO: Implement when getSingleUserMovie function is fully implemented
		});
	});

	describe('createUserMovieReview - Success Scenarios', () => {
		it('should create new review successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 5, message: 'Amazing movie!' };

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				{ _id: 'movie123', title: 'Test Movie' },
				'findById'
			);
			mockingoose(Review).toReturn(null, 'findOne');
			const newReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 5,
				message: 'Amazing movie!',
				createdAt: new Date(),
			};
			mockingoose(Review).toReturn(newReview, 'save');

			// Act: Call the function
			await createUserMovieReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data).toHaveProperty('_id');
			expect(res.data).toHaveProperty('rating', 5);
			expect(res.data).toHaveProperty('message', 'Amazing movie!');
		});
	});

	describe('createUserMovieReview - Error Scenarios', () => {
		it('should return 404 when movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'nonexistent';
			req.body = { rating: 5, message: 'Test' };

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'Movie not found, cannot create review.'
			);
			expect(res.statusCode).toBe(404);
		});

		it('should return 409 when user already reviewed this movie', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 5, message: 'Test' };

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findById');
			mockingoose(Review).toReturn({ _id: 'existing-review' }, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'You have already reviewed this movie. Please update your existing review.'
			);
			expect(res.statusCode).toBe(409);
		});

		it('should validate rating is between 1 and 5', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 6, message: 'Test' }; // Invalid rating

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findById');
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});
	});

	describe('updateUserMovieReview - Success Scenarios', () => {
		it('should update existing review successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 4, message: 'Updated review' };

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 3,
				message: 'Old review',
				save: () =>
					Promise.resolve({
						_id: 'review123',
						user: 'user123',
						movie: 'movie123',
						rating: 4,
						message: 'Updated review',
					}),
			};
			mockingoose(Review).toReturn(existingReview, 'findOne');

			// Act: Call the function
			await updateUserMovieReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.rating).toBe(4);
			expect(res.data.message).toBe('Updated review');
		});
	});

	describe('deleteUserMovieReview - Success Scenarios', () => {
		it('should delete user review successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';

			// Arrange: Specify what the database will return
			const deletedReview = {
				_id: 'review123',
				user: 'user123',
				movie: 'movie123',
				rating: 4,
				message: 'Deleted review',
			};
			mockingoose(Review).toReturn(deletedReview, 'findOneAndDelete');

			// Act: Call the function
			await deleteUserMovieReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data).toEqual({ message: 'Review successfully deleted.' });
		});
	});

	describe('deleteUserMovieReview - Error Scenarios', () => {
		it('should return 404 when review not found for deletion', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findOneAndDelete');

			// Act & Assert: Verify error handling
			await expect(deleteUserMovieReview(req, res)).rejects.toThrow(
				'Review by you for this movie not found, unable to delete.'
			);
			expect(res.statusCode).toBe(404);
		});
	});

	describe('updateUserProfile - Success Scenarios', () => {
		it('should update user profile successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.body = { name: 'Updated Name', email: 'updated@example.com' };

			// Arrange: Specify what the database will return
			const updatedUser = {
				_id: 'user123',
				name: 'Updated Name',
				email: 'updated@example.com',
			};
			mockingoose(User).toReturn(updatedUser, 'findByIdAndUpdate');

			// Act: Call the function
			await updateUserProfile(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Profile updated successfully');
			expect(res.data.user.name).toBe('Updated Name');
			expect(res.data.user.email).toBe('updated@example.com');
		});

		it('should return 404 when user not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.body = { name: 'Updated Name' };

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(null, 'findByIdAndUpdate');

			// Act: Call the function
			await updateUserProfile(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(404);
			expect(res.data.message).toBe('User not found');
		});

		it('should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.body = { name: 'Updated Name' };

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(
				new Error('Database connection failed'),
				'findByIdAndUpdate'
			);

			// Act: Call the function
			await updateUserProfile(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(500);
			expect(res.data.message).toBe('Server error');
		});
	});

	describe('updateUserMovie - Success Scenarios', () => {
		test.skip('should update user movie status successfully', async () => {
			// TODO: Kathryn - Uncomment when updateUserMovie function is fully implemented
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = 'movie123';
			req.body = { status: 'watched', userRating: 4, notes: 'Great movie!' };

			// Arrange: Specify what the database will return
			const updatedUserMovie = {
				_id: 'usermovie123',
				user: 'user123',
				movie: 'movie123',
				status: 'watched',
				userRating: 4,
				notes: 'Great movie!',
			};
			mockingoose(UserMovie).toReturn(updatedUserMovie, 'findOneAndUpdate');

			// Act: Call the function
			await updateUserMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe("User's movie entry updated");
			expect(res.data.userId).toBe('user123');
			expect(res.data.movieId).toBe('movie123');
		});

		test.skip('should return 404 when user movie not found', async () => {
			// TODO: Kathryn - Uncomment when updateUserMovie function is fully implemented
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = 'nonexistent';
			req.body = { status: 'watched' };

			// Arrange: Specify what the database will return
			mockingoose(UserMovie).toReturn(null, 'findOneAndUpdate');

			// Act: Call the function
			await updateUserMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(404);
			expect(res.data.message).toBe('User movie not found');
		});
	});

	describe('deleteUserMovie - Success Scenarios', () => {
		test.skip('should delete user movie status successfully', async () => {
			// TODO: Kathryn - Uncomment when deleteUserMovie function is fully implemented
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = 'movie123';

			// Arrange: Specify what the database will return
			const deletedUserMovie = {
				_id: 'usermovie123',
				user: 'user123',
				movie: 'movie123',
				status: 'watched',
			};
			mockingoose(UserMovie).toReturn(deletedUserMovie, 'findOneAndDelete');

			// Act: Call the function
			await deleteUserMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe("Movie removed from user's collection");
			expect(res.data.userId).toBe('user123');
			expect(res.data.movieId).toBe('movie123');
		});

		test.skip('should return 404 when user movie not found', async () => {
			// TODO: Kathryn - Uncomment when deleteUserMovie function is fully implemented
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = 'nonexistent';

			// Arrange: Specify what the database will return
			mockingoose(UserMovie).toReturn(null, 'findOneAndDelete');

			// Act: Call the function
			await deleteUserMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(404);
			expect(res.data.message).toBe('User movie not found');
		});
	});
});
