import express from 'express';
import passport from 'passport';
import {
	githubCallback,
	logoutUser,
	getMe,
} from '../controllers/authController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to initiate GitHub OAuth
router.get(
	'/github',
	passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub OAuth callback route
router.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/login-failed' }), // Or some error page/route
	githubCallback
);

// Authenticated User Logout/session termination
router.post('/logout', ensureAuthenticated, logoutUser);

router.get('/me', ensureAuthenticated, getMe);

// We COULD add a login-failed route...

export default router;
