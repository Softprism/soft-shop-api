import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js'
const router = express.Router();

import { getOrders, createOrder, toggleFavorite, getOrderDetails, getOrderHistory,getStoreOrderHistory, getCartItems,editOrder, cancelOrder,completeOrder, receiveOrder, deliverOrder, getFavorites } from '../controllers/order.controller.js';

// @route   GET /
// @desc    Get all orders from all stores.
// @access  Private
router.get('/', auth, getOrders);

// @route   POST /create
// @desc    create a new order
// @access  Private
router.post(
	'/create',
	auth,
	[
		check('product_meta', 'error with product data ').isLength({ min: 1 }),
		check('store', 'Please select a store').not().isEmpty(),
		check('user', 'user field missing').not().isEmpty(),
		check('status', 'status field missing').not().isEmpty(),
	],
	createOrder
);

// @route   PUT //toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private
router.put('/toggle-favorite/:orderID', auth, toggleFavorite);

// @route   GET /get_order_details:orderID
// @desc    toggles an order's detail
// @access  Private
router.get('/get_order_details/:orderID', auth, getOrderDetails);

// @route   GET /user_order_history
// @desc    get all orders created by a user, uses req.user.id or req.query.userID to validate user
// @access  Private
router.get('/user_order_history', auth, getOrderHistory);

// @route   GET /store_order_history/:storeID
// @desc    get all orders owned by a store
// @access  Private
router.get('/store_order_history/:storeID', auth, getStoreOrderHistory);

// @route   GET /get_user_cart/:userID
// @desc    get all products in user's cart
// @access  Private
router.get('/get_user_cart/:userID', auth, getCartItems);

// @route   PUT /edit_user_order/:orderID
// @desc    modify fields in an order
// @access  Private
router.put('/edit_user_order/:orderID', auth, editOrder);

// @route   PUT /cancel_user_order/:orderID
// @desc    cancels an order
// @access  Private
router.put('/cancel_user_order/:orderID', auth, cancelOrder);

// @route   PUT /deliver_order/:orderID
// @desc    delivers an order
// @access  Private
router.put('/deliver_order/:orderID', auth, deliverOrder);

// @route   PUT /receive_order/:orderID
// @desc    receive an order
// @access  Private
router.put('/receive_order/:orderID', auth, receiveOrder);

// @route   PUT /complete_order/:orderID
// @desc    cancels an order
// @access  Private
router.put('/complete_order/:orderID', auth, completeOrder);

// @route   PUT /get_favorites/:userID
// @desc    get user favorite orders
// @access  Private
router.get('/get_favorites/:userID', auth, getFavorites);


export default router;