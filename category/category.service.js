const db = require('_helpers/db');
const { validationResult } = require('express-validator');

const Category = db.Category;

//  Get all Categories
const getCategories = async (req, res) => {
	categories = await Category.find();

	return res.json(categories);
};

// Create a new Category
const createCategory = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, image } = req.body;

	try {
		// Check if Category exists
		let category = await Category.findOne({ name });

		if (category) {
			return res.status(400).json({ msg: `Category ${category.name} Exists` });
		}

		// Create Category Object
		category = new Category({
			name,
			image,
		});

		// Save Category to db
		await category.save();

		// res.json(`Category ${category} successfully created`)
		res.json(category);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

//   Delete a Category
const deleteCategory = async (req, res) => {
	try {
		// Check if id matches any category from db
		let category = await Category.findById(req.params.id);

		if (!category) return res.status(404).json({ msg: 'Category not found' });

		// Remove category by id
		await Category.findByIdAndRemove(req.params.id);

		res.json({ msg: 'Category Deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = {
	getCategories,
	createCategory,
	deleteCategory,
};
