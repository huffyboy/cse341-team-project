import express from 'express';
import {
	updateReviewByParams,
	deleteReviewByParams,
} from '../controllers/reviewController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';
import {
	validateReviewUpdate,
	validateReviewId,
} from '../middlewares/reviewValidators.js';

const router = express.Router();

// All review modification routes require user to be authenticated
router.use(ensureAuthenticated);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   put:
 *     summary: Update a review (Administrative)
 *     description: Update a specific review by its ID (requires authentication)
 *     tags: [Reviews]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating (1-5)
 *               message:
 *                 type: string
 *                 description: Review message
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a review (Administrative)
 *     description: Delete a specific review by its ID (requires authentication)
 *     tags: [Reviews]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router
	.route('/:reviewId')
	.put(validateReviewUpdate, updateReviewByParams)
	.delete(validateReviewId, deleteReviewByParams);

export default router;
