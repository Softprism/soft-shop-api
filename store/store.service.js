const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const Store = db.Store;

module.exports = {
    getStores,
    createStore
};

async function getStores() {
    return await Store.find();
}
async function createStore(StoreParam) {
    const store = new Store(StoreParam);
    await store.save();
}
 