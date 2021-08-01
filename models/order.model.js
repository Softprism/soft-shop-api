import mongoose from 'mongoose';

const OrderSchema = mongoose.Schema({
	product_meta: [
		{
			product_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
				required: true,
			},
			quantity: { type: String, required: true },
		},
	],
	store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	status: { type: String, required: true, default: 'sent' }, // "sent","received","delivered","canceled", "complete"
	favorite: { type: Boolean, default: false },
	createdDate: { type: Date, default: Date.now },
});

OrderSchema.methods.favoriteAction = function () {
	//change the previous status of favorite
	this.favorite = !this.favorite;
};

OrderSchema.methods.CancelOrder = function () {
	//change the previous status of favorite
	this.status = 'canceled';
};

OrderSchema.methods.completeOrder = function () {
	//change the previous status of favorite
	this.status = 'completed';
};

OrderSchema.methods.receiveOrder = function () {
	//change the previous status of favorite
	this.status = 'received';
};

OrderSchema.methods.deliverOrder = function () {
	//change the previous status of favorite
	this.status = 'delivered';
};

const Order = mongoose.model('Order', OrderSchema);

export default Order
