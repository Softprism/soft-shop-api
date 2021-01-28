const express = require('express');
const router = express.Router();
const productService = require('./product.service');

// routes

router.get('/', getProducts);
router.post('/create', createProduct)

module.exports = router;

function getProducts(req, res, next) {
    productService.getProducts()
        .then(products => res.json(products))
        .catch(err => next(err));
}
function createProduct(req,res,next) {
    productService.createProduct(req.body)
    .then(()=>res.json({}))
    .catch(err => next(err))
}