const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Product = db.Product;

module.exports = {
    getProducts,
    createProduct
};

async function getProducts() {
    return await Product.find();
}
async function createProduct(productParam) {
    const product = new Product(productParam);
    await product.save();
}
