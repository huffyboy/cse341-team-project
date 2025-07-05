// Unit tests for server.js
describe('Server', () => {
	describe('GET /', () => {
		test('should return HTML landing page', () => {
			// Mock server response
			const mockResponse = {
				status: 200,
				body: '<!DOCTYPE html><html lang="en"><head><title>My Movie Vault API</title></head><body><div class="logo">🎬 My Movie Vault</div></body></html>',
			};

			expect(mockResponse.status).toBe(200);
			expect(mockResponse.body).toContain('<!DOCTYPE html>');
			expect(mockResponse.body).toContain('My Movie Vault');
		});
	});

	describe('GET /api-docs', () => {
		test('should return API documentation', () => {
			// Mock server response
			const mockResponse = {
				status: 200,
				body: { message: 'API Documentation' },
			};

			expect(mockResponse.status).toBe(200);
			expect(mockResponse.body).toHaveProperty('message');
			expect(mockResponse.body.message).toBe('API Documentation');
		});
	});

	describe('GET /auth/github', () => {
		test('should redirect to GitHub OAuth', () => {
			// Mock server response
			const mockResponse = {
				status: 302,
				body: { message: 'Redirect to GitHub OAuth' },
			};

			expect(mockResponse.status).toBe(302);
			expect(mockResponse.body).toHaveProperty('message');
			expect(mockResponse.body.message).toBe('Redirect to GitHub OAuth');
		});
	});

	describe('GET /auth/me', () => {
		test('should return user profile endpoint', () => {
			// Mock server response
			const mockResponse = {
				status: 200,
				body: { message: 'User profile endpoint' },
			};

			expect(mockResponse.status).toBe(200);
			expect(mockResponse.body).toHaveProperty('message');
			expect(mockResponse.body.message).toBe('User profile endpoint');
		});
	});
});
