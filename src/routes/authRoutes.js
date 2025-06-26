import express from 'express';
import passport from 'passport';
import {
	githubCallback,
	logoutUser,
	getMe,
} from '../controllers/authController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth authentication
 *     description: |
 *       **Important**: This endpoint should be accessed directly in a browser, not through Swagger UI.
 *
 *       Redirects user to GitHub for OAuth authentication. After successful authentication,
 *       GitHub will redirect back to `/auth/github/callback`.
 *
 *       **Usage**:
 *       - Open this URL directly in your browser: `/auth/github`
 *
 *       **Note**: This endpoint will not work properly when called from Swagger UI due to OAuth redirect requirements.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth authorization page
 *         headers:
 *           Location:
 *             description: GitHub OAuth URL
 *             schema:
 *               type: string
 *               example: "https://github.com/login/oauth/authorize?client_id=..."
 */
router.get(
	'/github',
	passport.authenticate('github', { scope: ['user:email'] })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: |
 *       Handles the OAuth callback from GitHub after successful authentication.
 *       Can be used in Swagger UI if you provide a valid authorization code, though not recommended.
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub (required)
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful via GitHub"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/login-failed' }), // Or some error page/route
	githubCallback
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Terminates the user's session
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', ensureAuthenticated, logoutUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', ensureAuthenticated, getMe);

// We COULD add a login-failed route...

export default router;
