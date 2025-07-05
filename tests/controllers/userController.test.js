// Unit tests for user controller
import mockingoose from 'mockingoose';
import User from '../../src/models/User.js';
import Review from '../../src/models/Review.js';
import { deleteUserAccount } from '../../src/controllers/userController.js';

describe('User Controller - Implemented Functions', () => {
	describe('deleteUserAccount', () => {
		let req;
		let res;

		beforeEach(() => {
			req = { user: { _id: 'user123' } };
			res = {
				status(code) {
					this.statusCode = code;
					return this;
				},
				json(data) {
					this.data = data;
					return this;
				},
			};
			mockingoose.resetAll();
		});

		it('should delete user and their reviews', async () => {
			mockingoose(User).toReturn({ _id: 'user123' }, 'findOneAndDelete');
			mockingoose(Review).toReturn({}, 'deleteMany');

			await deleteUserAccount(req, res);

			expect(res.statusCode).toBe(200);
			expect(res.data).toEqual({
				message: 'User account deleted successfully',
				userId: 'user123',
			});
		});

		it('should return 404 if user not found', async () => {
			mockingoose(User).toReturn(null, 'findOneAndDelete');

			await expect(deleteUserAccount(req, res)).rejects.toThrow(
				'User not found'
			);
			expect(res.statusCode).toBe(404);
		});
	});

	describe('getUserMovieReview', () => {
		test.skip('should return user review for movie', async () => {
			// TODO: Implement when we can properly mock the Review model
			// This function requires database interaction
		});

		test.skip('should return 404 when review not found', async () => {
			// TODO: Implement when we can properly mock the Review model
		});
	});

	describe('createUserMovieReview', () => {
		test.skip('should create new review successfully', async () => {
			// TODO: Implement when we can properly mock the Movie and Review models
			// This function requires database interaction
		});
	});

	describe('updateUserMovieReview', () => {
		test.skip('should update existing review', async () => {
			// TODO: Implement when we can properly mock the Review model
			// This function requires database interaction
		});
	});
});
