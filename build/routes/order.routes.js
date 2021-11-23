"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = require("../middleware/auth.js");

var _orderController = require("../controllers/order.controller.js");

var router = _express["default"].Router();

// @route   GET /
// @desc    Get all orders from all stores.
// @access  Private
router.get("/", _auth.auth, _orderController.getOrders); // @route   POST /create
// @desc    create a new order
// @access  Private

router.post("/", _auth.auth, [(0, _expressValidator.check)("product_meta", "error with product data ").isLength({
  min: 1
}), (0, _expressValidator.check)("store", "Please select a store").not().isEmpty()], _orderController.createOrder); // @route   PUT /toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private

router.patch("/toggle-favorite/:orderID", _auth.auth, _orderController.toggleFavorite); // @route   GET /:orderID
// @desc    toggles an order's detail
// @access  Private

router.get("/:orderID", _auth.auth, _orderController.getOrderDetails); // @route   PUT /user/edit/
// @desc    modify fields in an order
// @access  Private

router.put("/user/edit/:orderID", _auth.auth, _orderController.editOrder); // @route   PUT /review
// @desc    user adds review to their order
// @access  Private

router.put("/review", _auth.auth, _orderController.reviewOrder);
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=order.routes.js.map