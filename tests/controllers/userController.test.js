// Unit tests for user controller - Testing behavior and scenarios
import mongoose from 'mongoose';
import mockingoose from 'mockingoose';
import User from '../../src/models/User.js';
import Review from '../../src/models/Review.js';
import Movie from '../../src/models/Movie.js';
import UserMovie from '../../src/models/UserMovie.js';
import {
	deleteUserAccount,
	getUserReviews,
	getUserMovieReview,
	createUserMovieReview,
	updateUserMovieReview,
	deleteUserMovieReview,
	updateUserProfile,
	getUserMovies,
	addUserMovie,
	getSingleUserMovie,
	updateUserMovie,
	deleteUserMovie,
} from '../../src/controllers/userController.js';

describe('User Controller - Behavior and Scenario Testing', () => {
	// Helper function to create mock request/response objects
	const createMockReqRes = (
		userData = { _id: 'user123' },
		queryData = {},
		paramsData = {},
    	bodyData = {},
	) => {
		const req = {
			user: userData,
			query: queryData,
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

	describe('getUserReviews - Success Scenarios', () => {
		test('should return all reviews when user has multiple reviews', async () => {
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

		test('should return empty array when user has no reviews', async () => {
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

		test('should filter reviews by movieId when provided', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
			);

			const targetMovieId = new mongoose.Types.ObjectId();

			// Arrange: Specify what the database will return
			// Adding 2 reviews to the Matrix movie...
			const filteredReviews = [
				{
					_id: 'review1',
					user: 'user123',
					movie: {
						_id: targetMovieId,
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
						_id: targetMovieId,
						title: 'The Matrix',
						year: 1999,
						genre: ['Action', 'Sci-Fi'],
						director: 'Wachowski Sisters',
						posterUrl: 'https://example.com/matrix.jpg',
					},
					rating: 4,
					message: 'Amazing action!',
					createdAt: new Date('2023-01-15'),
				},
			];
			mockingoose(Review).toReturn(filteredReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(2);
			expect(res.data.reviews).toHaveLength(2);
			expect(res.data.reviews[0].movie._id).toBe(targetMovieId);
			expect(res.data.reviews[0].rating).toBe(5);
			expect(res.data.reviews[1].rating).toBe(4);
			expect(res.data.reviews[1].message).toBe('Amazing action!');
		});

		test('should sort reviews by newest first', async () => {
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

			// Ok, when using mockingoose it bypasses sort, so we are simulating the sort here.
			const sortedReviews = [...mockReviews].sort(
				(a, b) => b.createdAt - a.createdAt
			);

			mockingoose(Review).toReturn(sortedReviews, 'find');

			// Act: Call the function
			await getUserReviews(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.reviews).toHaveLength(2);
			expect(res.data.reviews[0].createdAt >= res.data.reviews[1].createdAt).toBe(true);
		});
	});

	describe('getUserReviews - Error Scenarios', () => {
		test('should handle database connection errors gracefully', async () => {
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

		test('should handle missing user ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(null);

			// Act & Assert: Verify error handling
			await expect(getUserReviews(req, res)).rejects.toThrow();
		});

		test('should handle invalid movieId filter', async () => {
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
		test('should handle very large result sets', async () => {
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

		test('should handle reviews with special characters in messages', async () => {
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
		test('should delete user and all their reviews successfully', async () => {
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
		test('should return 404 when user not found', async () => {
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

		test('should handle database errors during deletion', async () => {
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
		test('should return review when user has reviewed the movie', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const reviewId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.params.movieId = movieId;

			// Arrange: Specify what the database will return
			const mockReview = {
				_id: reviewId,
				user: userId,
				movie: {
					_id: movieId,
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
					posterUrl: 'https://example.com/matrix.jpg',
				},
				rating: 5,
				message: 'Revolutionary film!',
				createdAt: new Date('2023-01-15'),
			};
			mockingoose(Review).toReturn(mockReview, 'findOne');

			// Act: Call the function
			await getUserMovieReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data._id).toBe(reviewId);
			expect(res.data.user).toBe(userId);
			expect(res.data.movie._id).toBe(movieId);
			expect(res.data.rating).toBe(5);
			expect(res.data.message).toBe('Revolutionary film!');
			expect(res.data.createdAt).toEqual(new Date('2023-01-15'));
		});

		test('should return review with minimal movie data when populated', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const reviewId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.params.movieId = movieId;

			// Arrange: Specify what the database will return
			const mockReview = {
				_id: reviewId,
				user: userId,
				movie: {
					_id: movieId,
					title: 'Inception',
					year: 2010,
				},
				rating: 4,
				message: 'Mind-bending plot!',
				createdAt: new Date('2023-02-20'),
			};
			mockingoose(Review).toReturn(mockReview, 'findOne');

			// Act: Call the function
			await getUserMovieReview(req, res);
			console.log(res);
			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data._id).toBe(reviewId);
			expect(res.data.movie).toBe(movieId);
			expect(res.data.rating).toBe(4);
			expect(res.data.message).toBe('Mind-bending plot!');
		});
	});

	describe('getUserMovieReview - Error Scenarios', () => {
		test('should return 404 when user has not reviewed the movie', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.params.movieId = movieId;

			// Arrange: Specify what the database will return
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Expect the function to throw an error
			await expect(getUserMovieReview(req, res)).rejects.toThrow('Review by you for this movie not found.');
			expect(res.statusCode).toBe(404);
		});

		test('should handle different user and movie combinations for 404', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.params.movieId = movieId;

			// Arrange: Specify what the database will return (no review found)
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Expect the function to throw an error
			await expect(getUserMovieReview(req, res)).rejects.toThrow('Review by you for this movie not found.');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('getUserMovies - Success Scenarios', () => {
		test('should return user movie collection successfully', async () => {

			// I need to lass the userId into the controller for testing
			const userId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes(
				{
					_id: userId.toString()
				}
			);

			const mockUserMovies = [
				{
					_id: new mongoose.Types.ObjectId(), // The movie's _id
					user: userId, // The user's _id
					status: 'watched',
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
					posterUrl: 'https://example.com/matrix.jpg'
				},
				{
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					status: 'planned_to_watch',
					title: 'Inception',
					year: 2010,
					genre: ['Suspense', 'Sci-Fi'],
					director: 'Christopher Nolan',
					posterUrl: 'https://example.com/inception.jpg'
				},
			];

			mockingoose(UserMovie).toReturn(mockUserMovies, 'aggregate');

			await getUserMovies(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.count).toBe(2);
			expect(res.data.data).toHaveLength(2);
			expect(res.data.data[0].title).toBe('The Matrix');
    		expect(res.data.data[1].title).toBe('Inception');
			expect(res.data.data).toEqual(mockUserMovies); // This works, awesome!
		});

		test('should return an empty array if user has no movies', async () => {

			const userId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes(
				{
					_id: userId.toString()
				}
			);

			mockingoose(UserMovie).toReturn([], 'aggregate');

			await getUserMovies(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(0);
			expect(res.data.data).toEqual([]);
		});
	});

	// This test took me like 3 hours to resolve! - AT
	describe('addUserMovie - Success Scenarios', () => {
		test('should add movie to user collection successfully', async () => {
			// --- ARRANGE ---
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes(
				{ _id: userId.toString() },
				{},
				{},
				{ movieId: movieId, status: 'watched' }
			);

			const movieDoc = {
				_id: movieId,
				title: 'Inception',
				year: 2010
			};

			// Mock Movie.findById
			mockingoose(Movie).toReturn(movieDoc, 'findOne');

			// Mock UserMovie.findOne with a function that checks the query
			mockingoose(UserMovie).toReturn((query) => {

				// If the query includes both user and movie (existence check), return null
				if (query._conditions && query._conditions.user && query._conditions.movie) {
					return null;
				}
				// If the query is just _id (populate call), return populated document
				if (query._conditions && query._conditions._id) {
					return {
						user: userId,
						movie: movieDoc,
						status: 'watched',
						_id: query._conditions._id,
					};
				}
				return null;
			}, 'findOne');

			const savedUserMovie = {
				user: userId,
				movie: movieId,
				status: 'watched',
			};

			// Mock the save operation
			mockingoose(UserMovie).toReturn(savedUserMovie, 'save');

			// --- ACT ---
			await addUserMovie(req, res);

			// --- ASSERT ---
			expect(res.statusCode).toBe(201);
			expect(res.data.success).toBe(true);
			expect(res.data.data.status).toBe('watched');
			expect(res.data.data.movie).toBe(movieId);
			expect(res.data.data.user).toBe(userId);
		});
	});

	describe('addUserMovie - Error Scenarios', () => {
		test('should return 404 when movie does not exist globally', async () => {
			const { req, res } = createMockReqRes(
				{ _id: 'user123' },
				{},
				{ movieId: 'nonexistent' }
			);
			mockingoose(Movie).toReturn(null, 'findById');

			await expect(addUserMovie(req, res)).rejects.toThrow(
				'Movie not found in the global database.'
			);
			expect(res.statusCode).toBe(404);
		});

		test('should return 409 when movie is already in user collection', async () => {
			const { req, res } = createMockReqRes(
				{ _id: 'user123' },
				{},
				{ movieId: 'movie123' }
			);
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findOne');
			mockingoose(UserMovie).toReturn({ _id: 'existing' }, 'findOne');

			await expect(addUserMovie(req, res)).rejects.toThrow(
				'This movie is already in your collection.'
			);
			expect(res.statusCode).toBe(409);
		});
	});

	describe('getSingleUserMovie - Success Scenarios', () => {
		test('should return a specific movie from user collection', async () => {
			const movieId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes(
				{ _id: 'user123' },
				{},
				{ movieId: movieId }
			);

			const mockUserMovie = {
				_id: 'usermovie456',
				user: 'user123',
				movie: { _id: movieId, title: 'Found Movie' },
				status: 'watched',
			};
			mockingoose(UserMovie).toReturn(mockUserMovie, 'findOne');

			await getSingleUserMovie(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.data.status).toBe('watched');
			expect(res.data.data.movie).toBe(movieId);
		});
	});

	describe('getSingleUserMovie - Error Scenarios', () => {
		test('should return 404 when user movie not found', async () => {
			const { req, res } = createMockReqRes(
				{ _id: 'user123' },
				{},
				{ movieId: 'nonexistent' }
			);

			mockingoose(UserMovie).toReturn(null, 'findOne');

			await expect(getSingleUserMovie(req, res)).rejects.toThrow(
				'Movie not found in your collection'
			);
			expect(res.statusCode).toBe(404);
		});
	});

	describe('createUserMovieReview - Success Scenarios', () => {
		test('should create new review successfully', async () => {
			// Arrange: Setup test with request and response
			const movieId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes(
				{ _id: userId },
				{},
				{ movieId: movieId},
				{ rating: 5, message: 'Amazing movie!' },
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				{ _id: movieId, title: 'Test Movie' },
				'findOne'
			);
			mockingoose(Review).toReturn(null, 'findOne');

			const newReview = {
				_id: 'review123',
				user: userId,
				movie: movieId,
				rating: 5,
				message: 'Amazing movie!',
				createdAt: new Date(),
			};

			mockingoose(Review).toReturn(newReview, 'save');

			// Act: Call the function
			await createUserMovieReview(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data.user).toBe(userId);
			expect(res.data).toHaveProperty('movie', movieId);
			expect(res.data).toHaveProperty('rating', 5);
			expect(res.data).toHaveProperty('message', 'Amazing movie!');
		});
	});

	describe('createUserMovieReview - Error Scenarios', () => {
		test('should return 404 when movie not found', async () => {
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

		test('should return 409 when user already reviewed this movie', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 5, message: 'Test' };

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findOne');
			mockingoose(Review).toReturn({ _id: 'existing-review' }, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'You have already reviewed this movie. Please update your existing review.'
			);
			expect(res.statusCode).toBe(409);
		});

		test('Rating and Review message should be included to be valid', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = {}; // Missing rating and review

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findOne');
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'Rating and review message are required to create a review.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should validate rating is between 1 and 5', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 6, message: 'Test' }; // Invalid rating

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findOne');
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'Rating must be a number between 1 and 5.'
			);
			expect(res.statusCode).toBe(400);
		});

		test('Review cannot be an empty string', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.params.movieId = 'movie123';
			req.body = { rating: 5, message: '' }; // Invalid rating

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn({ _id: 'movie123' }, 'findOne');
			mockingoose(Review).toReturn(null, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createUserMovieReview(req, res)).rejects.toThrow(
				'Review message cannot be empty.'
			);
			expect(res.statusCode).toBe(400);
		});
	});

	describe('updateUserMovieReview - Success Scenarios', () => {
		test('should update existing review successfully', async () => {
			const movieId = new mongoose.Types.ObjectId();
			const userId = new mongoose.Types.ObjectId();
			const reviewId = new mongoose.Types.ObjectId();

			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ _id: userId },
				{},
				{ movieId: movieId},
				{ rating: 4, message: 'Updated review' },
			);

			// Arrange: Specify what the database will return
			const existingReview = {
				_id: reviewId,
				user: userId,
				movie: movieId,
				rating: 3,
				message: 'Old review',
				save: () =>
					Promise.resolve({
						_id: reviewId,
						user: userId,
						movie: movieId,
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
		test('should delete user review successfully', async () => {
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
		test('should return 404 when review not found for deletion', async () => {
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

	describe('updateUserProfile - Scenarios', () => {
		test('should update user profile successfully', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.body = { name: 'Old Name', email: 'oldEmail@example.com' };

			// Arrange: Specify what the database will return
			const updatedUser = {
				_id: userId,
				name: 'Updated Name',
				email: 'updated@example.com',
			};

			mockingoose(User).toReturn(updatedUser, 'findOneAndUpdate');

			// Act: Call the function
			await updateUserProfile(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe('Profile updated successfully');
			expect(res.data.user.name).toBe('Updated Name');
			expect(res.data.user.email).toBe('updated@example.com');
		});

		test('should return 404 when user not found', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.body = { name: 'Updated Name' };

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(null, 'findByIdAndUpdate');

			// Assert: Verify the response
			await expect(updateUserProfile(req, res)).rejects.toThrow(
				'User not found'
			);
			expect(res.statusCode).toBe(404);
		});

		test('Updating User should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

			// Arrange: Specify what the database will return
			mockingoose(User).toReturn(
				new Error('Database connection failed'),
				'findOneAndUpdate'
			);

			// Act & Assert: Verify error handling
			await expect(updateUserProfile(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('updateUserMovie - Success Scenarios', () => {
		test('should update user movie status successfully', async () => {
			// Arrange: Setup test with request and response
			const movieId = new mongoose.Types.ObjectId();
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = movieId;
			req.body = { status: 'planned_to_watch', userRating: 4, notes: 'Great movie!' };

			// Arrange: Specify what the database will return
			const updatedUserMovie = {
				_id: 'usermovie123',
				user: 'user123',
				movie: movieId,
				status: 'watched',
				userRating: 4,
				notes: 'Great movie!',
			};
			mockingoose(UserMovie).toReturn(updatedUserMovie, 'findOneAndUpdate');

			// Act: Call the function
			await updateUserMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.message).toBe("Movie status updated successfully.");
			expect(res.data.data.status).toBe('watched');
			expect(res.data.data.movie).toBe(movieId);
		});

		test('should return 404 when user movie not found', async () => {
			// Arrange: Setup test with request and response
			const userId = new mongoose.Types.ObjectId();
			const movieId = new mongoose.Types.ObjectId();

			const { req, res } = createMockReqRes();
			req.user = { _id: userId };
			req.params.movieId = movieId;
			req.body = { status: 'watched' };

			// Arrange: Specify what the database will return
			mockingoose(UserMovie).toReturn(null, 'findOneAndUpdate');

			// Assert: Verify the response
			await expect(updateUserMovie(req, res)).rejects.toThrow('Movie not found in collection.');
			expect(res.statusCode).toBe(404);

		});
	});

	describe('deleteUserMovie - Success Scenarios', () => {
		test('should delete user movie status successfully', async () => {
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
			expect(res.data.message).toBe("Movie removed from user's collection.");
		});

		test('should return 404 when user movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.user = { _id: 'user123' };
			req.params.movieId = 'nonexistent';

			// Arrange: Specify what the database will return
			mockingoose(UserMovie).toReturn(null, 'findOneAndDelete');

			// Assert: Verify the response
			await expect(deleteUserMovie(req, res)).rejects.toThrow('Movie not found in collection.');
			expect(res.statusCode).toBe(404);
		});
	});
});
