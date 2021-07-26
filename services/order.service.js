import Order from '../models/order.model.js';
import User from '../models/user.model.js';

const getOrders = async (urlParams) => {
  try {
    const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
    return await Order.find()
    .sort({ createdDate: -1 }) // -1 for descending sort
    .limit(limit)
		.skip(skip)
    .populate('product_meta.product_id')
    .populate({path: 'store', select: '-password'})
    .populate({path: 'user', select: '-password'})
  } catch (error) {
    return {err: 'error loading products'}
  }
}

const  createOrder = async (orderParam) => {
  try {

    //creates an order for user
    const order = new Order(orderParam);
    return  order.save();
  } catch (error) {
    return {err: 'error creating order'}
    
  }
}

const toggleFavorite = async (orderID) => {
  try {
    //adds or remove users favorite order
    let order = await Order.findById(orderID)
    order.favoriteAction() //calls an instance method
    return order.save()
  } catch (error) {
    return {err: 'error modifying your order'}
  }
}

const getFavorites = async (userID) => {
    //get users favorite orders
    return await Order.find({user: userID, favorite: true})
}

const getOrderDetails = async (orderID) => {
  try {
    //get users order details
    //can be used by users, stores and admin
    return await Order.findById(orderID)
    .populate('product_meta.product_id')
    .populate({path: 'store', select: '-password'})
    .populate({path: 'user', select: '-password'})
  } catch (error) {
    return {err: 'error getting this order details'}
  }
}

const getOrderHistory = async (userID, urlParams) => {
  try {
    const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
    //gets user order history
    return await Order.find({ user:userID })
    .sort({ createdDate: -1 }) // -1 for descending sort
    .limit(limit)
		.skip(skip)
    .populate('product_meta.product_id')
    .populate({path: 'store', select: '-password'})
    .populate({path: 'user', select: '-password'})

  } catch (error) {
    return {err: 'error getting the order history'}
  }
}

const getStoreOrderHistory = async (storeID,urlParams) => {
  console.log(storeID,urlParams)
  try {
    const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);

    //gets store order history
    return await Order.find({ store:storeID })
    .sort({ createdDate: -1 }) // -1 for descending sort
    .limit(limit)
		.skip(skip)
    .populate('product_meta.product_id')
    .populate({path: 'store', select: '-password'})
    .populate({path: 'user', select: '-password'})
  } catch (error) {
    return {err: 'error getting the order history'}
  }
    
}

const editOrder = async (orderID,orderParam) => {
  try {
    //can be used by both stores and users
    const newOrder = await Order.findByIdAndUpdate(
      orderID,
      {$set: orderParam},
      { omitUndefined: true, new: true },
    )

    return newOrder
  } catch (error) {
    return error
  }
    
}

const cancelOrder = async (orderID) => {
  try {
    //user/store cancel order
    let order = await Order.findById(orderID)
    order.CancelOrder()
    order.save()
  } catch (error) {
    console.log(error)
    return error
  }
}

const completeOrder = async (orderID) => {
    //fires after payment is confirmed
    let order = await Order.findById(orderID)
    order.completeOrder()
    order.save()
}

const receiveOrder = async (orderID) => {
    //store acknoledges order
    let order = await Order.findById(orderID)
    order.receiveOrder()
    order.save()
}

const deliverOrder = async (orderID) => {
    //store delivers order
    let order = await Order.findById(orderID)
    order.deliverOrder()
    order.save()
}

const getCartItems = async (userID) => {
  try {
    //get user cart items
    return await User.findById(userID)
    .select('cart')
    .populate('cart.product_id')
  } catch (error) {
    return {err: 'error getting user cart items'}
  }
    
}


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
    receiveOrder
};