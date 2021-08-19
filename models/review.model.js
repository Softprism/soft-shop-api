import mongoose from 'mongoose';

const ReviewSchema = mongoose.Schema({
	star: { type: Number },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	text: { type: String },
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
