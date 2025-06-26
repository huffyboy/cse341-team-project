import { body, param } from 'express-validator';
import handleValidationErrors from './validationMiddleware.js';

// Rules for the body of a review (rating, message)
const reviewBodyValidationRules = [
	body('rating')
		.notEmpty()
		.withMessage('Rating is required.')
		.isFloat({ min: 1, max: 5 })
		.withMessage('Rating must be a number between 1 and 5.'),
	body('message')
		.notEmpty()
		.withMessage('Review message is required.')
		.isString()
		.withMessage('Message must be a string.')
		.trim()
		.isLength({ min: 1, max: 5000 })
		.withMessage('Review message must be between 1 and 5000 characters.'),
];

// Rules for validating a reviewId in the URL parameters
const reviewIdParamValidationRules = [
	param('reviewId').isMongoId().withMessage('Invalid Review ID format.'),
];

// This might fit better in movieValidators for the routes - but ok here I guess - /movies/:movieId/review
// For updating/deleting a review by its ID
export const validateReviewUpdate = [
	reviewIdParamValidationRules, // Validate :reviewId from param
	...reviewBodyValidationRules, // Spread body rules
	handleValidationErrors, // Handle any validation errors
];

export const validateReviewId = [
	reviewIdParamValidationRules,
	handleValidationErrors,
];

export { reviewBodyValidationRules, reviewIdParamValidationRules };
