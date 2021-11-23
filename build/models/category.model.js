"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var CategorySchema = _mongoose["default"].Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  image: [{
    type: String,
    required: true
  }],
  // array to store multiple images
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var Category = _mongoose["default"].model('Category', CategorySchema);

var _default = Category;
exports["default"] = _default;
//# sourceMappingURL=category.model.js.map