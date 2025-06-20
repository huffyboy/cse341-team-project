import Temp from '../models/temp.js';

/**
 * Temporary controller for testing server and Mongoose setup
 * This controller will be removed once proper controllers are implemented
 */

/**
 * GET / - Simple Hello World endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const helloWorld = (req, res) => {
	res.json({
		message: 'Hello World!',
	});
};

/**
 * GET /db - Get all items from temp collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTempData = async (req, res) => {
	try {
		const items = await Temp.find({});
		res.json(items);
	} catch (error) {
		console.error('Database error:', error);
		res.status(500).json({
			error: 'Failed to fetch data from database',
		});
	}
};
