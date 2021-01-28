const express = require('express');
const router = express.Router();
const orderService = require('./order.service');

// routes

router.get('/', getOrders);
router.post('/create', createOrder)

module.exports = router;

function getOrders(req, res, next) {
    orderService.getOrders()
        .then(orders => res.json(orders))
        .catch(err => next(err));
}
function createOrder(req,res,next) {
    orderService.createOrder(req.body)
    .then(()=>res.json({}))
    .catch(err => next(err))
}