import mongoose from 'mongoose';

const CategorySchema = mongoose.Schema({
	name: { type: String, unique: true, required: true },
	image: [{ type: String, required: true }], // array to store multiple images
	createdDate: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', CategorySchema);
export default Category
