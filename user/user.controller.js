const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const db = require('_helpers/db');

const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

function registerUser(req,res,next){
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	userService.registerUser(req.body)
        .then((result) => res.json(result))
        .catch(err => next(err));
}
