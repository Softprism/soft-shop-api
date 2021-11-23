"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var StoreSchema = _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  // array to store multiple images
  address: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  category: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Category"
  },
  openingTime: {
    type: String,
    required: true
  },
  closingTime: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: String
  },
  location: {
    type: {
      type: String,
      "default": "Point",
      "enum": ["Point"]
    },
    coordinates: [Number]
  },
  labels: [{
    labelTitle: {
      type: String
    },
    labelThumb: {
      type: String
    } //Label thumbnail

  }],
  isVerified: {
    type: Boolean,
    "default": false
  },
  // this validates a store on the platform
  isActive: {
    type: Boolean,
    "default": true
  },
  // this shows if a store is available to receive orders
  createdDate: {
    type: Date,
    "default": Date.now
  },
  tax: {
    type: String
  }
});

StoreSchema.index({
  location: "2dsphere"
});

var Store = _mongoose["default"].model("Store", StoreSchema);

var _default = Store;
exports["default"] = _default;
//# sourceMappingURL=store.model.js.map