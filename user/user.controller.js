const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const db = require('_helpers/db');
const { check, validationResult } = require('express-validator');
const User = db.User;

// routes
router.get('/', getUsers);

// Register a User
router.post(
	'/register',
	[
		check('first_name', 'Please Enter First Name').not().isEmpty(),
		check('last_name', 'Please Enter Last Name').not().isEmpty(),
		check('email', 'Please Enter Valid Email').isEmail(),
		check('phone_number', 'Please Enter Valid Phone Number').isMobilePhone(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	registerUser
);

module.exports = router;

function getUsers(req, res, next) {
	userService
		.getUsers()
		.then((users) => res.json(users))
		.catch((err) => next(err));
}
async function registerUser(req, res) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { first_name, last_name, email, phone_number, password } = req.body;

	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ msg: 'User already exists' });
		}

		user = new User({
			first_name,
			last_name,
			email,
			phone_number,
			password,
		});

		await user.save();

		return res.status(200).json({ user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}
