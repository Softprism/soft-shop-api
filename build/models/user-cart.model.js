"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var BasketSchema = _mongoose["default"].Schema({
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  product: {
    productName: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true,
      "default": 1
    },
    productImage: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    // qty * price
    productId: {
      type: _mongoose["default"].Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    selectedVariants: [{
      variantId: {
        type: _mongoose["default"].Schema.Types.ObjectId,
        required: true,
        ref: "Variants"
      },
      variantTitle: {
        type: String,
        required: true
      },
      itemName: {
        type: String,
        required: true
      },
      itemPrice: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      totalPrice: {
        type: Number,
        required: true
      }
    }]
  }
}, {
  timestamps: true
});

var Basket = _mongoose["default"].model("Basket", BasketSchema);

var _default = Basket;
exports["default"] = _default;
//# sourceMappingURL=user-cart.model.js.map