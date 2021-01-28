const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
    getUsers,
    registerUser
};

async function getUsers() {
    return await User.find();
}
async function registerUser(userParam) {
    const user = new User(userParam);
    await user.save();
}
