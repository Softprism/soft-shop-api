import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
const router = express.Router();

import {
	getOrders,
	createOrder,
	toggleFavorite,
	getOrderDetails,
	getOrderHistory,
	getStoreOrderHistory,
	getCartItems,
	editOrder,
	getFavorites,
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

// @route   GET /user
// @desc    get all orders created by a user, uses req.user.id or req.query.userID to validate user
// @access  Private
router.get('/user', auth, getOrderHistory);

// @route   GET /store
// @desc    get all orders owned by a store
// @access  Private
router.get('/store', auth, getStoreOrderHistory);

// @route   GET /user/cart
// @desc    get all products in user's cart
// @access  Private
router.get('/user/cart', auth, getCartItems);

// @route   PUT /user/edit/
// @desc    modify fields in an order
// @access  Private
router.put('/user/edit/:orderID', auth, editOrder);

// @route   PUT /favorites/:userID
// @desc    get user favorite orders
// @access  Private
router.get('/favorites', auth, getFavorites);

export default router;
