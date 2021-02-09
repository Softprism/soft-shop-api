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

const getFavorites = async (userID) => {
    console.log(userID)
    return await Order.find({user: userID, favorite: true})
}

const getOrderDetails = async (orderID) => {
    return await Order.findById(orderID)
}

module.exports = {
    getOrders,
    createOrder,
    addFavorite,
    getOrderDetails,
    getFavorites
};