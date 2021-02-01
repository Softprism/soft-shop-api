const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
	name: { type: String, unique: true, required: true },
	image: [{ type: String, required: true }], // array to store multiple images
	createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', CategorySchema);
