import mongoose from 'mongoose';

const userMovieSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		movie: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Movie',
			required: true,
		},
		status: {
			type: String,
			enum: ['planned_to_watch', 'watching', 'watched', 'dropped'],
			default: 'planned_to_watch',
		},
	},
	{ timestamps: true }
);

// Ensures a user can only have one entry for that movie
userMovieSchema.index({ user: 1, movie: 1 }, { unique: true });

const UserMovie = mongoose.model('UserMovie', userMovieSchema);
export default UserMovie;
