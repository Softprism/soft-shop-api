import express from 'express';
import { check, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js'
const router = express.Router();

import { getOrders, createOrder, toggleFavorite, getOrderDetails, getOrderHistory,getStoreOrderHistory, getCartItems,editOrder } from '../controllers/order.controller.js';

router.get('/', auth, getOrders);
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
router.put('/toggle-favorite/:orderID', auth, toggleFavorite);
router.get('/get_order_details/:orderID', auth, getOrderDetails);
router.get('/user_order_history', auth, getOrderHistory);
router.get('/store_order_history/:storeID', auth, getStoreOrderHistory);
router.get('/get_user_cart/:userID', auth, getCartItems);
router.put('/edit_user_order/:orderID', auth, editOrder);



export default router;