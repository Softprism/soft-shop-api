import express from 'express';
import { check } from 'express-validator';

const router = express.Router();

import {
	getStores,
	createStore,
	loginStore,
	getLoggedInStore,
	updateStore,
  addLabel,
  getStore
} from '../controllers/store.controller.js';

import { auth } from '../middleware/auth.js';

// @route   GET /store
// @desc    Get all stores
// @access  Private
router.get('/', auth, getStores);

// @route   GET /stores/login
// @desc    Get logged in Store
// @access  Private
router.get('/login', auth, getLoggedInStore);

// @route   GET /store
// @desc    Get a store
// @access  Private
router.get('/:storeId', auth, getStore);

// @route   POST /store/create
// @desc    Register a store
// @access  Public
router.post(
	'/',
	[
		check('name', 'Please Enter Store Name').not().isEmpty(),
		// check('images', 'Please add images for your store').not().isEmpty(),
		check('address', 'Please Enter Stores Address').not().isEmpty(),
		check('openingTime', 'Please Enter Opening Time').not().isEmpty(),
		check('closingTime', 'Please Enter Closing Time').not().isEmpty(),
		check('email', 'Please Enter Valid Email').isEmail(),
		check('phone_number', 'Please Enter Valid Phone Number').isMobilePhone(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	createStore
);

// @route   POST /store/login
// @desc    Login a store
// @access  Public
router.post(
	'/login',
	[
		check('email', 'Please enter store email').not().isEmpty(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
		).isLength({ min: 6 }),
		check('password', 'Password is Required').exists(),
	],
	loginStore
);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.put('/', auth, updateStore);

// @route   PUT /stores/label
// @desc    add label to store
// @access  Private
router.put('/label', auth, addLabel);

export default router;
