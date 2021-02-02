const express = require('express');
const router = express.Router();
const productService = require('./product.service');
const auth = require('../_helpers/auth');
const { check, validationResult } = require('express-validator');

// routes

// @route   GET /product
// @desc    Get all products
// @access  Private
router.get('/', auth, getProducts);

// @route   GET /product/my-products
// @desc    Get all products for a particular store when store is logged in
// @access  Private
router.get('/my-products', auth, getMyProducts);

// @route   GET /product/:id
// @desc    Get all products for a particular store when users are logged in
// @access  Private
router.get('/:id', auth, getStoreProducts);

// @route   POST /product/create
// @desc    Create product
// @access  Private
router.post(
    '/create', [
        check('product_name', 'Please Enter Product Name').not().isEmpty(),
        // check('images', 'Please add images for your store').not().isEmpty(),
        check('category', 'Please select Category').not().isEmpty(),
        check('availability', 'Please select availability status').not().isEmpty(),
        check('price', 'Please enter price of product').not().isEmpty(),
        // check('rating', 'Please Enter Stores Address').not().isEmpty(),
    ],
    auth,
    createProduct
);

// @route   PUT /product/update/:id
// @desc    Update product
// @access  Private
router.put('/update/:id', auth, updateProduct);


// @route   DELETE /product/delete/:id
// @desc    Delete product
// @access  Private
router.delete('/delete/:id', auth, deleteProduct);

module.exports = router;

function getProducts(req, res, next) {
    productService.getProducts()
        .then(products => res.json({
            success: true,
            products: products
        }))
        .catch(err => res.status(500).send({
            success: false,
            message: err
        }));
}

function getMyProducts(req, res, next) {
    productService.getMyProducts(req.user.id)
        .then(products => res.json({
            success: true,
            products: products
        }))
        .catch(err => res.status(500).send({
            success: false,
            message: err
        }));
}

function getStoreProducts(req, res, next) {
    productService.getStoreProducts(req.params.id)
        .then(products => res.json({
            success: true,
            products: products
        }))
        .catch(err => res.status(500).send({
            success: false,
            message: err
        }));
}

function createProduct(req, res, next) {
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

    productService.createProduct(req.body, req.user.id)
        .then(product => {
            res.json({
                success: true,
                product: product
            });
        })
        .catch(err => res.status(err.code != null ? err.code : 500).send({
            success: false,
            message: err.msg != null ? err.msg : 'Server Error'
        }));
}

function updateProduct(req, res, next) {
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //     res.status(400).json({ 
    //         success: false,
    //         errors: errors.array()['msg']
    //     });
    // }
    console.log(req.params.id);
    productService.updateProduct(req.body, req.params.id, req.user.id)
        .then(product => {
            res.json({
                success: true,
                product: product
            });
        })
        .catch(err => res.status(err.code != null ? err.code : 500).send({
            success: false,
            message: err.msg != null ? err.msg : 'Server Error'
        }));
}

function deleteProduct(req, res, next) {
    productService.deleteProduct(req.params.id, req.user.id)
        .then(message => {
            res.json({
                success: true,
                message: message
            });
        })
        .catch(err => res.status(err.code != null ? err.code : 500).send({
            success: false,
            message: err.msg != null ? err.msg : 'Server Error'
        }));
}