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
		check('status', 'status field missing').not().isEmpty(),
	],
	createOrder
);

// @route   PUT //toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private
router.put('/toggle-favorite/:orderID', auth, toggleFavorite);

// @route   GET /order-details/:orderID
// @desc    toggles an order's detail
// @access  Private
router.get('/order-details/:orderID', auth, getOrderDetails);

// @route   GET /user-order-history
// @desc    get all orders created by a user, uses req.user.id or req.query.userID to validate user
// @access  Private
router.get('/user-order-history', auth, getOrderHistory);

// @route   GET /store-order-history/:storeID
// @desc    get all orders owned by a store
// @access  Private
router.get('/store-order-history', auth, getStoreOrderHistory);

// @route   GET /user-cart?userID=
// @desc    get all products in user's cart
// @access  Private
router.get('/user-cart', auth, getCartItems);

// @route   PUT /edit-user-order/:orderID
// @desc    modify fields in an order
// @access  Private
router.put('/edit-user-order/:orderID', auth, editOrder);

// @route   PUT /cancel-user-order/:orderID
// @desc    cancels an order
// @access  Private
router.put('/cancel-user-order/:orderID', auth, cancelOrder);

// @route   PUT /deliver-order/:orderID
// @desc    delivers an order
// @access  Private
router.put('/deliver-order/:orderID', auth, deliverOrder);

// @route   PUT /receive-order/:orderID
// @desc    receive an order
// @access  Private
router.put('/receive-order/:orderID', auth, receiveOrder);

// @route   PUT /complete-order/:orderID
// @desc    cancels an order
// @access  Private
router.put('/complete-order/:orderID', auth, completeOrder);

// @route   PUT /favorites/:userID
// @desc    get user favorite orders
// @access  Private
router.get('/favorites/', auth, getFavorites);


export default router;