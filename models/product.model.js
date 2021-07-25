const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
	product_name: { type: String, required: true },
	product_image: [{ type: String, required: true }], // array to store multiple images
	store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	availability: { type: Boolean, required: true },
	price: { type: Number, required: true },
	rating: { type: Number, required: false },
	createdDate: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
