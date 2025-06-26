import express from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController.js';
import ensureAuthenticated from '../middlewares/authMiddleware.js';
import {
	validateReviewUpdate,
	validateReviewId,
} from '../middlewares/reviewValidators.js';

const router = express.Router();

// All review modification routes require user to be authenticated
router.use(ensureAuthenticated);

router
	.route('/:reviewId')
	.put(validateReviewUpdate, updateReview)
	.delete(validateReviewId, deleteReview);

export default router;
