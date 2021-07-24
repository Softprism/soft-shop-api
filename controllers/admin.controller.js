const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const auth = require('../middleware/auth');
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
	adminService.getAdmins()
  .then((admins) =>
		res.status(200).json({
      success: true,
      result: admins
    })
	)
  .catch((error) => {
    res.status(400).json({
      success: false,
      msg: error.msg
    })
  })
}

// Register Admin
function registerAdmin(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, msg: errors.array() });
	}

	// Call Register function from adminService
	adminService
		.registerAdmin(req.body)
		.then((token) =>
			res.status(201).json({
				success: true,
				token,
			})
		)
		.catch((err) => {
			console.log(err);
			res.status(400).json({
				success: false,
				msg: err.err,
			});
		});
}

function loginAdmin(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			msg: errors.array(),
		});
	}

	// Call Login function from adminService
	adminService
		.loginAdmin(req.body)
		.then((token) =>
			res.status(200).json({
				success: true,
				token,
			})
		)
		.catch((err) => {
			console.log(err);
			res.status(400).json({
				success: false,
				msg: err.err,
			});
		});
}

function getLoggedInAdmin(req, res, next) {
	console.log(req.admin);
	// Call Get Logged in admin function from adminService
	adminService
		.getLoggedInAdmin(req.admin.id)
		.then((loggedInAdmin) => res.status(200).json(loggedInAdmin))
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
		.then((admin) => res.status(201).json(admin))
		.catch((err) => {
			console.log(err);
			res.status(400).json({
				success: false,
				msg: err.msg,
			});
		});
}

module.exports = router;
