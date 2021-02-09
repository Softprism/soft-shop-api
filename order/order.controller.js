const express = require('express');
const router = express.Router();
const orderService = require('./order.service');
const auth = require('../_helpers/auth');

const { check, validationResult } = require('express-validator');

//======================================================================
// routes

router.get('/', getOrders);
router.post(
    '/create',
    auth,
    [
		check('product_meta', 'error with product data ').isLength({ min: 1 }),
        check('store', 'Please select a store').not().isEmpty(),
        check('user', 'user field missing').not().isEmpty(),
        check('status', 'status field missing').not().isEmpty()
	],
    createOrder
)
router.put('/add_favorite/:orderID', auth, addFavorite)
router.get('/get_order_details/:orderID', auth, getOrderDetails)
router.get('/get_favorites/:userID', auth, getFavorites)
router.get('/user_order_history/:userID', auth, getOrderHistory)
router.get('/get_user_cart/:userID', auth, getCartItems)

module.exports = router;

//======================================================================

function getOrders(req, res, next) {
    orderService.getOrders()
        .then(orders => res.json(orders))
        .catch(err => next(err));
}

//======================================================================

function createOrder(req,res,next) {
    const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
    }
 
    orderService.createOrder(req.body)
    .then(()=>res.json({
        success: true,
        message: 'order created',
        
    }))
    .catch(err => next(err))
}

//======================================================================

function addFavorite(req,res,next) {
    orderService.addFavorite(req.params.orderID)
    .then(()=>res.json({
        success: true,
    }))
    .catch(err => next(err))
}

//======================================================================

function getOrderDetails(req,res,next) {

    orderService
    .getOrderDetails(req.params.orderID)
        .then(result => res.json({
            success: true,
            message: result,
        }))
        .catch(err => next(err))
}

function getOrderHistory(req,res,next) {
    
    orderService
        .getOrderHistory(req.params.userID)
            .then(orders => res.json({
                success: true,
                message: orders,
            }))
            .catch(err => next(err))
}

function getCartItems(req,res,next) {

    orderService.getCartItems(req.params.userID)
        .then(items => res.json({
            success: true,
            message: items
        }))
        .catch(err => next(err))
}
//======================================================================

function getFavorites(req,res,next) {
    orderService
        .getFavorites(req.params.userID)
            .then(orders => res.json({
                success: true,
                message: orders
            }))
            .catch(err => next(err))
}