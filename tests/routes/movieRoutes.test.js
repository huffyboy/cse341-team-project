// Integration tests for movie routes using supertest
import request from 'supertest';
import express from 'express';
import movieRoutes from '../../src/routes/movieRoutes.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

describe('Movie Routes - Integration Tests', () => {
	describe('GET /movies', () => {
		test('should return all movies with 200 status', async () => {
			// Act: Make HTTP request to the route
			const response = await request(app).get('/movies').expect(200);

			// Assert: Verify response structure
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('success');
			expect(response.body).toHaveProperty('count');
			expect(response.body).toHaveProperty('data');
			expect(Array.isArray(response.body.data)).toBe(true);
		});

		test('should support query filters', async () => {
			// Act: Make HTTP request with query parameters
			const response = await request(app)
				.get('/movies?genre=Action&year=1999')
				.expect(200);

			// Assert: Verify filtered response
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			expect(Array.isArray(response.body.data)).toBe(true);
		});
	});

	describe('GET /movies/:movieId', () => {
		test('should return movie by ID with 200 status', async () => {
			// Act: Make HTTP request with movie ID
			const response = await request(app).get('/movies/movie123').expect(200);

			// Assert: Verify movie data
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('_id');
			expect(response.body).toHaveProperty('title');
			expect(response.body).toHaveProperty('year');
		});

		test('should return 404 for non-existent movie', async () => {
			// Act: Make HTTP request with invalid movie ID
			const response = await request(app)
				.get('/movies/nonexistent')
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('POST /movies', () => {
		test('should create new movie with 201 status', async () => {
			// Arrange: Movie data
			const movieData = {
				title: 'Test Movie',
				year: 2023,
				genre: ['Action'],
				director: 'Test Director',
			};

			// Act: Make HTTP request to create movie
			const response = await request(app)
				.post('/movies')
				.send(movieData)
				.expect(201);

			// Assert: Verify successful creation
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('success');
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('data');
		});

		test('should return 409 when movie already exists', async () => {
			// Arrange: Duplicate movie data
			const movieData = {
				title: 'Existing Movie',
				year: 2023,
			};

			// Act: Make HTTP request with duplicate data
			const response = await request(app)
				.post('/movies')
				.send(movieData)
				.expect(409);

			// Assert: Verify conflict response
			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('PUT /movies/:movieId', () => {
		test('should update movie with 200 status', async () => {
			// Arrange: Update data
			const updateData = {
				title: 'Updated Movie',
				year: 2023,
			};

			// Act: Make HTTP request to update movie
			const response = await request(app)
				.put('/movies/movie123')
				.send(updateData)
				.expect(200);

			// Assert: Verify successful update
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('success');
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('data');
		});

		test('should return 404 when movie not found', async () => {
			// Arrange: Update data
			const updateData = {
				title: 'Updated Movie',
			};

			// Act: Make HTTP request with invalid movie ID
			const response = await request(app)
				.put('/movies/nonexistent')
				.send(updateData)
				.expect(404);

			// Assert: Verify error response
			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('DELETE /movies/:movieId', () => {
		test('should delete movie with 200 status', async () => {
			// Act: Make HTTP request to delete movie
			const response = await request(app)
				.delete('/movies/movie123')
				.expect(200);

			// Assert: Verify successful deletion
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('success');
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('data');
		});

		test('should return 400 when movie has reviews', async () => {
			// Act: Make HTTP request to delete movie with reviews
			const response = await request(app)
				.delete('/movies/movieWithReviews')
				.expect(400);

			// Assert: Verify error response
			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('PUT /movies/:movieId/reviews', () => {
		test.skip('should update review for movie with 200 status', async () => {
			// TODO: Implement when administrative review update function is fully implemented
		});
	});

	describe('DELETE /movies/:movieId/reviews', () => {
		test.skip('should delete review for movie with 200 status', async () => {
			// TODO: Implement when administrative review delete function is fully implemented
		});
	});
});
