import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from '../models/user.model.js';
import Product from '../models/product.model.js';

// Get all Users
const getUsers = async (urlParams) => {
	try {
    let userWithCartItems = []
    const limit = Number(urlParams.limit);
		const skip = Number(urlParams.skip);
    const cartLength = Number(urlParams.cart)
    delete urlParams.limit
    delete urlParams.skip
    delete urlParams.cart
		const users = await User.find(urlParams)
    .select('-password')
    .sort({ createdDate: -1 }) // -1 for descending sort
    .populate('cart.product_id orders')
    .limit(limit)
    .skip(skip)
    
    if(cartLength >= 0) {
      users.forEach(user => {
        if(user.cart.length == cartLength) {
          userWithCartItems.push(user)
        }
      })
      return userWithCartItems;
    } else {
      return users;
    }
    // return users;
	} catch (err) {
		return err;
	}
};

// Register User
const registerUser = async (userParam) => {
	const { first_name, last_name, email, phone_number, password } = userParam;

	try {
		let user = await User.findOne({ email });

		console.log(user);

		if (user) {
			// return res
			// 	.status(400)
			// 	.json({ msg: 'User with this email already exists' });
			throw { err: 'User with this email already exists' };
		}

		// Create User Object
		user = new User({
			first_name,
			last_name,
			email,
			phone_number,
			password,
		});

		const salt = await bcrypt.genSalt(10);

		// Replace password from user object with encrypted one
		user.password = await bcrypt.hash(password, salt);

		// Save user to db
		await user.save();

		// Define payload for token
		const payload = {
			user: {
				id: user.id,
			},
		};

		// Generate and return token to server
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 36000,
		});

		return token;
		// return res.status(200).json({ user });
	} catch (err) {
		// console.error(err);
		return err;
	}
};

// Login User
const loginUser = async (loginParam) => {
	const { email, password } = loginParam;

	try {
		// Find user with email
		let user = await User.findOne({ email });

		if (!user) {
			throw { err: 'User not found' };
		}

		// Check if password matches with stored hash
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			throw { err: 'Wrong password' };
		}

		// Define payload for token
		const payload = {
			user: {
				id: user.id,
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
		console.log(err);
		return err;
	}
};

// Get Logged in User info
const getLoggedInUser = async (userParam) => {
	console.log('running');
	try {
		const user = await User.findById(userParam).select('-password');
		return user;
	} catch (err) {
		// console.error(err.message);
		return err;
	}
};

// Update User Details
const updateUser = async (updateParam, id) => {
	console.log(updateParam, id);
	const { address, password, email, phone_number } = updateParam;
  console.log(password)
	// Build User Object
	const userFields = {};

	// Check for fields
	if (address) userFields.address = address;
	if (email) userFields.email = email;
	if (phone_number) userFields.phone_number = phone_number;

	if (password) {
		const salt = await bcrypt.genSalt(10);

		// Replace password from user object with encrypted one
		userFields.password = await bcrypt.hash(password, salt);
	}

	try {
		// Find use from DB Collection
		let user = await User.findById(id);

		if (!user) throw { err: 'User not found' };

    // ====== - AMBIGUOUS - =========== //
    // We don't need to check for address, the DB
    // Should be replaced by the new address in the body
    // Request should contain existing address, so that
    // we can easily scale this function.

    
		// Check if address field is not empty
		// if (address !== '' && address !== undefined) {
		// 	// Check if address array is not empty
		// 	if (!user.address.length < 1) {
		// 		// Set the address value in user object to address found from db, then append new address
		// 		userFields.address = [...user.address, address];
		// 	}
		// }
		// Updates the user Object with the changed values
		user = await User.findByIdAndUpdate(
			id,
			{ $set: userFields },
			{ new: true, useFindAndModify: true }
		);
		user = await User.findById(id)
    .select('-cart -password, -orders, -cart');

    return user
	} catch (err) {
		return err;
	}
};

const addItemToCart = async (userID,product) => {
  try {
    const productFinder = await Product.findById(product.product_id)

    if(!productFinder) throw { err: 'can\'t find this product' }

    const user = await User.findByIdAndUpdate(
      userID,
      {$push: {cart: product}},
			{ new: true, useFindAndModify: true }
    );

    return {msg: 'product added to cart'}
  } catch (error) {
    console.log(error)
    return {err: 'error adding product to cart'}
  }
}

export { getUsers, registerUser, loginUser, getLoggedInUser, updateUser, addItemToCart };
