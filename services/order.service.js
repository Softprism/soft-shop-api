import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Store from '../models/store.model.js';

const getOrders = async (urlParams) => {
	try {
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
		return await Order.find()
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});
	} catch (error) {
		return { err: 'error loading products' };
	}
};

const createOrder = async (orderParam) => {
	try {
		const { store, user } = orderParam;

		//validate user
		const vUser = await User.findById(user);
		if (!vUser) throw { err: 'User not found' };

		//validate store
		const vStore = await Store.findById(store);
		if (!vStore) throw { err: 'Store not found' };

		//generates random unique id;
		let orderId = () => {
			let s4 = () => {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			};
			//return id of format 'soft - aaaaaaaa'-'aaaa'
			return 'soft-' + s4();
		};

		//creates an order for user after all validation passes
		const order = new Order(orderParam);
		order.orderId = orderId();

		let newOrder = await order.save();

		// Adds new order to user model
		vUser.orders.push(newOrder._id);
		await vUser.save();

		// Returns new order to response
		return Order.findById(newOrder._id)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});
	} catch (err) {
		console.log(err);
		return err;
	}
};

const toggleFavorite = async (orderID) => {
	try {
		//adds or remove users favorite order
		const order = await Order.findById(orderID);

		if (!order) {
			throw { err: 'Invalid Order' };
		}

		order.favoriteAction(); //calls an instance method
		order.save();

		if (order.favorite) {
			return { msg: 'Order marked as favorite' };
		} else {
			return { msg: 'Order removed from favorites' };
		}

		// return order;
	} catch (err) {
		return { err: 'Error marking order as favorite' };
	}
};

const getFavorites = async (userID, urlParams) => {
	try {
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
		//get users favorite orders
		let favoriteOrders = await Order.find({ user: userID, favorite: true })
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});

		return favoriteOrders;
	} catch (err) {
		return { err: 'Error getting your favorite orders' };
	}
};

const getOrderDetails = async (orderID) => {
	try {
		const order = await Order.findById(orderID);

		console.log(order);
		if (!order) {
			throw { err: 'Error getting this order details' };
		}
		//get users order details
		//can be used by users, stores and admin
		const orderDetails = await Order.findById(orderID)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});

		return orderDetails;
	} catch (err) {
		// return { err: 'error getting this order details' };
		return err;
	}
};

const getOrderHistory = async (userID, urlParams) => {
	try {
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
		//gets user order history
		if (urlParams.favorite === true) {
			console.log(urlParams.favorite);
			let orders = await Order.find({ user: userID, favorite: true })
				.sort({ createdDate: -1 }) // -1 for descending sort
				.limit(limit)
				.skip(skip)
				.populate({
					path: 'product_meta.product_id',
					select: 'product_name product_image price',
				})
				.populate({
					path: 'store',
					select: 'name address openingTime closingTime deliveryTime',
				})
				.populate({
					path: 'user',
					select: 'first_name last_name phone_number email',
				});

			return orders;
		} else {
			let orders = await Order.find({ user: userID })
				.sort({ createdDate: -1 }) // -1 for descending sort
				.limit(limit)
				.skip(skip)
				.populate({
					path: 'product_meta.product_id',
					select: 'product_name product_image price',
				})
				.populate({
					path: 'store',
					select: 'name address openingTime closingTime deliveryTime',
				})
				.populate({
					path: 'user',
					select: 'first_name last_name phone_number email',
				});

			return orders;
		}
	} catch (error) {
		return { err: 'error getting the order history' };
	}
};

const getStoreOrderHistory = async (storeID, urlParams) => {
	console.log(storeID, urlParams);
	try {
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);

		//gets store order history
		return await Order.find({ store: storeID })
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});
	} catch (error) {
		return { err: 'error getting the order history' };
	}
};

const editOrder = async (orderID, orderParam) => {
	const { product_meta, status } = orderParam;

	let orderModifier = {};
	if (product_meta) orderModifier.product_meta = product_meta;
	if (status) orderModifier.status = status;
	try {
		//can be used by both stores and users
		const newOrder = await Order.findByIdAndUpdate(
			orderID,
			{ $set: orderModifier },
			{ omitUndefined: true, new: true }
		)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime',
			})
			.populate({
				path: 'user',
				select: 'first_name last_name phone_number email',
			});

		return newOrder;
	} catch (error) {
		console.log(error);
		return { err: 'error editing this order' };
	}
};

const cancelOrder = async (orderID) => {
	try {
		//user/store cancel order
		let order = await Order.findById(orderID);
		if (!order) throw { err: 'unable to cancel order' };
		order.CancelOrder();
		order.save();
		return order;
	} catch (error) {
		console.log(error);
		return { err: 'error canceling order' };
	}
};

const completeOrder = async (orderID) => {
	try {
		//fires after payment is confirmed
		let order = await Order.findById(orderID);
		if (!order) throw { err: 'unable to complete order' };
		order.completeOrder();
		order.save();
		return order;
	} catch (error) {
		console.log(error);
		return { err: 'error completing this order' };
	}
};

const receiveOrder = async (orderID) => {
	try {
		//store acknoledges order
		let order = await Order.findById(orderID);
		if (!order) throw { err: 'unable to receive order' };
		order.receiveOrder();
		order.save();
		return order;
	} catch (error) {
		return { err: 'error receiving this order' };
	}
};

const deliverOrder = async (orderID) => {
	try {
		//store delivers order
		let order = await Order.findById(orderID);
		if (!order) throw { err: 'unable to deliver order' };
		order.deliverOrder();
		order.save();
		return order;
	} catch (error) {
		return { err: 'error delivering this order' };
	}
};

const getCartItems = async (userID) => {
	try {
		//get user cart items
		let user = await User.findById(userID)
			.select('cart')
			.populate('cart.product_id');
		return user;
	} catch (error) {
		return { err: 'error getting user cart items' };
	}
};

export {
	getOrders,
	createOrder,
	toggleFavorite,
	getOrderDetails,
	getFavorites,
	getOrderHistory,
	getCartItems,
	editOrder,
	cancelOrder,
	getStoreOrderHistory,
	completeOrder,
	deliverOrder,
	receiveOrder,
};

// Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
//scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.
