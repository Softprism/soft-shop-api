import mongoose from 'mongoose';

const StoreSchema = mongoose.Schema({
	name: { type: String, required: true },
	images: [{ type: String, required: true }], // array to store multiple images
	address: { type: String, required: true },
	phone_number: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	rating: { type: Number, required: false },
	openingTime: { type: String, required: true },
	closingTime: { type: String, required: true },
	createdDate: { type: Date, default: Date.now },
});

const Store = mongoose.model('Store', StoreSchema);

export default Store;
