import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String, // Can't make this required as Github doesn't always provide an email
		},
		githubId: {
			type: String,
			required: true,
			unique: true,
		},
		githubUsername: String,
		avatarUrl: String,
		// Since this is OAuth, no pw field needs to be stored
	},
	{ timestamps: true } // Adds createdAt and updatedAt entries
);

const User = mongoose.model('User', userSchema);
export default User;