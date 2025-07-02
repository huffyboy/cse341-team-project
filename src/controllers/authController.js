import asyncHandler from 'express-async-handler';

// GET /auth/github/callback
// Passport will handle user creation/login. This controller redirects.
const githubCallback = asyncHandler(async (req, res) => {
	// If you ever built a front-end, this is where you'd add a redirect to a specific page
	res.status(200).json({
		message: 'Login successful via GitHub',
		user: req.user,
	});
});

// POST /auth/logout
// Logout user
const logoutUser = asyncHandler(async (req, res, next) => {
	// Note - req.logout is a passport method
	req.logout((err) => {
		if (err) {
			return next(err);
		}

		// Now, let's "destroy" the session completely
		return req.session.destroy((errorDestroying) => {
			if (errorDestroying) {
				console.error('Error destroying session:', errorDestroying);
				return next(errorDestroying);
			}
			res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie
			return res.status(200).json({ message: 'Logged out successfully' });
		});
	});
});

// GET /auth/me
// Get current authenticated user's profile
const getMe = asyncHandler(async (req, res) => {
	res.status(200).json(req.user);
});

export { githubCallback, logoutUser, getMe };
