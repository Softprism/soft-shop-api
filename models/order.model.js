import mongoose from 'mongoose';

const OrderSchema = mongoose.Schema({
  orderId: {type: String, unique: true},
	product_meta: [
		{
			product_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
				required: true,
			},
      selectedVariants: [{
        variantTitle: {type: String}, // eg Toppings
        variantItem: [{
          itemName: {type: String},
          itemThumbnail: {type: String},
          itemPrice: {type: Number}
        }]
      }],
			quantity: { type: Number, required: true },
		},
	],
  paymentMethod: {type: String},
  deliveryMethod: {type: String},
	store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	status: { type: String, required: true, default: 'sent' }, // "sent","received","delivered","canceled", "complete"
	favorite: { type: Boolean, default: false },
	createdDate: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

export default Order
