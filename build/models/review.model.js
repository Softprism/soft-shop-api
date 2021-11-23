"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var ReviewSchema = _mongoose["default"].Schema({
  star: {
    type: Number
  },
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Product'
  },
  order: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Order'
  },
  text: {
    type: String
  }
});

var Review = _mongoose["default"].model('Review', ReviewSchema);

var _default = Review;
exports["default"] = _default;
//# sourceMappingURL=review.model.js.map