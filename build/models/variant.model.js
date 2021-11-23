"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var VariantSchema = _mongoose["default"].Schema({
  variantTitle: {
    type: String
  },
  variantItems: [{
    itemName: {
      type: String
    },
    itemThumbnail: {
      type: String
    },
    itemPrice: {
      type: Number
    },
    required: {
      type: Boolean
    },
    quantityOpt: {
      type: Boolean
    }
  }],
  multiSelect: {
    type: Boolean,
    required: true
  },
  createdDate: {
    type: Date,
    "default": Date.now
  }
});

var Variant = _mongoose["default"].model("Variant", VariantSchema);

var _default = Variant;
exports["default"] = _default;
//# sourceMappingURL=variant.model.js.map