// Unit tests for auth controller functions

import {
	githubCallback,
	logoutUser,
	getMe,
} from '../../src/controllers/authController.js';

describe('Auth Controller', () => {
	let mockReq;
	let mockRes;
	let mockNext;

	beforeEach(() => {
		// Arrange: Setup test with request and response
		mockReq = {
			user: {
				_id: 'user123',
				name: 'Test User',
				email: 'test@example.com',
				githubUsername: 'testuser',
			},
			logout: (callback) => callback(null),
			session: {
				destroy: (callback) => callback(null),
			},
		};

		mockRes = {
			status(code) {
				this.statusCode = code;
				return this;
			},
			json(data) {
				this.data = data;
				return this;
			},
			clearCookie(name) {
				this.clearedCookie = name;
				return this;
			},
		};

		mockNext = () => {};
	});

	describe('getMe function', () => {
		test('should return current user profile', async () => {
			// Act: Call the function
			await getMe(mockReq, mockRes);

			// Assert: Verify the response
			expect(mockRes.statusCode).toBe(200);
			expect(mockRes.data).toEqual(mockReq.user);
		});

		test('should handle missing user gracefully', async () => {
			// Arrange: Setup test with request and response
			mockReq.user = null;

			// Act: Call the function
			await getMe(mockReq, mockRes);

			// Assert: Verify the response
			expect(mockRes.statusCode).toBe(200);
			expect(mockRes.data).toBeNull();
		});
	});

	describe('logoutUser function', () => {
		test('should logout user successfully', async () => {
			// Act: Call the function
			await logoutUser(mockReq, mockRes, mockNext);

			// Assert: Verify the response
			expect(mockRes.statusCode).toBe(200);
			expect(mockRes.data).toEqual({ message: 'Logged out successfully' });
			expect(mockRes.clearedCookie).toBe('connect.sid');
		});
	});

	describe('githubCallback function', () => {
		test('should return success message and user data', async () => {
			// Act: Call the function
			await githubCallback(mockReq, mockRes);

			// Assert: Verify the response
			expect(mockRes.statusCode).toBe(200);
			expect(mockRes.data).toEqual({
				message: 'Login successful via GitHub',
				user: mockReq.user,
			});
		});
	});
});
