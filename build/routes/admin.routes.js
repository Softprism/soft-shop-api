"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _adminController = require("../controllers/admin.controller.js");

var _auth = require("../middleware/auth.js");

var router = _express["default"].Router();

// @route   GET /admin
// @desc    Get all Admin Users
// @access  Public
router.get('/', _auth.auth, _adminController.getAdmins); // @route   POST admin/register
// @desc    Register an Admin account
// @access  Public

router.post('/register', [(0, _expressValidator.check)('username', 'Please Enter Username').not().isEmpty(), (0, _expressValidator.check)('password', 'Please Enter Password with 6 or more characters').isLength({
  min: 6
})], _adminController.registerAdmin); // @route   POST admins/login
// @desc    Login a User & get token
// @access  Public

router.post('/login', [(0, _expressValidator.check)('username', 'Please enter a Username').exists(), (0, _expressValidator.check)('password', 'Password should be 6 characters or more').isLength({
  min: 6
}), (0, _expressValidator.check)('password', 'Password is Required').exists()], _adminController.loginAdmin); // @route   GET admins/login
// @desc    Get logged in user
// @access  Private

router.get('/login', _auth.auth, _adminController.getLoggedInAdmin); // @route   PUT admins/:id
// @desc    Update User Details
// @access  Private

router.put('/', _auth.auth, _adminController.updateAdmin);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=admin.routes.js.map