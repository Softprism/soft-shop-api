const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

const { validationResult } = require('express-validator');

const User = db.User;

// Get all Users
const getUsers = async (req, res) => {
	const users = await User.find();

	return res.json(users);
};

// Register User
const registerUser = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { first_name, last_name, email, phone_number, password } = req.body;

	try {
		let user = await User.findOne({ email });

		if (user) {
			return res
				.status(400)
				.json({ msg: 'User with this email already exists' });
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
		jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
			if (err) throw err;
			res.json(token);
		});

		// return res.status(200).json({ user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Login User
const loginUser = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;

	try {
		// Find user with email
		let user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ msg: 'Invalid Credentials' });
		}

		// Check if password matches with stored hash
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ msg: 'Invalid Credentials' });
		}

		// Define payload for token
		const payload = {
			user: {
				id: user.id,
			},
		};

		// Generate and return token to server
		jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
			if (err) throw err;
			res.json(token);
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Get Logged in User
const getLoggedInUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

// Update User Details
const updateUser = async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { address, password, email } = req.body;

	// Build User Object
	const userFields = {};

	// Check for fields
	if (address) userFields.address = address;
	if (email) userFields.email = email;
	if (password) {
		const salt = await bcrypt.genSalt(10);

		// Replace password from user object with encrypted one
		userFields.password = await bcrypt.hash(password, salt);
	}

	try {
		// Find use from DB Collection
		let user = await User.findById(req.params.id);

		if (!user) return res.status(404).json({ msg: 'User not found' });

		// Check if address field is not empty
		if (address !== '' || null) {
			if (!user.address.length < 1) {
				// Check if address array is not empty
				// Set the address value in user object to address found from db, then append new address
				userFields.address = [...user.address, address];
			}
		}

		// Updates the user Object with the changed values
		user = await User.findByIdAndUpdate(
			req.params.id,
			{ $set: userFields },
			{ new: true, useFindAndModify: true }
		);

		res.json(user);
	} catch (err) {}
};

module.exports = {
	getUsers,
	registerUser,
	loginUser,
	getLoggedInUser,
	updateUser,
};
