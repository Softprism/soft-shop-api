"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var adminSchema = _mongoose["default"].Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var Admin = _mongoose["default"].model('Admin', adminSchema);

var _default = Admin;
exports["default"] = _default;
//# sourceMappingURL=admin.model.js.map