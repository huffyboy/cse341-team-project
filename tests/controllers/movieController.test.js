// Unit tests for movie controller - Testing behavior and scenarios
import mockingoose from 'mockingoose';
import Movie from '../../src/models/Movie.js';
import Review from '../../src/models/Review.js';
import {
	createMovie,
	updateMovie,
	deleteMovie,
	getAllMovies,
	getMovieById,
} from '../../src/controllers/movieController.js';

describe('Movie Controller - Behavior and Scenario Testing', () => {
	// Helper function to create mock request/response objects
	const createMockReqRes = (
		paramsData = {},
		bodyData = {},
		queryData = {}
	) => {
		const req = {
			params: paramsData,
			body: bodyData,
			query: queryData,
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

	describe('createMovie - Success Scenarios', () => {
		test('should create new movie successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'The Matrix',
					year: 1999,
					rating: 'R',
					genre: ['Action', 'Sci-Fi'],
					length: 136,
					description: 'A computer programmer discovers a mysterious world.',
					director: 'Wachowski Sisters',
					posterUrl: 'https://example.com/matrix.jpg',
				}
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');
			const newMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
				rating: 'R',
				genre: ['Action', 'Sci-Fi'],
				length: 136,
				description: 'A computer programmer discovers a mysterious world.',
				director: 'Wachowski Sisters',
				posterUrl: 'https://example.com/matrix.jpg',
			};
			mockingoose(Movie).toReturn(newMovie, 'save');

			// Act: Call the function
			await createMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data.success).toBe(true);
			expect(res.data.message).toBe('Movie created successfully');
			expect(res.data.data.title).toBe('The Matrix');
			expect(res.data.data.year).toBe(1999);
		});

		test('should create movie with minimal required fields', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'Minimal Movie',
					year: 2023,
				}
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');
			const newMovie = {
				_id: 'movie456',
				title: 'Minimal Movie',
				year: 2023,
			};
			mockingoose(Movie).toReturn(newMovie, 'save');

			// Act: Call the function
			await createMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data.success).toBe(true);
			expect(res.data.data.title).toBe('Minimal Movie');
			expect(res.data.data.year).toBe(2023);
		});
	});

	describe('createMovie - Error Scenarios', () => {
		test('should return 409 when movie with same title and year exists', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'The Matrix',
					year: 1999,
					rating: 'R',
					genre: ['Action', 'Sci-Fi'],
				}
			);

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'existing123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findOne');

			// Act & Assert: Verify error handling
			await expect(createMovie(req, res)).rejects.toThrow(
				'Movie with this title and year already exists'
			);
			expect(res.statusCode).toBe(409);
		});

		test('should handle database errors during creation', async () => {
			// Arrange
			const { req, res } = createMockReqRes({}, { title: 'Test', year: 2023 });

			// Mock the findOne check to pass, but the save operation to fail
			mockingoose(Movie).toReturn(null, 'findOne');
			mockingoose(Movie).toReturn(new Error('Database error on save'), 'save');

			// Act & Assert
			await expect(createMovie(req, res)).rejects.toThrow(
				'Database error on save'
			);
		});
	});

	describe('createMovie - Edge Cases', () => {
		test('should handle special characters in title and description', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'Movie with 🎬 & Special Characters!',
					year: 2023,
					description: 'A movie with emojis 🎭 and special chars! 💯',
					director: 'Director Name',
				}
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');
			const newMovie = {
				_id: 'movie789',
				title: 'Movie with 🎬 & Special Characters!',
				year: 2023,
				description: 'A movie with emojis 🎭 and special chars! 💯',
				director: 'Director Name',
			};
			mockingoose(Movie).toReturn(newMovie, 'save');

			// Act: Call the function
			await createMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data.data.title).toBe('Movie with 🎬 & Special Characters!');
			expect(res.data.data.description).toBe(
				'A movie with emojis 🎭 and special chars! 💯'
			);
		});

		test('should handle very long description', async () => {
			// Arrange: Setup test with request and response
			const longDescription = 'A'.repeat(1000);
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'Long Description Movie',
					year: 2023,
					description: longDescription,
				}
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');
			const newMovie = {
				_id: 'movie999',
				title: 'Long Description Movie',
				year: 2023,
				description: longDescription,
			};
			mockingoose(Movie).toReturn(newMovie, 'save');

			// Act: Call the function
			await createMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(201);
			expect(res.data.data.description).toBe(longDescription);
		});
	});

	describe('updateMovie - Success Scenarios', () => {
		test('should update existing movie successfully', async () => {
			// Arrange
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ title: 'Updated Matrix', year: 1999 }
			);
			const existingMovie = { _id: 'movie123', title: 'The Matrix' };
			const updatedMovieData = { ...existingMovie, title: 'Updated Matrix' };

			// Mock the initial findById check
			mockingoose(Movie).toReturn(existingMovie, 'findOne');
			// Mock the duplicate check
			mockingoose(Movie).toReturn(null, 'findOne');

			// FIX: Make the findByIdAndUpdate mock specific and robust
			mockingoose(Movie).toReturn(updatedMovieData, 'findOneAndUpdate', {
				_id: 'movie123',
			});

			// Act
			await updateMovie(req, res);

			// Assert
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.data.title).toBe('Updated Matrix');
		});

		test('should update only specific fields', async () => {
			// Arrange
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ rating: 'PG-13' }
			);
			const existingMovie = { _id: 'movie123', title: 'The Matrix' };
			const updatedMovieData = { ...existingMovie, rating: 'PG-13' };

			// Mock the initial findById check
			mockingoose(Movie).toReturn(existingMovie, 'findOne');

			// FIX: Use findOneAndUpdate here as well, as it's the underlying operation
			mockingoose(Movie).toReturn(updatedMovieData, 'findOneAndUpdate', {
				_id: 'movie123',
			});

			// Act
			await updateMovie(req, res);

			// Assert
			expect(res.statusCode).toBe(200);
			expect(res.data.data.rating).toBe('PG-13');
			expect(res.data.data.title).toBe('The Matrix');
		});
	});

	describe('updateMovie - Error Scenarios', () => {
		test('should return 404 when movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'nonexistent' },
				{ title: 'Updated Title' }
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne'); // Mocks findById

			// Act & Assert: Verify error handling
			await expect(updateMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		test('should return 409 when updated title and year conflict with existing movie', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ title: 'Existing Movie', year: 2020 }
			);

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			// Mock the first findById call
			mockingoose(Movie).toReturn(existingMovie, 'findOne');
			const conflictingMovie = {
				_id: 'movie456',
				title: 'Existing Movie',
				year: 2020,
			};
			// Mock the second findOne call for duplicate check
			mockingoose(Movie).toReturn(conflictingMovie, 'findOne');

			// Act & Assert: Verify error handling
			await expect(updateMovie(req, res)).rejects.toThrow(
				'Movie with this title and year already exists'
			);
			expect(res.statusCode).toBe(409);
		});

		test('should handle database errors during update', async () => {
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ title: 'Updated Title' }
			);
			// Make the initial findById call fail
			mockingoose(Movie).toReturn(new Error('Database connection failed'), 'findOne');

			await expect(updateMovie(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	// REPLACE THIS ENTIRE BLOCK
	describe('deleteMovie - Success Scenarios', () => {
		test('should delete movie successfully', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie123' });
			const movieToDelete = { _id: 'movie123', title: 'The Matrix' };

			mockingoose(Movie).toReturn(movieToDelete, 'findOne'); // Mocks findById
			mockingoose(Review).toReturn([], 'find'); // Mocks review check
			mockingoose(Movie).toReturn(movieToDelete, 'findByIdAndDelete');

			await deleteMovie(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data.data.id).toBe('movie123');
		});

		test('should handle deletion of different movie IDs', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie456' });
			const movieToDelete = { _id: 'movie456', title: 'Inception' };

			mockingoose(Movie).toReturn(movieToDelete, 'findOne');
			mockingoose(Review).toReturn([], 'find');
			mockingoose(Movie).toReturn(movieToDelete, 'findByIdAndDelete');

			await deleteMovie(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data.data.id).toBe('movie456');
		});
	});

	describe('deleteMovie - Error Scenarios', () => {
		test('should return 404 when movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne'); // Mocks findById

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		test('should return 400 when movie has existing reviews', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findOne'); // Mocks findById
			const relatedReviews = [
				{ _id: 'review1', movie: 'movie123', rating: 5 },
				{ _id: 'review2', movie: 'movie123', rating: 4 },
			];
			mockingoose(Review).toReturn(relatedReviews, 'find');

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow(
				'Cannot delete movie with existing reviews'
			);
			expect(res.statusCode).toBe(400);
		});

		test('should handle database errors during deletion', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findOne'); // Mocks findById
			mockingoose(Review).toReturn([], 'find');
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'findByIdAndDelete'
			);

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('deleteMovie - Edge Cases', () => {
		test('should handle invalid movie ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne'); // Mocks findById

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		test('should handle empty movie ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: '' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne'); // Mocks findById

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('getAllMovies - Success Scenarios', () => {
		test('should return all movies when no filters applied', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, {});

			// Arrange: Specify what the database will return
			const mockMovies = [
				{
					_id: 'movie1',
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
				},
				{
					_id: 'movie2',
					title: 'Inception',
					year: 2010,
					genre: ['Action', 'Thriller'],
					director: 'Christopher Nolan',
				},
			];
			mockingoose(Movie).toReturn(mockMovies, 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.count).toBe(2);
			expect(res.data.data).toHaveLength(2);
		});

		test('should filter movies by genre', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, { genre: 'Action' });

			// Arrange: Specify what the database will return
			const filteredMovies = [
				{
					_id: 'movie1',
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
				},
			];
			mockingoose(Movie).toReturn(filteredMovies, 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1);
			expect(res.data.data[0].title).toBe('The Matrix');
		});

		test('should filter movies by year', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, { year: '1999' });

			// Arrange: Specify what the database will return
			const filteredMovies = [
				{
					_id: 'movie1',
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
				},
			];
			mockingoose(Movie).toReturn(filteredMovies, 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1);
			expect(res.data.data[0].year).toBe(1999);
		});

		test('should filter movies by director', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{},
				{ director: 'Christopher Nolan' }
			);

			// Arrange: Specify what the database will return
			const filteredMovies = [
				{
					_id: 'movie2',
					title: 'Inception',
					year: 2010,
					genre: ['Action', 'Thriller'],
					director: 'Christopher Nolan',
				},
			];
			mockingoose(Movie).toReturn(filteredMovies, 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1);
			expect(res.data.data[0].director).toBe('Christopher Nolan');
		});

		test('should filter movies by title (case-insensitive)', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, { title: 'matrix' });

			// Arrange: Specify what the database will return
			const filteredMovies = [
				{
					_id: 'movie1',
					title: 'The Matrix',
					year: 1999,
					genre: ['Action', 'Sci-Fi'],
					director: 'Wachowski Sisters',
				},
			];
			mockingoose(Movie).toReturn(filteredMovies, 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(1);
			expect(res.data.data[0].title).toBe('The Matrix');
		});

		test('should return empty array when no movies match filters', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, { genre: 'Horror' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn([], 'find');

			// Act: Call the function
			await getAllMovies(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.count).toBe(0);
			expect(res.data.data).toEqual([]);
		});
	});

	describe('getAllMovies - Error Scenarios', () => {
		test('should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({}, {}, {});

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'find'
			);

			// Act & Assert: Verify error handling
			await expect(getAllMovies(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	// REPLACE THIS ENTIRE BLOCK
	describe('getMovieById - Success Scenarios', () => {
		test('should return a specific movie by ID', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie123' });
			const mockMovie = { _id: 'movie123', title: 'The Matrix' };
			mockingoose(Movie).toReturn(mockMovie, 'findOne');

			await getMovieById(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data._id).toBe('movie123');
		});

		test('should handle different movie IDs', async () => {
			const { req, res } = createMockReqRes({ movieId: 'movie456' });
			const mockMovie = { _id: 'movie456', title: 'Inception' };
			mockingoose(Movie).toReturn(mockMovie, 'findOne');

			await getMovieById(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data._id).toBe('movie456');
		});
	});

	describe('getMovieById - Error Scenarios', () => {
		test('should return 404 for non-existent movie', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');

			// Act & Assert: Verify that the specific error is thrown
			await expect(getMovieById(req, res)).rejects.toThrow('Movie not found');
			// And that the status code was set correctly before throwing
			expect(res.statusCode).toBe(404);
		});
		test('should return 400 for invalid movie ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			const castError = new Error('Cast to ObjectId failed');
			mockingoose(Movie).toReturn(castError, 'findOne');

			// Act: Call the function and Assert
			await expect(getMovieById(req, res)).rejects.toThrow(
				'Cast to ObjectId failed'
			);
		});

		test('should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'findOne'
			);

			// Act: Call the function
			await expect(getMovieById(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});
});