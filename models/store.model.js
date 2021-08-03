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
	deliveryTime: { type: String },
	location: {
		longitude: { type: String },
		latitude: { type: String },
	},
  labels: [{
    labelTitle: {type: String},
    labelThumb: {type: String} //Label thumbnail
  }],
	rating: { type: Number },
	createdDate: { type: Date, default: Date.now },
});

const Store = mongoose.model('Store', StoreSchema);

export default Store;
