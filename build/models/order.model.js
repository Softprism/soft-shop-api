"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var OrderSchema = _mongoose["default"].Schema({
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  store: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    required: true,
    ref: "Store"
  },
  orderId: {
    type: String,
    unique: true
  },
  orderItems: [{
    productName: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true
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
    product: {
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
  }],
  deliveryAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    type: String
  },
  taxPrice: {
    type: Number,
    required: true,
    "default": 0.0
  },
  deliveryPrice: {
    type: Number,
    required: true,
    "default": 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    "default": 0.0
  },
  isPaid: {
    type: Boolean,
    "default": true
  },
  isDelivered: {
    type: Boolean,
    required: true,
    "default": false
  },
  isFavorite: {
    type: Boolean,
    required: true,
    "default": false
  },
  status: {
    type: String,
    // "sent", "delivered", "canceled" "enroute"
    required: true,
    "default": "sent"
  }
}, {
  timestamps: true
});

var Order = _mongoose["default"].model("Order", OrderSchema);

var _default = Order;
exports["default"] = _default;
//# sourceMappingURL=order.model.js.map