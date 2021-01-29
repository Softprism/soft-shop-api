const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	phone_number: { type: String, required: true },
	address: [{ type: String, required: true }],
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	orders: [{ type: mongoose.Types.ObjectId, ref: 'Order' }], // array to store multiple orders
	createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
