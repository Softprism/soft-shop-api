import * as orderService from '../services/order.service.js';
import { validationResult } from 'express-validator';

//======================================================================

const getOrders = async (req, res, next) => {
	if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'filtering parameters are missing' });
	}

	const allOrders = await orderService.getOrders(req.query);

  if (allOrders.err) {
		res.status(500).json({ success: false, msg: allOrders.err });
	}

	allOrders && allOrders.length > 0
		? res.status(200).json({ success: true, result: allOrders })
		: res.status(404).json({ success: false, msg: 'No order found' });

};

//======================================================================

const createOrder = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

  if(req.user) req.body.user = req.user.id

	let newOrder = await orderService.createOrder(req.body);

  newOrder.err 
  ? res.status(500).json({ success: false, msg: newOrder.err })
  : res.status(201).json({ success: true, result: newOrder });
};

//======================================================================

const toggleFavorite = async (req, res, next) => {
	let favoriteOrder = await orderService.toggleFavorite(req.params.orderID);

  favoriteOrder.err 
  ? res.status(500).json({ success: false, msg: favoriteOrder.err })
  : res.status(200).json({ success: true, result: favoriteOrder.msg });

};

//===============- Deprecated -=============================

const getOrderDetails = async (req, res, next) => {
	const orderDetails = await orderService.getOrderDetails(req.params.orderID);

	orderDetails.err 
  ? res.status(500).json({ success: false, msg: orderDetails.err })
  : res.status(200).json({ success: true, result: orderDetails });

};

//======================================================================

const getOrderHistory = async (req, res, next) => {
	let userID;
	if (req.user === undefined && req.query.userID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this user' });
	}
	if (req.user) userID = req.user.id;
	if (req.query.userID && req.admin) userID = req.query.userID;

	const userOrderHistory = await orderService.getOrderHistory(
		userID,
		req.query
	);

  if (userOrderHistory.err) {
		return res.status(500).json({ success: false, msg: userOrderHistory.err });
	}

	userOrderHistory && userOrderHistory.length > 0
		? res.status(200).json({ success: true, result: userOrderHistory })
		: res.status(404).json({ success: false, msg: 'No order found' });
};

//======================================================================

const getStoreOrderHistory = async (req, res, next) => {
  console.log(2)
  let storeID;
	if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}
	if (req.store) storeID = req.store.id;
	if (req.query.storeID && req.admin) storeID = req.query.storeID;

  console.log(storeID)

	const storeOrderHistory = await orderService.getStoreOrderHistory(
		storeID,
		req.query
	);

  if (storeOrderHistory.err) {
		res.status(500).json({ success: false, msg: storeOrderHistory.err });
	}
  
	storeOrderHistory && storeOrderHistory.length > 0
		? res.status(200).json({ success: true, result: storeOrderHistory })
		: res.status(404).json({ success: false, msg: 'No order found' });
};

//======================================================================
const getCartItems = async (req, res, next) => {
  let userID;
	if (req.user === undefined && req.query.userID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this user' });
	}
	if (req.user) userID = req.user.id;
	if (req.query.userID && req.admin) userID = req.query.userID;

	const cartItems = await orderService.getCartItems(userID);

  if (cartItems.err) {
		res.status(500).json({ success: false, msg: cartItems.err });
	}

	cartItems && cartItems.cart.length > 0
		? res.status(200).json({ success: true, result: cartItems })
		: res.status(404).json({ success: false, msg: 'No order in cart' });

};

//======================================================================

const editOrder = async (req, res, next) => {
	let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);

  updatedOrder.err 
  ? res.status(500).json({ success: false, msg: updatedOrder.err })
  : res.status(200).json({ success: true, result: 'order modified successfully' })

};

//======================================================================

const cancelOrder = async (req, res, next) => {
	const request = await orderService.cancelOrder(req.params.orderID);

  request.err 
  ? res.status(500).json({ success: false, msg: request.err })
  : res.status(200).json({ success: true, result: 'order canceled' })
	
};

//======================================================================

const completeOrder = async (req, res, next) => {
	const request = await orderService.completeOrder(req.params.orderID);

  request.err 
  ? res.status(500).json({ success: false, msg: request.err })
  : res.status(200).json({ success: true, result: 'order completed' })
	
};

//======================================================================

const receiveOrder = async (req, res, next) => {
	const request = await orderService.receiveOrder(req.params.orderID);

  request.err 
  ? res.status(500).json({ success: false, msg: request.err })
  : res.status(200).json({ success: true, result: 'order received' })
	
};

//======================================================================

const deliverOrder = async (req, res, next) => {
	const request = await orderService.deliverOrder(req.params.orderID);

  request.err 
  ? res.status(500).json({ success: false, msg: request.err })
  : res.status(200).json({ success: true, result: 'order delivered' })
	
};

//======================================================================
const getFavorites = async (req, res, next) => {
  let userID;
	if (req.user === undefined && req.query.userID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this user' });
	}

  if (req.user) userID = req.user.id;
	if (req.query.userID && req.admin) userID = req.query.userID;

	if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'filtering parameters are missing' });
	}

	const favoriteOrders = await orderService.getFavorites(
		userID,
		req.query
	);

	if (favoriteOrders.err) {
		res.status(400).json({ success: false, msg: favoriteOrders.err });
	}

	favoriteOrders && favoriteOrders.length > 0
		? res.status(200).json({ success: true, result: favoriteOrders })
		: res.status(404).json({ success: false, msg: 'No favorite orders' });
};

//======================================================================
export {
	getOrders,
	createOrder,
	toggleFavorite,
	getOrderDetails,
	getOrderHistory,
	getStoreOrderHistory,
	getCartItems,
	editOrder,
	getFavorites,
};
