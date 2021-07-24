const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller')
const auth = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');

router.post(
	'/create',
	[
		check('product_name', 'Please Enter Product Name').not().isEmpty(),
		// check('images', 'Please add images for your store').not().isEmpty(),
		check('category', 'Please select Category').not().isEmpty(),
		check('availability', 'Please select availability status').not().isEmpty(),
		check('price', 'Please enter price of product').not().isEmpty(),
		// check('rating', 'Please Enter Stores Address').not().isEmpty(),
	],
	auth,
	productController.createProduct
);
router.get('/my-products', productController.getMyProducts);
router.post('/find/:limit/:skip', productController.findProduct);

module.exports = router;