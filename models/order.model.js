import mongoose from 'mongoose';

const OrderSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		orderId: {
			type: String,
			unique: true,
		},
		orderItems: [
			{
				name: { type: String, required: true },
				qty: { type: Number, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				product: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'Product',
				},
			},
		],
		deliveryAddress: {
			type: String,
			required: true,
		},
		paymentMethod: {
			type: String,
			required: true,
		},
		paymentResult: { type: String },
		taxPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		deliveryPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		totalPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		isDelivered: {
			type: Boolean,
			required: true,
			default: false,
		}
	},
	{ timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
