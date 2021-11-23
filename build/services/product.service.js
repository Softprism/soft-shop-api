"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateVariant = exports.updateProduct = exports.reviewProduct = exports.getVariantItem = exports.getProducts = exports.getProductDetails = exports.deleteProduct = exports.deleteCustomFee = exports.createVariant = exports.createProduct = exports.addVariantItem = exports.addCustomFee = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _productModel = _interopRequireDefault(require("../models/product.model.js"));

var _storeModel = _interopRequireDefault(require("../models/store.model.js"));

var _reviewModel = _interopRequireDefault(require("../models/review.model.js"));

var _variantModel = _interopRequireDefault(require("../models/variant.model.js"));

var _customFeesModel = _interopRequireDefault(require("../models/customFees.model.js"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var getProducts = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(getParam) {
    var limit, skip, matchParam, pipeline, allProducts;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // get limit and skip from url parameters
            limit = Number(getParam.limit);
            skip = Number(getParam.skip);
            matchParam = {};

            if (getParam.product_name) {
              matchParam.product_name = new RegExp(getParam.product_name, "i");
            }

            if (getParam.category) {
              matchParam.category = _mongoose["default"].Types.ObjectId(getParam.category);
            }

            if (getParam.store) {
              matchParam.store = _mongoose["default"].Types.ObjectId(getParam.store);
            }

            if (getParam.price) {
              matchParam.price = getParam.price;
            }

            if (getParam.availability) {
              getParam.availability = getParam.availability === "true";
              matchParam.availability = getParam.availability;
            }

            if (getParam.rating) {
              matchParam.rating = getParam.rating;
            }

            if (getParam.status) {
              matchParam.status = getParam.status;
            }

            if (getParam.label) {
              matchParam.label = _mongoose["default"].Types.ObjectId(getParam.label);
            }

            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "category.image", "productReview", "store.address", "variants.data", "variant.items", "customFee.items"]
            }];
            allProducts = _productModel["default"].aggregate().match(matchParam) // Get data from review collection for each product
            .lookup({
              from: "reviews",
              localField: "_id",
              foreignField: "product",
              as: "productReview"
            }) // Populate store field
            .lookup({
              from: "stores",
              localField: "store",
              foreignField: "_id",
              as: "store"
            }) // populat category field
            .lookup({
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }) // add the averageRating field for each product
            .addFields({
              totalRates: {
                $sum: "$productReview.star"
              },
              ratingAmount: {
                $size: "$productReview"
              },
              averageRating: {
                $ceil: {
                  $avg: "$productReview.star"
                }
              }
            }) // $lookup produces array, $unwind go destructure everything to object
            .unwind("$store").unwind("$category") // removing fields we don't need
            .append(pipeline) // Sorting and pagination
            .sort("-createdDate").limit(limit).skip(skip);
            return _context.abrupt("return", allProducts);

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);
            return _context.abrupt("return", _context.t0);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 17]]);
  }));

  return function getProducts(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getProducts = getProducts;

var getProductDetails = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(productId) {
    var pipeline, productDetails;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log(1, productId);
            _context2.prev = 1;
            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "category.image", "productReview", "store.address", "variants.data"]
            }];
            productDetails = _productModel["default"].aggregate().match({
              _id: _mongoose["default"].Types.ObjectId(productId)
            }) // Get data from review collection for each product
            .lookup({
              from: "reviews",
              localField: "_id",
              foreignField: "product",
              as: "productReview"
            }) // Populate store field
            .lookup({
              from: "stores",
              localField: "store",
              foreignField: "_id",
              as: "store"
            }) // populat category field
            .lookup({
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }).lookup({
              from: "variants",
              localField: "variant.items",
              foreignField: "_id",
              as: "variant"
            }).lookup({
              from: "customfees",
              localField: "_id",
              foreignField: "product",
              as: "customFee"
            }) // add the averageRating field for each product
            .addFields({
              totalRates: {
                $sum: "$productReview.star"
              },
              ratingAmount: {
                $size: "$productReview"
              },
              averageRating: {
                $ceil: {
                  $avg: "$productReview.star"
                }
              }
            }) // $lookup produces array, $unwind go destructure everything to object
            .unwind("$store").unwind("$category") // removing fields we don't need
            .append(pipeline);
            return _context2.abrupt("return", productDetails);

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](1);
            console.log(_context2.t0);
            return _context2.abrupt("return", _context2.t0);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 7]]);
  }));

  return function getProductDetails(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.getProductDetails = getProductDetails;

var createProduct = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(productParam, storeId) {
    var store, newProduct;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _storeModel["default"].findById(storeId)["catch"](function (err) {
              throw {
                err: "store not found"
              };
            });

          case 3:
            store = _context3.sent;

            if (store) {
              _context3.next = 6;
              break;
            }

            throw "unable to add product to this store";

          case 6:
            // add store ID to productParam
            productParam.store = storeId; //create new product

            newProduct = new _productModel["default"](productParam);
            _context3.next = 10;
            return newProduct.save();

          case 10:
            return _context3.abrupt("return", newProduct);

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", _context3.t0);

          case 16:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 13]]);
  }));

  return function createProduct(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.createProduct = createProduct;

var updateProduct = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(productParam, productId, storeId) {
    var product, _updateProduct;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _productModel["default"].findById(productId);

          case 3:
            product = _context4.sent;

            if (product) {
              _context4.next = 6;
              break;
            }

            throw {
              err: "Product not found"
            };

          case 6:
            _context4.next = 8;
            return _productModel["default"].findByIdAndUpdate(productId, {
              $set: productParam
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 8:
            _updateProduct = _context4.sent;
            return _context4.abrupt("return", _updateProduct);

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", _context4.t0);

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 12]]);
  }));

  return function updateProduct(_x5, _x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

exports.updateProduct = updateProduct;

var deleteProduct = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(productId, storeId) {
    var store, product;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return _storeModel["default"].findById(storeId);

          case 3:
            store = _context5.sent;

            if (store) {
              _context5.next = 6;
              break;
            }

            throw {
              err: "Unable to delete products from this store"
            };

          case 6:
            _context5.next = 8;
            return _productModel["default"].findById(productId);

          case 8:
            product = _context5.sent;

            if (product) {
              _context5.next = 11;
              break;
            }

            throw {
              err: "Product not found"
            };

          case 11:
            _context5.next = 13;
            return _productModel["default"].deleteOne({
              _id: productId
            });

          case 13:
            return _context5.abrupt("return", {
              msg: "Successfully Deleted Product"
            });

          case 16:
            _context5.prev = 16;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return", _context5.t0);

          case 19:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 16]]);
  }));

  return function deleteProduct(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

exports.deleteProduct = deleteProduct;

var reviewProduct = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(review) {
    var product, newReview;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return _productModel["default"].findById(review.product);

          case 3:
            product = _context6.sent;

            if (product) {
              _context6.next = 6;
              break;
            }

            throw {
              err: "product could not be found"
            };

          case 6:
            newReview = new _reviewModel["default"](review);
            _context6.next = 9;
            return newReview.save();

          case 9:
            return _context6.abrupt("return", newReview);

          case 12:
            _context6.prev = 12;
            _context6.t0 = _context6["catch"](0);
            return _context6.abrupt("return", _context6.t0);

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 12]]);
  }));

  return function reviewProduct(_x10) {
    return _ref6.apply(this, arguments);
  };
}();

