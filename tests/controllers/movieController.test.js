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

	describe('createMovie - Success Scenarios', () => {
		it('should create new movie successfully', async () => {
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

		it('should create movie with minimal required fields', async () => {
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
		it('should return 409 when movie with same title and year exists', async () => {
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

		it('should handle database errors during creation', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{},
				{
					title: 'Test Movie',
					year: 2023,
				}
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findOne');
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'save'
			);

			// Act & Assert: Verify error handling
			await expect(createMovie(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('createMovie - Edge Cases', () => {
		it('should handle special characters in title and description', async () => {
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

		it('should handle very long description', async () => {
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
		it('should update existing movie successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{
					title: 'Updated Matrix',
					year: 1999,
					rating: 'PG-13',
					description: 'Updated description',
				}
			);

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
				rating: 'R',
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			mockingoose(Movie).toReturn(null, 'findOne');
			const updatedMovie = {
				_id: 'movie123',
				title: 'Updated Matrix',
				year: 1999,
				rating: 'PG-13',
				description: 'Updated description',
			};
			mockingoose(Movie).toReturn(updatedMovie, 'findByIdAndUpdate');

			// Act: Call the function
			await updateMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.message).toBe('Movie updated successfully');
			expect(res.data.data.title).toBe('Updated Matrix');
			expect(res.data.data.rating).toBe('PG-13');
		});

		it('should update only specific fields', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ rating: 'PG-13' }
			);

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
				rating: 'R',
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			const updatedMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
				rating: 'PG-13',
			};
			mockingoose(Movie).toReturn(updatedMovie, 'findByIdAndUpdate');

			// Act: Call the function
			await updateMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.data.rating).toBe('PG-13');
			expect(res.data.data.title).toBe('The Matrix'); // Unchanged
		});
	});

	describe('updateMovie - Error Scenarios', () => {
		it('should return 404 when movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'nonexistent' },
				{ title: 'Updated Title' }
			);

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(updateMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		it('should return 409 when updated title and year conflict with existing movie', async () => {
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
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			const conflictingMovie = {
				_id: 'movie456',
				title: 'Existing Movie',
				year: 2020,
			};
			mockingoose(Movie).toReturn(conflictingMovie, 'findOne');

			// Act & Assert: Verify error handling
			await expect(updateMovie(req, res)).rejects.toThrow(
				'Movie with this title and year already exists'
			);
			expect(res.statusCode).toBe(409);
		});

		it('should handle database errors during update', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes(
				{ movieId: 'movie123' },
				{ title: 'Updated Title' }
			);

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			mockingoose(Movie).toReturn(null, 'findOne');
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'findByIdAndUpdate'
			);

			// Act & Assert: Verify error handling
			await expect(updateMovie(req, res)).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('deleteMovie - Success Scenarios', () => {
		it('should delete movie successfully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			mockingoose(Review).toReturn([], 'find');
			const deletedMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(deletedMovie, 'findByIdAndDelete');

			// Act: Call the function
			await deleteMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.success).toBe(true);
			expect(res.data.message).toBe('Movie deleted successfully');
			expect(res.data.data.id).toBe('movie123');
			expect(res.data.data.title).toBe('The Matrix');
		});

		it('should handle deletion of different movie IDs', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie456' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie456',
				title: 'Inception',
				year: 2010,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
			mockingoose(Review).toReturn([], 'find');
			const deletedMovie = {
				_id: 'movie456',
				title: 'Inception',
				year: 2010,
			};
			mockingoose(Movie).toReturn(deletedMovie, 'findByIdAndDelete');

			// Act: Call the function
			await deleteMovie(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.data.id).toBe('movie456');
			expect(res.data.data.title).toBe('Inception');
		});
	});

	describe('deleteMovie - Error Scenarios', () => {
		it('should return 404 when movie not found', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		it('should return 400 when movie has existing reviews', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
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

		it('should handle database errors during deletion', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const existingMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
			};
			mockingoose(Movie).toReturn(existingMovie, 'findById');
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
		it('should handle invalid movie ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});

		it('should handle empty movie ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: '' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act & Assert: Verify error handling
			await expect(deleteMovie(req, res)).rejects.toThrow('Movie not found');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('getAllMovies - Success Scenarios', () => {
		it('should return all movies when no filters applied', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

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

		it('should filter movies by genre', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.genre = 'Action';

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

		it('should filter movies by year', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.year = '1999';

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

		it('should filter movies by director', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.director = 'Christopher Nolan';

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

		it('should filter movies by title (case-insensitive)', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.title = 'matrix';

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

		it('should return empty array when no movies match filters', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();
			req.query.genre = 'Horror';

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
		it('should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes();

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

	describe('getMovieById - Success Scenarios', () => {
		it('should return a specific movie by ID', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			const mockMovie = {
				_id: 'movie123',
				title: 'The Matrix',
				year: 1999,
				genre: ['Action', 'Sci-Fi'],
				director: 'Wachowski Sisters',
				rating: 'R',
				length: 136,
				description: 'A computer programmer discovers a mysterious world.',
				posterUrl: 'https://example.com/matrix.jpg',
			};
			mockingoose(Movie).toReturn(mockMovie, 'findById');

			// Act: Call the function
			await getMovieById(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.title).toBe('The Matrix');
			expect(res.data.year).toBe(1999);
			expect(res.data._id).toBe('movie123');
		});

		it('should handle different movie IDs', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie456' });

			// Arrange: Specify what the database will return
			const mockMovie = {
				_id: 'movie456',
				title: 'Inception',
				year: 2010,
				genre: ['Action', 'Thriller'],
				director: 'Christopher Nolan',
			};
			mockingoose(Movie).toReturn(mockMovie, 'findById');

			// Act: Call the function
			await getMovieById(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(200);
			expect(res.data.title).toBe('Inception');
			expect(res.data._id).toBe('movie456');
		});
	});

	describe('getMovieById - Error Scenarios', () => {
		it('should return 404 for non-existent movie', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'nonexistent' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(null, 'findById');

			// Act: Call the function
			await getMovieById(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(404);
			expect(res.data.message).toBe('Movie not found');
		});

		it('should return 400 for invalid movie ID format', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'invalid-id-format' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				new Error('Cast to ObjectId failed'),
				'findById'
			);

			// Act: Call the function
			await getMovieById(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(400);
			expect(res.data.message).toBe('Error retrieving movie');
		});

		it('should handle database errors gracefully', async () => {
			// Arrange: Setup test with request and response
			const { req, res } = createMockReqRes({ movieId: 'movie123' });

			// Arrange: Specify what the database will return
			mockingoose(Movie).toReturn(
				new Error('Database connection failed'),
				'findById'
			);

			// Act: Call the function
			await getMovieById(req, res);

			// Assert: Verify the response
			expect(res.statusCode).toBe(400);
			expect(res.data.message).toBe('Error retrieving movie');
		});
	});
});
