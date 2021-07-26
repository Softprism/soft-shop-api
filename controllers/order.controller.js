import * as orderService from '../services/order.service.js';

import { check, validationResult } from 'express-validator';

// router.get('/', auth, getOrders);
// router.post(
// 	'/create',
// 	auth,
// 	[
// 		check('product_meta', 'error with product data ').isLength({ min: 1 }),
// 		check('store', 'Please select a store').not().isEmpty(),
// 		check('user', 'user field missing').not().isEmpty(),
// 		check('status', 'status field missing').not().isEmpty(),
// 	],
// 	createOrder
// );

// router.put('/add_favorite/:orderID', auth, addFavorite);
// router.get('/get_order_details/:orderID', auth, getOrderDetails);
// router.get('/get_favorites/:userID', auth, getFavorites);
// router.get('/user_order_history/:userID', auth, getOrderHistory);
// router.get('/store_order_history/:storeID', auth, getStoreOrderHistory);
// router.get('/get_user_cart/:userID', auth, getCartItems);
// router.put('/edit_user_order/:orderID', auth, editOrder);
// router.put('/cancel_user_order/:orderID', auth, cancelOrder);
// router.put('/deliver_order/:orderID', auth, deliverOrder);
// router.put('/receive_order/:orderID', auth, receiveOrder);
// router.put('/complete_order/:orderID', auth, completeOrder);

//======================================================================

const getOrders = async (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'missing some parameters' });
	}

	const allOrders = await orderService.getOrders(req.query)
	
  allOrders && allOrders.length > 0
  ? res.status(200).json({ success: true, result: allOrders })
  : res.status(404).json({ success: false, msg: 'No order found' });

  if (allOrders.err) {
		res.status(500).json({ success: false, msg: allOrders.err });
	}

}

//======================================================================

const createOrder = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	let newOrder = await orderService.createOrder(req.body)

	if (newOrder.err) {
		res.status(500).json({ success: false, msg: newOrder.err });
	}

	res.status(200).json({ success: true, result: newOrder });
}

//======================================================================

const toggleFavorite = async (req, res, next) => {
	let favoriteOrder = await orderService.toggleFavorite(req.params.orderID)
	
  if (favoriteOrder.err) {
		res.status(500).json({ success: false, msg: favoriteOrder.err });
	}

	res.status(200).json({ success: true, result: favoriteOrder });
}

//======================================================================

const getOrderDetails = async (req, res, next) => {
	const orderDetails = await orderService.getOrderDetails(req.params.orderID)
	
  if (orderDetails.err) {
		res.status(500).json({ success: false, msg: orderDetails.err });
	}

	res.status(200).json({ success: true, result: orderDetails });
}

//======================================================================

const getOrderHistory = async (req, res, next) => {
  let userID;
  if (req.user === undefined && req.query.userID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this user' });
	}

  if (req.user) userID = req.user.id;
	if (req.query.userID) userID = req.query.userID;

	const userOrderHistory = await orderService.getOrderHistory(userID, req.query)
	
  userOrderHistory && userOrderHistory.length > 0
  ? res.status(200).json({ success: true, result: userOrderHistory })
  : res.status(404).json({ success: false, msg: 'No order found' });

  if (userOrderHistory.err) {
		res.status(500).json({ success: false, msg: userOrderHistory.err });
	}
}

//======================================================================

const getStoreOrderHistory = async (req, res, next) => {
  let storeID;
  if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}

  if (req.store) storeID = req.store.id;
	if (req.query.storeID) storeID = req.query.storeID;
	const storeOrderHistory = await orderService.getStoreOrderHistory(storeID,req.query)
	
  storeOrderHistory && storeOrderHistory.length > 0
  ? res.status(200).json({ success: true, result: storeOrderHistory })
  : res.status(404).json({ success: false, msg: 'No order found' });

  if (storeOrderHistory.err) {
		res.status(500).json({ success: false, msg: storeOrderHistory.err });
	}

}

//======================================================================
function getCartItems(req, res, next) {
	orderService
		.getCartItems(req.params.userID)
		.then((items) =>
			res.json({
				success: true,
				message: items,
			})
		)
		.catch((err) => next(err));
}

//======================================================================

function editOrder(req, res, next) {
	orderService
		.editOrder(req.params.orderID, req.body)
		.then(() =>
			res.json({
				success: true,
			})
		)
		.catch((err) => next(err));
}

//======================================================================

function cancelOrder(req, res, next) {
	orderService
		.cancelOrder(req.params.orderID)
		.then(() =>
			res.json({
				success: true,
			})
		)
		.catch((err) => next(err));
}

//======================================================================

function completeOrder(req, res, next) {
	orderService
		.completeOrder(req.params.orderID)
		.then(() =>
			res.json({
				success: true,
			})
		)
		.catch((err) => next(err));
}

//======================================================================

function receiveOrder(req, res, next) {
	orderService
		.receiveOrder(req.params.orderID)
		.then(() =>
			res.json({
				success: true,
			})
		)
		.catch((err) => next(err));
}

//======================================================================

function deliverOrder(req, res, next) {
	orderService
		.deliverOrder(req.params.orderID)
		.then(() =>
			res.json({
				success: true,
			})
		)
		.catch((err) => next(err));
}

//======================================================================
function getFavorites(req, res, next) {
	orderService
		.getFavorites(req.params.userID)
		.then((orders) =>
			res.json({
				success: true,
				message: orders,
			})
		)
		.catch((err) => next(err));
}

//======================================================================
export {
	getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  getOrderHistory,
  getStoreOrderHistory
};
