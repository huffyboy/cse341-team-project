import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
	{
		movie: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Movie',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 10,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

// If a user wants to change their review, this ensures it is updating the xisting record
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;