"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var tokenSchema = _mongoose["default"].Schema({
  email: {
    type: String,
    required: true,
    ref: "User"
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    // user-forget-password, user-signup
    required: true
  },
  createdAt: {
    type: Date,
    "default": Date.now,
    expires: 3600
  }
}, {
  timestamps: true
});

var Token = _mongoose["default"].model("Token", tokenSchema);

var _default = Token;
exports["default"] = _default;
//# sourceMappingURL=tokens.model.js.map