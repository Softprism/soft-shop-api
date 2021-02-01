const express = require('express');
const router = express.Router();
const categoryService = require('./category.service');

const { check } = require('express-validator');

// @route   GET /category
// @desc    Get all Categories
// @access  Public
router.get('/', categoryService.getCategories);

// @route   POST /category/new
// @desc    Create New Category
// @access  Public
router.post(
	'/new',
	[
		check('name', 'Please enter valid category name').isString(),
		check('image', 'Please upload Image').exists(),
	],
	categoryService.createCategory
);

// @route   DELETE /category/delete/:id
// @desc    Create New Category
// @access  Public
router.delete('/delete/:id', categoryService.deleteCategory);

module.exports = router;
