import * as orderService from '../services/order.service.js';
import { check, validationResult } from 'express-validator';

//======================================================================

const getOrders = async (req, res, next) => {
	if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'missing some parameters' });
	}

	const allOrders = await orderService.getOrders(req.query);

	allOrders && allOrders.length > 0
		? res.status(200).json({ success: true, result: allOrders })
		: res.status(404).json({ success: false, msg: 'No order found' });

	if (allOrders.err) {
		res.status(500).json({ success: false, msg: allOrders.err });
	}
};

//======================================================================

const createOrder = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	let newOrder = await orderService.createOrder(req.body);

	if (newOrder.err) {
		res.status(500).json({ success: false, msg: newOrder.err });
	}

	res.status(200).json({ success: true, result: newOrder });
};

//======================================================================

const toggleFavorite = async (req, res, next) => {
	let favoriteOrder = await orderService.toggleFavorite(req.params.orderID);

	if (favoriteOrder.err) {
		res.status(500).json({ success: false, msg: favoriteOrder.err });
	}

	res.status(200).json({ success: true, result: favoriteOrder.msg });
};

//======================================================================

const getOrderDetails = async (req, res, next) => {
	const orderDetails = await orderService.getOrderDetails(req.params.orderID);

	console.log(orderDetails);

	if (!orderDetails) {
		res.status(500).json({ success: false, msg: orderDetails.err });
	}

	res.status(200).json({ success: true, result: orderDetails });
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
	if (req.query.userID) userID = req.query.userID;

	const userOrderHistory = await orderService.getOrderHistory(
		userID,
		req.query
	);

	userOrderHistory && userOrderHistory.length > 0
		? res.status(200).json({ success: true, result: userOrderHistory })
		: res.status(404).json({ success: false, msg: 'No order found' });

	if (userOrderHistory.err) {
		res.status(500).json({ success: false, msg: userOrderHistory.err });
	}
};

//======================================================================

const getStoreOrderHistory = async (req, res, next) => {
	const storeOrderHistory = await orderService.getStoreOrderHistory(
		req.params.storeID,
		req.query
	);

	storeOrderHistory && storeOrderHistory.length > 0
		? res.status(200).json({ success: true, result: storeOrderHistory })
		: res.status(404).json({ success: false, msg: 'No order found' });

	if (storeOrderHistory.err) {
		res.status(500).json({ success: false, msg: storeOrderHistory.err });
	}
};

//======================================================================
const getCartItems = async (req, res, next) => {
	const cartItems = await orderService.getCartItems(req.params.userID);

	cartItems && cartItems.cart.length > 0
		? res.status(200).json({ success: true, result: cartItems })
		: res.status(404).json({ success: false, msg: 'No order in cart' });

	if (cartItems.err) {
		res.status(500).json({ success: false, msg: cartItems.err });
	}
};

//======================================================================

const editOrder = async (req, res, next) => {
	let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);

	if (updatedOrder.err) {
		res.status(400).json({ success: false, msg: updatedOrder.err });
	}

	res
		.status(200)
		.json({ success: true, result: 'order modified successfully' });
};

//======================================================================

const cancelOrder = async (req, res, next) => {
	const request = await orderService.cancelOrder(req.params.orderID);

	if (request.err) {
		res.status(400).json({ success: false, msg: request.err });
	}

	res.status(200).json({ success: true, result: 'order canceled' });
};

//======================================================================

const completeOrder = async (req, res, next) => {
	const request = await orderService.completeOrder(req.params.orderID);

	if (request.err) {
		res.status(400).json({ success: false, msg: request.err });
	}

	res.status(200).json({ success: true, result: 'order completed' });
};

//======================================================================

const receiveOrder = async (req, res, next) => {
	const request = await orderService.receiveOrder(req.params.orderID);

	if (request.err) {
		res.status(400).json({ success: false, msg: request.err });
	}

	res.status(200).json({ success: true, result: 'order received' });
};

//======================================================================

const deliverOrder = async (req, res, next) => {
	const request = await orderService.deliverOrder(req.params.orderID);

	if (request.err) {
		res.status(400).json({ success: false, msg: request.err });
	}

	res.status(200).json({ success: true, result: 'order delivered' });
};

//======================================================================
const getFavorites = async (req, res, next) => {
	if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'missing some parameters' });
	}

	const favoriteOrders = await orderService.getFavorites(
		req.params.userID,
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
	cancelOrder,
	completeOrder,
	receiveOrder,
	deliverOrder,
	getFavorites,
};
