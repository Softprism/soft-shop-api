"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var userSchema = _mongoose["default"].Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  address: [{
    address_type: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  orders: [{
    type: _mongoose["default"].Types.ObjectId,
    ref: "Order"
  }],
  // array to store multiple orders
  isVerified: {
    type: Boolean,
    required: true,
    "default": false
  },
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var User = _mongoose["default"].model("User", userSchema);

var _default = User;
exports["default"] = _default;
//# sourceMappingURL=user.model.js.map