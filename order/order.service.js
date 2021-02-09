const config = require('../config.json');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Order = db.Order;



const getOrders = async () => {
    return await Order.find();
}

const  createOrder = async (orderParam) => {
    //creates an order for user
    const order = new Order(orderParam);
    await order.save();
}

const addFavorite = async (orderID) => {
    //adds or remove users favorite order
    let order = await Order.findById(orderID)
    order.favoriteAction() //calls an instance method
    order.save()
}

const getFavorites = async (userID) => {
    //get users favorite orders
    return await Order.find({user: userID, favorite: true})
}

const getOrderDetails = async (orderID) => {
    //get users order details
    //can be used by users, stores and admin
    return await Order.findById(orderID)
}

const getOrderHistory = async (userID) => {
    //gets user order history
    return await Order.find({user:userID})
}

const getStoreOrderHistory = async (storeID) => {
    //gets store order history
    return await Order.find({store:storeID})
}

const editOrder = async (orderID,orderParam) => {
    //can be used by both stores and users
    await Order.findByIdAndUpdate(
        orderID,
        {$set: orderParam},
        { omitUndefined: true, new: true },
    )
}

const cancelOrder = async (orderID) => {
    //user/store cancel order
    let order = await Order.findById(orderID)
    order.CancelOrder()
    order.save()
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
    //get user cart items
    return Order.find({user: userID, status: "cart"})
}


module.exports = {
    getOrders,
    createOrder,
    addFavorite,
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