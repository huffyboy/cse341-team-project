import asyncHandler from 'express-async-handler';
// import User from '../models/User.js';

// GET /auth/github/callback
// Passport will handle user creation/login. This controller redirects.
const githubCallback = asyncHandler(async (req, res) => {
	res.status(200).json({
		message: 'Login successful via GitHub',
		user: req.user,
	});
});

// POST /auth/logout
// Logout user
const logoutUser = asyncHandler(async (req, res) => {
	res.status(200).json({ message: 'Logged out successfully' });
});

// GET /auth/me
// Get current authenticated user's profile
const getMe = asyncHandler(async (req, res) => {
	res.status(200).json(req.user);
});

export { githubCallback, logoutUser, getMe };
