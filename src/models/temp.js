import mongoose from 'mongoose';

/**
 * Temporary model for testing Mongoose setup
 * This model will be removed once proper models are implemented
 */
const tempSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		type: {
			type: String,
			required: true,
			trim: true,
		},
		value: {
			type: Number,
			required: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		collection: 'temp',
	}
);

// Add a simple instance method
tempSchema.methods.getFullMessage = function () {
	return `${this.name}: ${this.message}`;
};

// Add a static method
tempSchema.statics.findActive = function () {
	return this.find({ isActive: true });
};

export default mongoose.model('Temp', tempSchema);
