const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

const { validationResult } = require('express-validator');

const User = db.User;

// Get all Users
const getUsers = async (res) => {
	const users = await User.find();

	try {
		res.json(users);
	} catch (err) {
		console.error(err);
	}
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
				name: `${user.first_name} ${user.last_name}`,
			},
		};

		// Generate and return token to server
		jwt.sign(payload, config.jwtSecret, { expiresIn: 6000 }, (err, token) => {
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
		let user = await User.findOne({ email });

		if (!user) {
			// return res.status(400).json({msg: })
		}
	} catch (error) {}
};

module.exports = {
	getUsers,
	registerUser,
	loginUser,
};
