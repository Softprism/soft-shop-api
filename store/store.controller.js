const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const router = express.Router();
const auth = require('../_helpers/auth');
const storeService = require('./store.service');
const { check, validationResult } = require('express-validator');

// routes

// @route   GET /store
// @desc    Get all stores
// @access  Private
router.get('/', auth, getStores);

// @route   POST /store/create
// @desc    Register a store
// @access  Public
router.post(
    '/create',
    [
        check('name', 'Please Enter Store Name').not().isEmpty(),
        // check('images', 'Please add images for your store').not().isEmpty(),
		check('address', 'Please Enter Stores Address').not().isEmpty(),
		check('email', 'Please Enter Valid Email').isEmail(),
		check('phone_number', 'Please Enter Valid Phone Number').isMobilePhone(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
		).isLength({ min: 6 }),
    ],
    createStore
)

// @route   POST /store/login
// @desc    Login a store
// @access  Public
router.post(
    '/login',
    [
		check('name', 'Please enter store name').not().isEmpty(),
		check(
			'password',
			'Please Enter Password with 6 or more characters'
        ).isLength({ min: 6 }),
        check('password', 'Password is Required').exists(),
    ],
    loginStore
)

// @route   PUT /store/update
// @desc    Update a store
// @access  Private
router.put(
    '/update',
    auth,
    loginStore
)

module.exports = router;

function getStores(req, res, next) {
    storeService.getStores()
        .then(stores => res.json({
            success: true,
            stores: stores
        }))
        .catch(err => res.status(500).send({
            success: false,
            message: err
        }));
}

function createStore(req,res,next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let error_msgs = [];
        errors.array().forEach(element => {
            error_msgs = [...error_msgs, element.msg]
        });
        return res.status(400).json({ 
            success: false,
            errors: error_msgs
        });
    }
    
    storeService.createStore(req.body)
    .then(store => {
        // Define payload for token
        const payload = {
            user: {
                id: store.id,
            },
        };

        // Generate and return token to server
        jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.json({
                success: true,
                value: {
                    store: store,
                    token: token
                }
            });
        });
    })
    .catch(err => res.status(err.code != null ? err.code : 500).send({
        success: false,
        message: err.msg != null ? err.msg : err
    }));
}

function loginStore(req,res,next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ 
            success: false,
            errors: errors.array()['msg']
        });
    }
    
    storeService.loginStore(req.body)
    .then(store => {
        // Define payload for token
        const payload = {
            user: {
                id: store.id,
            },
        };

        // Generate and return token to server
        jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.json({
                success: true,
                value: {
                    store: store,
                    token: token
                }
            });
        });
    })
    .catch(err => res.status(err.code != null ? err.code : 500).send({
        success: false,
        message: err.msg != null ? err.msg : 'Server Error'
    }));
}

function updateStore(req,res,next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ 
            success: false,
            errors: errors.array()['msg']
        });
    }
    
    storeService.updateStore(req)
    .then(store => {
        res.json({
            success: true,
            store: store
        });
    })
    .catch(err => res.status(err.code != null ? err.code : 500).send({
        success: false,
        message: err.msg != null ? err.msg : 'Server Error'
    }));
}