exports.reviewProduct = reviewProduct;

var createVariant = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(storeId, variantParam) {
    var store, newVariant;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return _storeModel["default"].findById(storeId);

          case 3:
            store = _context7.sent;

            if (store) {
              _context7.next = 6;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 6:
            // this ain't working
            newVariant = new _variantModel["default"](variantParam);
            _context7.next = 9;
            return newVariant.save();

          case 9:
            return _context7.abrupt("return", newVariant);

          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7["catch"](0);
            console.log(_context7.t0);
            return _context7.abrupt("return", _context7.t0);

          case 16:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 12]]);
  }));

  return function createVariant(_x11, _x12) {
    return _ref7.apply(this, arguments);
  };
}();

exports.createVariant = createVariant;

var updateVariant = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(variantId, updateParam) {
    var variant, _updateVariant;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return _variantModel["default"].findById(variantId);

          case 3:
            variant = _context8.sent;

            if (variant) {
              _context8.next = 6;
              break;
            }

            throw {
              err: "variant not found"
            };

          case 6:
            _context8.next = 8;
            return _variantModel["default"].findByIdAndUpdate(variantId, {
              $set: updateParam
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 8:
            _updateVariant = _context8.sent;
            return _context8.abrupt("return", _updateVariant);

          case 12:
            _context8.prev = 12;
            _context8.t0 = _context8["catch"](0);
            return _context8.abrupt("return", _context8.t0);

          case 15:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 12]]);
  }));

  return function updateVariant(_x13, _x14) {
    return _ref8.apply(this, arguments);
  };
}();

