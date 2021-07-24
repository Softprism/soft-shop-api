import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js'
const router = express.Router();

import { findProduct, deleteProduct, getStoreProducts, updateProduct, createProduct, getProducts } from '../controllers/product.controller.js'

// @route   GET /product
// @desc    Get all products from all stores.
// @access  Private
router.get('/', getProducts);

// @route   POST /create
// @desc    add a new product to store
// @access  Private
router.post(
	'/create',
	[
		check('product_name', 'Please Enter Product Name').not().isEmpty(),
		// check('images', 'Please add images for your store').not().isEmpty(),
		check('category', 'Please select Category').not().isEmpty(),
		check('availability', 'Please select availability status').not().isEmpty(),
		check('price', 'Please enter price of product').not().isEmpty(),
		// check('rating', 'Please Enter Stores Address').not().isEmpty(),
	],
	createProduct
);

// @route   GET /store-products
// @desc    Get all products belonging to a particular store, can be used by admin and stores
// @access  Private
router.get('/store-products', getStoreProducts);

// @route   POST /find/:limit/:skip
// @desc    Find a particular product, app wide
// @access  Private
router.post('/find', findProduct);

// @route   PUT /update/:id
// @desc    update a store product, can be used by admin and stores
// @access  Private
router.put('/update/:id', updateProduct);

// @route   DELETE /delete/:id
// @desc    delete a store product, can be used by admin and stores
// @access  Private
router.delete('/delete/:id', deleteProduct);

export default router;
