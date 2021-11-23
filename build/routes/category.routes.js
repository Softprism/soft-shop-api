"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = require("../middleware/auth.js");

var _categoryController = require("../controllers/category.controller.js");

var router = _express["default"].Router();

// @route   GET /category
// @desc    Get all Categories
// @access  Public
router.get('/', _auth.auth, _categoryController.getCategories); // @route   POST /category/new
// @desc    Create New Category
// @access  Public

router.post('/', [(0, _expressValidator.check)('name', 'Please enter valid category name').isString(), (0, _expressValidator.check)('image', 'Please upload Image').exists()], _auth.auth, _categoryController.createCategory); // @route   PUT /category/edit/:id
// @desc    Edit Category Category
// @access  Public

router.put('/:id', _auth.auth, _categoryController.editCategory); // @route   DELETE /category/delete/:id
// @desc    Create New Category
// @access  Public

router["delete"]('/:id', _auth.auth, _categoryController.deleteCategory);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=category.routes.js.map