exports.updateVariant = updateVariant;

var addVariantItem = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(variantId, variantParam) {
    var variant;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return _variantModel["default"].findById(variantId);

          case 3:
            variant = _context9.sent;

            if (variant) {
              _context9.next = 6;
              break;
            }

            throw {
              err: "variant not found"
            };

          case 6:
            // push new variant item and save
            variant.variantItems.push(variantParam);
            variant.save();
            return _context9.abrupt("return", variant);

          case 11:
            _context9.prev = 11;
            _context9.t0 = _context9["catch"](0);
            return _context9.abrupt("return", _context9.t0);

          case 14:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 11]]);
  }));

  return function addVariantItem(_x15, _x16) {
    return _ref9.apply(this, arguments);
  };
}();

exports.addVariantItem = addVariantItem;

var getVariantItem = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(variantId) {
    var variant;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _context10.next = 3;
            return _variantModel["default"].findById(variantId);

          case 3:
            variant = _context10.sent;

            if (variant) {
              _context10.next = 6;
              break;
            }

            throw {
              err: "variant not found"
            };

          case 6:
            return _context10.abrupt("return", variant.variantItems);

          case 9:
            _context10.prev = 9;
            _context10.t0 = _context10["catch"](0);
            return _context10.abrupt("return", _context10.t0);

          case 12:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 9]]);
  }));

  return function getVariantItem(_x17) {
    return _ref10.apply(this, arguments);
  };
}();

exports.getVariantItem = getVariantItem;

var addCustomFee = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(storeId, customrFeeParam) {
    var store, product, newCustomFee;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _context11.next = 3;
            return _storeModel["default"].findById(storeId);

          case 3:
            store = _context11.sent;
            _context11.next = 6;
            return _productModel["default"].findById(customrFeeParam.product);

          case 6:
            product = _context11.sent;

            if (store) {
              _context11.next = 9;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 9:
            if (product) {
              _context11.next = 11;
              break;
            }

            throw {
              err: "product not found"
            };

          case 11:
            newCustomFee = new _customFeesModel["default"](customrFeeParam);
            _context11.next = 14;
            return newCustomFee.save();

          case 14:
            if (!newCustomFee.save()) {
              _context11.next = 19;
              break;
            }

            product.customFee.availability = true;
            product.customFee.items.push(newCustomFee._id);
            _context11.next = 19;
            return product.save();

          case 19:
            _context11.next = 21;
            return _customFeesModel["default"].find({
              product: newCustomFee.product
            });

          case 21:
            return _context11.abrupt("return", _context11.sent);

          case 24:
            _context11.prev = 24;
            _context11.t0 = _context11["catch"](0);
            return _context11.abrupt("return", _context11.t0);

          case 27:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[0, 24]]);
  }));

  return function addCustomFee(_x18, _x19) {
    return _ref11.apply(this, arguments);
  };
}();

exports.addCustomFee = addCustomFee;

var deleteCustomFee = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(customFeeId) {
    var customFee;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            console.log(customFeeId);
            _context12.next = 4;
            return _customFeesModel["default"].findByIdAndDelete(customFeeId);

          case 4:
            customFee = _context12.sent;
            console.log(customFee);

            if (customFee) {
              _context12.next = 8;
              break;
            }

            throw {
              err: "custom fee not found"
            };

          case 8:
            return _context12.abrupt("return", "fee removed from product");

          case 11:
            _context12.prev = 11;
            _context12.t0 = _context12["catch"](0);
            return _context12.abrupt("return", _context12.t0);

          case 14:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[0, 11]]);
  }));

  return function deleteCustomFee(_x20) {
    return _ref12.apply(this, arguments);
  };
}(); //UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.


exports.deleteCustomFee = deleteCustomFee;
//# sourceMappingURL=product.service.js.map