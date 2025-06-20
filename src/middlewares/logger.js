/**
 * Simple request logging middleware
 * Logs method, path, and status code for each request
 */
const simpleLogger = (req, res, next) => {
	// Override res.end to log the response
	const originalEnd = res.end;
	res.end = function (chunk, encoding) {
		console.log(`${req.method} ${req.path} - ${res.statusCode}`);
		originalEnd.call(this, chunk, encoding);
	};

	next();
};

export default simpleLogger;
