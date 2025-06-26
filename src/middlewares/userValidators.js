import { body } from 'express-validator';
import handleValidationErrors from './validationMiddleware.js';
import { reviewBodyValidationRules } from './reviewValidators.js';
import { movieIdParamValidationRules as generalMovieIdParamRules } from './movieValidators.js';

export const validateUserProfileUpdate = [
	body('name')
		.optional()
		.isString()
		.trim()
		.notEmpty()
		.withMessage('Name cannot be empty if provided.'),
	body('email')
		.optional()
		.isEmail()
		.normalizeEmail()
		.withMessage('Invalid email format.'),
	// If we decide to add other fields
	handleValidationErrors,
];

export const validateAddUserMovie = [
	body('movieId')
		.isMongoId()
		.withMessage('Valid Movie ID is required for adding to collection.'),
	body('status')
		.notEmpty()
		.withMessage('Status is required.')
		.isIn(['planned_to_watch', 'watching', 'watched', 'dropped'])
		.withMessage('Invalid status value.'),
	handleValidationErrors,
];

export const validateUserMovieStatusUpdate = [
	...generalMovieIdParamRules, // Validates :movieId in /users/me/movies/:movieId
	body('status')
		.optional()
		.isIn(['planned_to_watch', 'watching', 'watched', 'dropped'])
		.withMessage('Invalid status value if provided.'),
	handleValidationErrors,
];

// For GET /users/me/movies/:movieId/review
export const validateUserMovieReviewGet = [
	...generalMovieIdParamRules,
	handleValidationErrors,
];

// For POST /users/me/movies/:movieId/review
export const validateUserMovieReviewCreation = [
	...generalMovieIdParamRules, // from movieValidators (validates :movieId in path)
	...reviewBodyValidationRules, // from reviewValidators (validates body)
	handleValidationErrors,
];

// For PUT /users/me/movies/:movieId/review
export const validateUserMovieReviewUpdate = [
	...generalMovieIdParamRules,
	...reviewBodyValidationRules,
	handleValidationErrors,
];

// For DELETE /users/me/movies/:movieId/review and /users/me/movies/:movieId
export const validateUserMoviePathParams = [
	...generalMovieIdParamRules,
	handleValidationErrors,
];
