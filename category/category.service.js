const db = require('_helpers/db');
const { validationResult } = require('express-validator');

const Category = db.Category;

const getCategories = async (req, res) => {
	categories = await Category.find();

	return res.json(categories);
};

const createCategory = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, image } = req.body;

	try {
		let category = await Category.findOne({ name });

		if (category) {
			return res.status(400).json({ msg: `Category ${category.name} Exists` });
		}

		category = new Category({
			name,
			image,
		});

		await category.save();

		// res.json(`Category ${category} successfully created`)
		res.json(category);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

module.exports = {
	getCategories,
	createCategory,
};
