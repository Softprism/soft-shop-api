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
    return await Order.findById(orderID)
}

const getOrderHistory = async (userID) => {
    //gets user order history
    return await Order.find({user:userID})
}

module.exports = {
    getOrders,
    createOrder,
    addFavorite,
    getOrderDetails,
    getFavorites,
    getOrderHistory
};