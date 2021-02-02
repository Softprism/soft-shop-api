const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const Store = db.Store;

module.exports = {
    getStores,
    createStore,
    loginStore
};

async function getStores() {
    return await Store.find();
}

async function createStore(StoreParam) {
    const { name, address, email, phone_number, password } = StoreParam;

    let store = await Store.findOne({ name });

    if (store) {
        throw({
            code: 400,
            msg: 'Store with this name already exists'
        });
    }

    const newStore = new Store(StoreParam);
    const salt = await bcrypt.genSalt(10);
    
    // Replace password from store object with encrypted one
    newStore.password = await bcrypt.hash(password, salt);
        
    await newStore.save();
    return newStore
}

async function loginStore(StoreParam) {
    const { name, password } = StoreParam;

    let store = await Store.findOne({ name });
    let storeRes = await Store.findOne({ name }).select('-password, -__v');

    if (!store) {
        throw({
            code: 400,
            msg: 'Invalid Credentials'
        });
    }

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, store.password);

    if (!isMatch) {
        throw({
            code: 400,
            msg: 'Invalid Credentials'
        });
    }

    return storeRes;
}

async function loginStore(StoreParam) {
    const { name, password } = StoreParam;

    let store = await Store.findOne({ name });
    let storeRes = await Store.findOne({ name }).select('-password, -__v');

    if (!store) {
        throw({
            code: 400,
            msg: 'Invalid Credentials'
        });
    }

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, store.password);

    if (!isMatch) {
        throw({
            code: 400,
            msg: 'Invalid Credentials'
        });
    }

    return storeRes;
}
 