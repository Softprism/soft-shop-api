const express = require('express');
const router = express.Router();
const adminService = require('./admin.service');
const auth = require('../_helpers/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /admin
// @desc    Get all Admin Users
// @access  Public
router.get('/', getAdmins);

// @route   POST admin/register
// @desc    Register an Admin account
// @access  Public
router.post(
	'/register',
	[
		check('username', 'Please Enter Username').not().isEmpty(),
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
		check('username', 'Please enter a Username').exists(),
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

// FUNCTIONS

// Get Admins
function getAdmins(req, res, next) {
	console.log('ad');
	// Call GetAdmins function from adminService
	adminService.getAdmins().then((admins) =>
		admins && admins.length > 0
			? res.json(admins)
			: res
					.status(404)
					.json({ msg: 'No Admin found' })
					.catch((err) => next(err))
	);
}

// Register Admin
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
	console.log(req.admin);
	// Call Get Logged in admin function from adminService
	adminService
		.getLoggedInAdmin(req.admin.id)
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