import asyncHandler from 'express-async-handler';

// This Middleware ensures that the user is authenticated
const ensureAuthenticated = asyncHandler(async (req, res, next) => {
	// This isAuthenticated is a Method built into the Passport library and returns True if authenticated
	if (req.isAuthenticated()) {
		return next();
	}

	// 401 for unauthorized accecss
	return res.status(401).json({
		message:
			'Unauthorized: You must be logged in to Github to access this resource.',
	});
});

export default ensureAuthenticated;
