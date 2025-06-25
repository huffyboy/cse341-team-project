import { body, param, query } from 'express-validator';
import handleValidationErrors from './validationMiddleware.js';

const movieIdParamValidationRules = [
	param('movieId').isMongoId().withMessage('Invalid Movie ID format.'),
];

// For creating a movie
export const validateMovieCreation = [
	body('title').notEmpty().trim().withMessage('Title is required.'),
	body('year')
		.notEmpty()
		.isInt({ min: 1888 })
		.withMessage('Valid year is required.'), // 1888: Round Hay Garden Scene
	body('length')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Length must be a positive integer (minutes).'),
	body('rating').optional().isString().trim(),
	body('genre')
		.optional()
		.isArray()
		.withMessage('Genre must be an array of strings.'),
	body('genre.*')
		.optional()
		.isString()
		.trim()
		.withMessage('Each genre must be a string.'), // Validate elements within the array
	body('description').optional().isString().trim(),
	body('director')
		.optional()
		.isString()
		.withMessage('Director must be a text string.'),
	body('posterUrl')
		.optional()
		.isURL()
		.withMessage('Poster URL must be a valid URL.'),
	handleValidationErrors,
];

// For updating a movie (most fields are optional)
export const validateMovieUpdate = [
	...movieIdParamValidationRules, // Validate :movieId from param
	body('title')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Title cannot be empty if provided.'),
	body('year')
		.optional()
		.isInt({ min: 1888 })
		.withMessage('Valid year is required if provided.'),
	body('length')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Length must be a positive integer (minutes).'),
	body('rating').optional().isString().trim(),
	body('genre')
		.optional()
		.isArray()
		.withMessage('Genre must be an array of strings.'),
	body('genre.*')
		.optional()
		.isString()
		.trim()
		.withMessage('Each genre must be a string.'),
	body('description').optional().isString().trim(),
	body('director')
		.optional()
		.isString()
		.withMessage('Director must be a text string.'),
	body('posterUrl')
		.optional()
		.isURL()
		.withMessage('Poster URL must be a valid URL.'),
	handleValidationErrors,
];

export const validateMovieId = [
	movieIdParamValidationRules,
	handleValidationErrors,
];

// For query parameters when listing movies
export const validateMovieListQuery = [
	query('genre')
		.optional()
		.isString()
		.trim()
		.withMessage('Genre filter must be a string.'),
	query('year')
		.optional()
		.isInt()
		.withMessage('Year filter must be an integer.'),
	// Or other parameters we can add
	handleValidationErrors,
];

export { movieIdParamValidationRules };
