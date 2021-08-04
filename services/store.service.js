import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import Store from '../models/store.model.js';

const getStores = async (urlParams) => {
	try {
		let storesWithRating = [];
		const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
		const rating = Number(urlParams.rating);
		delete urlParams.limit;
		delete urlParams.skip;
		delete urlParams.rating;

		const stores = await Store.find(urlParams)
			.select('images name rating openingTime closingTime deliveryTime')
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip);

		if (rating >= 0) {
			stores.forEach((store) => {
				if (store.rating == rating) {
					storesWithRating.push(store);
				}
			});
			return storesWithRating;
		} else {
			return stores;
		}
	} catch (err) {
		return err;
	}
};

const createStore = async (StoreParam) => {
	try {
		const {
			name,
			address,
			email,
			phone_number,
			password,
			openingTime,
			closingTime,
      location
		} = StoreParam;

		let store = await Store.findOne({ email });

		if (store) {
			throw { err: 'A store with this email already exists' };
		}

		if (!openingTime.includes(':') || !closingTime.includes(':')) {
			throw { err: 'Invalid time format' };
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

		if (!store) throw { err: 'Invalid Credentials' };

		// Check if password matches with stored hash
		const isMatch = await bcrypt.compare(password, store.password);

		if (!isMatch) {
			throw { err: 'Invalid Credentials' };
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
	} catch (err) {
		console.log(err);
		return err;
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
	try {
		const {
			email,
			password,
			address,
			phone_number,
			images,
			openingTime,
			closingTime
		} = updateParam;

		const storeUpdate = {};

		// Check for fields
		if (address) storeUpdate.address = address;
		if (images) storeUpdate.images = images;
		if (email) storeUpdate.email = email;
		if (openingTime) storeUpdate.openingTime = openingTime;
		if (closingTime) storeUpdate.closingTime = closingTime;
		if (phone_number) storeUpdate.email = phone_number;
		if (password) {
			const salt = await bcrypt.genSalt(10);
			storeUpdate.password = await bcrypt.hash(password, salt);
		}

		if (!storeUpdate.openingTime.includes(':')) {
			delete storeUpdate.openingTime;
			throw { err: 'Invalid time' };
		}

		if (!storeUpdate.closingTime.includes(':')) {
			delete storeUpdate.closingTime;
			throw { err: 'Invalid time' };
		}

		let store = await Store.findById(storeID);

		if (!store) throw { err: 'Store not found' };

		store = await Store.findByIdAndUpdate(
			storeID,
			{ $set: storeUpdate },
			{ new: true, useFindAndModify: true }
		);

		let storeRes = await Store.findById(storeID).select('-password, -__v');


		return storeRes;
	} catch (err) {
		return err;
	}
};

const addLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) throw { err: 'Store not found' };

  store.labels.push(labelParam)
  await store.save()
  return await Store.findById(storeId).select('-password, -__v');
}
export { getStores, createStore, loginStore, getLoggedInStore, updateStore, addLabel };
