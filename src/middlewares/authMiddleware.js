import asyncHandler from 'express-async-handler';

// Stubbed out only
const ensureAuthenticated = asyncHandler(async (req, res, next) => {
	// Once implemented, we'll check for valid session/JWT here
	if (req.isAuthenticated && req.isAuthenticated()) {
		return next();
	}

	console.log('Auth Middleware: User not authenticated (placeholder)');
	// res.status(401).json({ message: 'Not authorized, no token or session' });

	if (!req.user) {
		console.warn('Auth Middleware: Mocking req.user for stub development.'); // Just mocking a user for the stubs til we add OAuth
		req.user = {
			_id: 'mockUserId123',
			name: 'Mock User',
			githubId: 'mockGithubId',
		};
	}
	return next();
});

export default ensureAuthenticated;
