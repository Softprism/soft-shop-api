const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const db = require('_helpers/db');
const auth = require('../_helpers/auth');

const { check } = require('express-validator');

// @route   GET /user
// @desc    Get all Users
// @access  Public
router.get('/', userService.getUsers);

// @route   POST user/register
// @desc    Register a User
// @access  Public
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
	userService.registerUser
);

// @route   POST user/login
// @desc    Login a User & get token
// @access  Public

router.post('/', [
	check('email', 'Please enter a Valid Email').isEmail(),
	check('password', 'Password is Required').exists(),
]);

module.exports = router;
