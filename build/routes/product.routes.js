"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = require("../middleware/auth.js");

var _productController = require("../controllers/product.controller.js");

var router = _express["default"].Router();

// @route   GET /
// @desc    Get all products from all stores.
// @access  Private
router.get("/", _auth.auth, _productController.getProducts); // @route   POST /create
// @desc    add a new product to store
// @access  Private

router.post("/create", [(0, _expressValidator.check)("product_name", "Please Enter Product Name").not().isEmpty(), // check('images', 'Please add images for your store').not().isEmpty(),
(0, _expressValidator.check)("category", "Please select Category").not().isEmpty(), (0, _expressValidator.check)("price", "Please enter price of product").not().isEmpty() // check('rating', 'Please Enter Stores Address').not().isEmpty(),
], _auth.auth, _productController.createProduct); // @route   PUT /review
// @desc    user adds review to a product
// @access  Private

router.put("/review", _auth.auth, _productController.reviewProduct); // @route   PUT /stores/variants
// @desc    add variant to store
// @access  Private

router.put("/variants/:variantId/item", _auth.auth, _productController.addVariantItem); // @route   PUT /stores/variants
// @desc    add variant to store
// @access  Private

router.put("/variants/:variantId", _auth.auth, _productController.updateVariant); // @route   GET /stores/variants
// @desc   gets variant items
// @access  Private

router.get("/variants/:variantId", _auth.auth, _productController.getVariantItem); // @route   PUT /:id
// @desc    update a store product, can be used by admin and stores
// @access  Private

router.put("/:id", _auth.auth, _productController.updateProduct); // @route   GET /
// @desc    Get a product info.
// @access  Private

router.get("/:productId", _auth.auth, _productController.getProductDetails); // @route   DELETE /:id
// @desc    delete a store product, can be used by admin and stores
// @access  Private

router["delete"]("/:id", _auth.auth, _productController.deleteProduct); // @route   POST /stores/variants
// @desc    add variant to store
// @access  Private

router.post("/variants", _auth.auth, _productController.createVariant); // @route   POST /stores/custom-fees
// @desc    add custom fee to product
// @access  Private

router.post("/custom-fees", _auth.auth, _productController.addCustomFee); // @route   DELETE /stores/custom-fees
// @desc    delete custom fee
// @access  Private

router["delete"]("/custom-fees/:customFeeId", _auth.auth, _productController.deleteCustomFee);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=product.routes.js.map