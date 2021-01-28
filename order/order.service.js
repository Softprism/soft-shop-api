const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Order = db.Order;

module.exports = {
    getOrders,
    createOrder
};

async function getOrders() {
    return await Order.find();
}
async function createOrder(orderParam) {
    const order = new Order(orderParam);
    await order.save();
}
