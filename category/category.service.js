const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Category = db.Category;

module.exports = {
    getCategories,
    createCategory
};

async function getCategories() {
    return await Category.find();
}
async function createCategory(categoryParam) {
    console.log(categoryParam)
    const product = new Category(categoryParam);
    await product.save();
}
