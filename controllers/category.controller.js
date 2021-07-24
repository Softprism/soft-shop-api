const express = require('express');
const router = express.Router();
const categoryService = require('../services/category.service');

const { check, validationResult } = require('express-validator');

// @route   GET /category
// @desc    Get all Categories
// @access  Public
router.get('/', getCategories);

// @route   POST /category/new
// @desc    Create New Category
// @access  Public
router.post(
	'/new',
	[
		check('name', 'Please enter valid category name').isString(),
		check('image', 'Please upload Image').exists(),
	],
	createCategory
);

// @route   PUT /category/edit/:id
// @desc    Edit Category Category
// @access  Public
router.put('/edit/:id', editCategory);

// @route   DELETE /category/delete/:id
// @desc    Create New Category
// @access  Public
router.delete('/delete/:id', deleteCategory);

// FUNCTIONS
// Get Categories
function getCategories(req, res, next) {
	// Call getCategories function from category service
	categoryService.getCategories().then((categories) =>
		categories && categories.length > 0
			? res.json({ categories })
			: res
					.status(400)
					.json({ msg: 'No Categories found' })
					.catch((err) => next(err))
	);
}

// Create Category
function createCategory(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	categoryService
		.createCategory(req.body)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

// Edit Category
function editCategory(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	categoryService
		.editCategory(req.body, req.params.id)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function deleteCategory(req, res, next) {
	categoryService
		.deleteCategory(req.params.id)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

module.exports = router;
