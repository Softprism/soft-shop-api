"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _storeController = require("../controllers/store.controller.js");

var _auth = require("../middleware/auth.js");

var router = _express["default"].Router();

// @route   GET /store
// @desc    Get all registered stores
// @access  Private
router.get("/", _auth.auth, _storeController.getStores); // @route   GET /stores/login
// @desc    Get logged in Store
// @access  Private

router.get("/login", _auth.auth, _storeController.getLoggedInStore); // @route   GET /store/labels
// @desc    Get a store's labels
// @access  Private

router.get("/labels", _auth.auth, _storeController.getLabels); // @route   GET /store
// @desc    Get store data, used when a store is being checked, produces store data like name, rating/reviews, menu labels, address, delivery time, and products
// @access  Private

router.get("/:storeId", _auth.auth, _storeController.getStore); // @route   POST /store/create
// @desc    Register a store
// @access  Public

router.post("/", [(0, _expressValidator.check)("name", "Please Enter Store Name").not().isEmpty(), // check('images', 'Please add images for your store').not().isEmpty(),
(0, _expressValidator.check)("address", "Please Enter Stores Address").not().isEmpty(), (0, _expressValidator.check)("openingTime", "Please Enter Opening Time").not().isEmpty(), (0, _expressValidator.check)("closingTime", "Please Enter Closing Time").not().isEmpty(), (0, _expressValidator.check)("email", "Please Enter Valid Email").isEmail(), (0, _expressValidator.check)("phone_number", "Please Enter Valid Phone Number").isMobilePhone(), (0, _expressValidator.check)("password", "Please Enter Password with 6 or more characters").isLength({
  min: 6
})], _storeController.createStore); // @route   POST /store/login
// @desc    Login a store
// @access  Public

router.post("/login", [(0, _expressValidator.check)("email", "Please enter store email").not().isEmpty(), (0, _expressValidator.check)("password", "Please Enter Password with 6 or more characters").isLength({
  min: 6
}), (0, _expressValidator.check)("password", "Password is Required").exists()], _storeController.loginStore); // @route   PUT /store/
// @desc    Update a store
// @access  Private

router.put("/", _auth.auth, _storeController.updateStore); // @route   PUT /stores/label
// @desc    add label to store
// @access  Private

router.put("/label", _auth.auth, _storeController.addLabel);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=store.routes.js.map