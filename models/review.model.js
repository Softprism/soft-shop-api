import mongoose from 'mongoose';

const ReviewSchema = mongoose.Schema({
	star: { type: Number },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
	},
  order: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
	},
	text: { type: String },
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
