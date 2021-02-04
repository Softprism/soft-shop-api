const express = require('express');
const router = express.Router();
const adminService = require('./admin.service');
const auth = require('../_helpers/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /user
// @desc    Get all Users
// @access  Public
router.get('/', getAdmins);

// @route   POST user/register
// @desc    Register a User
// @access  Public
router.post(
	'/register',
	[
		check('first_name', 'Please Enter First Name').not().isEmpty(),
		check('last_name', 'Please Enter Last Name').not().isEmpty(),
		check('email', 'Please Enter Valid Email').isEmail(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	registerAdmin
);

// @route   POST user/login
// @desc    Login a User & get token
// @access  Public

router.post(
	'/login',
	[
		check('email', 'Please enter a Valid Email').isEmail(),
		check('password', 'Password should be 6 characters or more').isLength({
			min: 6,
		}),
		check('password', 'Password is Required').exists(),
	],
	loginAdmin
);

// @route   GET user/login
// @desc    Get logged in user
// @access  Private

router.get('/login', auth, getLoggedInAdmin);

// @route   PUT user/:id
// @desc    Update User Details
// @access  Private

router.put('/update/:id', auth, updateAdmin);

// Functions
function getAdmins(req, res, next) {
	// Call GetAdmins function from adminService
	adminService.getAdmins().then((admins) =>
		admins && admins.length > 0
			? res.json(users)
			: res
					.status(404)
					.json({ msg: 'No admin found' })
					.catch((err) => next(err))
	);
}

function registerAdmin(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Call Register function from adminService
	adminService
		.registerAdmin(req.body)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function loginAdmin(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// Call Login function from adminService
	adminService
		.loginAdmin(req.body)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getLoggedInAdmin(req, res, next) {
	// Call Get Logged in admin function from adminService
	adminService
		.getLoggedInAdmin(req.user.id)
		.then((loggedInAdmin) => res.json(loggedInAdmin))
		.catch((err) => next(err));
}

function updateAdmin(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
    }
    // Call Get update profile function from adminService
	adminService
		.updateAdmin(req.body, req.params.id)
		.then((admin) => res.json(admin))
		.catch((err) => next(err));
}

module.exports = router;
