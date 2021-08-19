import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
const router = express.Router();

import {
	getOrders,
	createOrder,
	toggleFavorite,
	getOrderDetails,
	getCartItems,
	editOrder,
} from '../controllers/order.controller.js';

// @route   GET /
// @desc    Get all orders from all stores.
// @access  Private
router.get('/', auth, getOrders);

// @route   POST /create
// @desc    create a new order
// @access  Private
router.post(
	'/',
	auth,
	[
		check('product_meta', 'error with product data ').isLength({ min: 1 }),
		check('store', 'Please select a store').not().isEmpty(),
	],
	createOrder
);

// @route   PUT /toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private
router.patch('/toggle-favorite/:orderID', auth, toggleFavorite);

// @route   GET /:orderID
// @desc    toggles an order's detail
// @access  Private
router.get('/:orderID', auth, getOrderDetails);

// @route   GET /user/cart
// @desc    get all products in user's cart
// @access  Private
router.get('/user/cart', auth, getCartItems);

// @route   PUT /user/edit/
// @desc    modify fields in an order
// @access  Private
router.put('/user/edit/:orderID', auth, editOrder);

export default router;
