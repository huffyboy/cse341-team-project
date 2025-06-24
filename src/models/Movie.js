import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		year: {
			type: Number,
			required: true,
		},
		rating: String,     // PG-13, R
		genre: [String],    // Array of strings for multiple genres
		length: {
			type: Number,   // Keeping it stored as an Int
			min: 0,
		},
		description: {
			type: String,
			trim: true,
		},
		director: [String],
		posterUrl: {        // ADDED THIS as it was not included in the proposal and realized we should have poster image
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;