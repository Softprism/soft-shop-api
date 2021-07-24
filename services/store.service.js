const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const Store = db.Store;

module.exports = {
	getStores,
	createStore,
	loginStore,
	updateStore,
};

async function getStores() {
	return await Store.find().select('-password, -__v');
}

async function createStore(StoreParam) {
	const { name, address, email, phone_number, password } = StoreParam;

	let store = await Store.findOne({ name });

	if (store) {
		throw {
			code: 400,
			msg: 'Store with this name already exists',
		};
	}

	const newStore = new Store(StoreParam);
	const salt = await bcrypt.genSalt(10);

	// Replace password from store object with encrypted one
	newStore.password = await bcrypt.hash(password, salt);

	await newStore.save();
	return newStore;
}

async function loginStore(StoreParam) {

  try {
    const { email, password } = StoreParam;

    let store = await Store.findOne({ email });
    let storeRes = await Store.findOne({ email }).select('-password');

    if (!store) {
      throw {
        msg: 'Invalid Credentials',
      };
    }

    // Check if password matches with stored hash
	const isMatch = await bcrypt.compare(password, store.password);

	if (!isMatch) {
		throw {
			code: 400,
			msg: 'Invalid Credentials',
		};
	}

	return storeRes;
  } catch (error) {
    console.log(error)
    throw error
  }
	

	
}

async function updateStore(req) {
	const { email, password, address, phone_number, images } = req.body;

	const storeUpdate = {};

	// Check for fields
	if (address) storeUpdate.address = address;
  if (images) storeUpdate.address = images;
	if (email) storeUpdate.email = email;
	if (phone_number) storeUpdate.email = phone_number;
	if (password) {
		const salt = await bcrypt.genSalt(10);
		storeUpdate.password = await bcrypt.hash(password, salt);
	}

	let store = await Store.findById(req.params.id);

	if (!store) {
		throw {
			code: 400,
			msg: 'Store not found',
		};
	}

	store = await Store.findByIdAndUpdate(
		req.params.id,
		{ $set: storeUpdate },
		{ new: true, useFindAndModify: true }
	);

	let storeRes = await Store.findById(req.params.id).select('-password, -__v');

	return storeRes;
}
