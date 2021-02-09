const config = require('../config.json');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Order = db.Order;



const getOrders = async () => {
    return await Order.find();
}

const  createOrder = async (orderParam) => {
    const order = new Order(orderParam);
    await order.save();
}

const addFavorite = async (orderID) => {

    let order = await Order.findById(orderID)
    order.favoriteAction() //calls an instance method
    order.save()
}

const getOrderDetails = async (orderID) => {
    return await Order.findById(orderID)
}

module.exports = {
    getOrders,
    createOrder,
    addFavorite,
    getOrderDetails
};