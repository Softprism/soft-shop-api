"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _userController = require("../controllers/user.controller.js");

var _auth = require("../middleware/auth.js");

var router = _express["default"].Router();

// @route   GET /users
// @desc    Get all Users
// @access  Public
router.get("/", _userController.getUsers); // @route   POST /verify
// @desc    send OTP to verify new user signup email
// @access  Public

router.post("/verify", _userController.verifyEmailAddress); // @route   POST /users/register
// @desc    Register a User
// @access  Public

router.post("/register", [(0, _expressValidator.check)("first_name", "Please Enter First Name").not().isEmpty(), (0, _expressValidator.check)("last_name", "Please Enter Last Name").not().isEmpty(), (0, _expressValidator.check)("email", "Please Enter Valid Email").isEmail(), (0, _expressValidator.check)("phone_number", "Please Enter Valid Phone Number").isMobilePhone(), (0, _expressValidator.check)("password", "Please Enter Password with 6 or more characters").isLength({
  min: 6
})], _userController.registerUser); // @route   POST /user/login
// @desc    Login a User & get token
// @access  Public

router.post("/login", [(0, _expressValidator.check)("email", "Please enter a Valid Email").isEmail(), (0, _expressValidator.check)("password", "Password should be 6 characters or more").isLength({
  min: 6
}), (0, _expressValidator.check)("password", "Password is Required").exists()], _userController.loginUser); // @route   GET /user/login
// @desc    Get logged in user
// @access  Private

router.get("/login", _auth.auth, _userController.getLoggedInUser); // @route   PUT user/
// @desc    Update User Details
// @access  Private

router.put("/", _auth.auth, _userController.updateUser); // @route   POST /cart
// @desc    creates a basket for the user
// @access  Public

router.get("/basket", _auth.auth, _userController.getUserBasketItems); // @route   POST /basket
// @desc    adds a product to User's basket
// @access  Public

router.post("/basket", _auth.auth, _userController.addItemToBasket); // @route   PUT /basket
// @desc    edit an item in user's basket
// @access  Public

router.put("/basket", _auth.auth, _userController.editBasketItems); // @route   DELETE /basket
// @desc    delete one item from user's basket
// @access  Public

router["delete"]("/basket", _auth.auth, _userController.deleteBasketItem); // @route   DELETE /basket/all
// @desc    deletes all item in user's basket
// @access  Public

router["delete"]("/basket/all", _auth.auth, _userController.deleteAllBasketItems); // @route   PUT /password
// @desc    reset a forget password
// @access  Public

router.put("/forgot-password", _userController.forgotPassword); // @route   GET /token
// @desc    validates a token
// @access  Public

router.get("/token", _userController.validateToken); // @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public

router.patch("/password", _userController.createNewPassword);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=user.routes.js.map