/**
 * Error handling middleware
 * Handles server errors and logs them
 */
const errorHandler = (err, req, res, _next) => {
	console.error(`ERROR: ${err.message}`);
	res.status(500).json({ error: 'Something went wrong!' });
};

/**
 * 404 handler middleware
 * Handles routes that are not found
 */
const notFoundHandler = (req, res) => {
	res.status(404).json({ error: 'Route not found' });
};

export { errorHandler, notFoundHandler };
