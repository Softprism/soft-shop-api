import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Store from '../models/store.model.js';
import mongoose from 'mongoose';


const getOrders = async (urlParams) => {
	try {
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
    let matchParam = {}

    const pipeline = [{ 
      $unset: ['store.password','store.email','store.labels','store.phone_number', 'store.images', 'store.category', 'store.openingTime', 'store.closingTime',  'product_meta.details.variants', 'product_meta.details.store', 'product_meta.details.category','product_meta.details.label','productData']
    }];

    let orders = Order.aggregate()
    .match(matchParam)
    .lookup({
      from: 'products',
      localField: "product_meta.product_id",
      foreignField: "_id",
      as: "productData"
    })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store"
    })
    .lookup({
      from: "customfees",
      localField: "product_meta.product_id",
      foreignField: "product",
      as: "productFees"
    })
    .addFields({
      "product_meta.productDetails": '$productData',
      // "product_meta.details": {$arrayElemAt:["$productData",0]}
    })
    .unwind('$store')
    .append(pipeline)
    .sort('-createdDate')
    .limit(limit)
    .skip(skip)
    return orders
	} catch (error) {
    console.log(error)
		return { err: 'error loading orders' };
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
			//return id of format 'soft - aaaaa'
			return 'soft - ' + s4();
		};

		//creates an order for user after all validation passes
		const order = new Order(orderParam);
		order.orderId = orderId();

		let newOrder = await order.save();

		// Adds new order to user model
		vUser.orders.push(newOrder._id);
		// await vUser.save();

		// Returns new order to response
    const pipeline = [{ 
      $unset: ['store.password','store.email','store.labels','store.phone_number', 'store.images', 'store.category', 'store.openingTime', 'store.closingTime',  'productData.variants', 'productData.store', 'productData.category','productData.label']
    }];
    const neworder = await Order.aggregate()
    .match({
      orderId: newOrder.orderId
    })
    .lookup({
      from: 'products',
      localField: "product_meta.product_id",
      foreignField: "_id",
      as: "productData"
    })
    .lookup({
      from: 'products',
      localField: "product_meta.selectedVariants",
      foreignField: "variant.items",
      as: "productData2"
    })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store"
    })
    .lookup({
      from: "customfees",
      localField: "product_meta.product_id",
      foreignField: "product",
      as: "productFees"
    })
    .lookup({
      from: "variants",
      localField: "product_meta.selectedVariants",
      foreignField: "_id",
      as: "selectedProductVariants"
    })
    .addFields({
      "product_meta.productData": "$productData",
      "product_meta.selectedVariants": "$selectedProductVariants"
    })
    .append(pipeline);

    // neworder[0].product_meta.forEach(product => {

    //   product.productData = product.productData.filter(data => {
    //     // console.log("product data", data)
    //     console.log( "filtering ", data._id, product.product_id, product.product_id.equals(data._id))
    //     return product.product_id.equals(data._id) 
    //   })
    // });
    return neworder
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
				select: 'product_name product_image price customFees',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime tax',
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
				select: 'product_name product_image price customFees',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime tax',
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
					select: 'product_name product_image price customFees',
				})
				.populate({
					path: 'store',
					select: 'name address openingTime closingTime deliveryTime tax',
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
					select: 'product_name product_image price customFees',
				})
				.populate({
					path: 'store',
					select: 'name address openingTime closingTime deliveryTime tax',
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
				select: 'product_name product_image price customFees',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime tax',
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
			{ omitUndefined: true, new: true, useFindAndModify: false }
		)
			.populate({
				path: 'product_meta.product_id',
				select: 'product_name product_image price customFees',
			})
			.populate({
				path: 'store',
				select: 'name address openingTime closingTime deliveryTime tax',
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
	getStoreOrderHistory,
};

// Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
//scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.
