import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import Store from '../models/store.model.js';

const getStores = async () => {
	try {
		const stores = await Store.find().select('-password, -__v');

		return stores;
	} catch (err) {
		return err;
	}
};

const createStore = async (StoreParam) => {
	try {
		const { name, address, email, phone_number, password } = StoreParam;

		let store = await Store.findOne({ name });

		if (store) {
			throw { err: 'Store with this name already exists' };
		}

		const newStore = new Store(StoreParam);
		const salt = await bcrypt.genSalt(10);

		// Replace password from store object with encrypted one
		newStore.password = await bcrypt.hash(password, salt);

		await newStore.save();

		const payload = {
			store: {
				id: newStore.id,
			},
		};

		// Generate and return token to server
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 36000,
		});

		if (!token) {
			throw { err: 'Missing Token' };
		}

		return token;
	} catch (err) {
		return err;
	}
};

const loginStore = async (StoreParam) => {
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

		const payload = {
			store: {
				id: storeRes.id,
			},
		};

		// Generate and return token to server
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 36000,
		});

		return token;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getLoggedInStore = async (userParam) => {
	console.log('running');
	try {
		const store = await Store.findById(userParam).select('-password');
		return store;
	} catch (err) {
		// console.error(err.message);
		return err;
	}
};

const updateStore = async (storeID, updateParam) => {
	const { email, password, address, phone_number, images } = updateParam;

	const storeUpdate = {};

	// Check for fields
	if (address) storeUpdate.address = address;
	if (images) storeUpdate.images = images;
	if (email) storeUpdate.email = email;
	if (phone_number) storeUpdate.email = phone_number;
	if (password) {
		const salt = await bcrypt.genSalt(10);
		storeUpdate.password = await bcrypt.hash(password, salt);
	}

	let store = await Store.findById(storeID);

	if (!store) throw { err: 'Store not found' }

	store = await Store.findByIdAndUpdate(
		storeID,
		{ $set: storeUpdate },
		{ new: true, useFindAndModify: true }
	);

	let storeRes = await Store.findById(storeID).select('-password, -__v');

	return storeRes;
};

export { getStores, createStore, loginStore, getLoggedInStore, updateStore };
