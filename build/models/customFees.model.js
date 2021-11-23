"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var CustomFeesSchema = _mongoose["default"].Schema({
  title: {
    type: String
  },
  amount: {
    type: Number
  },
  product: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var CustomFee = _mongoose["default"].model('CustomFee', CustomFeesSchema);

var _default = CustomFee;
exports["default"] = _default;
//# sourceMappingURL=customFees.model.js.map