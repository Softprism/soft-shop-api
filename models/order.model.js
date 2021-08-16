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
		},

		// product_meta: [
		// 	{
		// 		product_id: {
		// 			type: mongoose.Schema.Types.ObjectId,
		// 			ref: 'Product',
		// 			required: true,
		// 		},
		//     selectedVariants: [{
		//       variantTitle: {type: String}, // eg Toppings
		//       variantItem: [{
		//         itemName: {type: String},
		//         itemThumbnail: {type: String},
		//         itemPrice: {type: Number}
		//       }]
		//     }],
		// 		quantity: { type: Number, required: true },
		// 	},
		// ],
		// paymentMethod: {type: String},
		// deliveryMethod: {type: String},
		// store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
		// user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		// status: { type: String, required: true, default: 'sent' }, // "sent","received","delivered","canceled", "complete"
		// favorite: { type: Boolean, default: false },
		// createdDate: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
