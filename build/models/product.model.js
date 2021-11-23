"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var ProductSchema = _mongoose["default"].Schema({
  product_name: {
    type: String,
    required: true
  },
  product_description: {
    type: String,
    required: true
  },
  product_image: [{
    type: String,
    required: true
  }],
  // array to store multiple images
  store: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  category: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  variantOpt: {
    type: Boolean,
    required: true
  },
  variant: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Variants",
    required: true
  }],
  label: [{
    type: String,
    required: true
  }],
  availability: {
    type: Boolean,
    required: true,
    "default": true
  },
  status: {
    type: String,
    "default": "active"
  },
  // deleted||active
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: String,
    required: false
  },
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var Product = _mongoose["default"].model("Product", ProductSchema);

var _default = Product;
exports["default"] = _default;
//# sourceMappingURL=product.model.js.map