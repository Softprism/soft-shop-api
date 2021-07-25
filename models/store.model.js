const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
	name: { type: String, unique: true, required: true },
	images: [{ type: String, required: true }], // array to store multiple images
	address: { type: String, required: true },
	phone_number: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	rating: { type: String, required: false },
	createdDate: { type: Date, default: Date.now },
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
