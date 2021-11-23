"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateVariant = exports.updateProduct = exports.reviewProduct = exports.getVariantItem = exports.getProducts = exports.getProductDetails = exports.deleteProduct = exports.deleteCustomFee = exports.createVariant = exports.createProduct = exports.addVariantItem = exports.addCustomFee = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var productService = _interopRequireWildcard(require("../services/product.service.js"));

var _auth = require("../middleware/auth.js");

var _expressValidator = require("express-validator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var getProducts = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var allProducts;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(1234);

            if (req.query.skip === undefined || req.query.limit === undefined) {
              res.status(400).json({
                success: false,
                msg: "filtering parameters are missing"
              });
            }

            _context.next = 4;
            return productService.getProducts(req.query);

          case 4:
            allProducts = _context.sent;

            if (allProducts.err) {
              res.status(400).json({
                success: false,
                msg: allProducts.err
              });
            }

            allProducts && allProducts.length > 0 ? res.status(200).json({
              success: true,
              result: allProducts
            }) : res.status(404).json({
              success: false,
              msg: "No product found"
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getProducts(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.getProducts = getProducts;

var createProduct = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var storeID, errors, error_msgs, product;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // container to store the store's ID, be it a store request or an admin request
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context2.next = 8;
              break;
            }

            error_msgs = [];
            errors.array().forEach(function (element) {
              error_msgs = [].concat((0, _toConsumableArray2["default"])(error_msgs), [element.msg]);
            });
            return _context2.abrupt("return", res.status(400).json({
              success: false,
              msg: error_msgs
            }));

          case 8:
            _context2.next = 10;
            return productService.createProduct(req.body, storeID);

          case 10:
            product = _context2.sent;
            product.err ? res.status(409).json({
              success: false,
              msg: product.err
            }) : res.status(201).json({
              success: true,
              result: product
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function createProduct(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

exports.createProduct = createProduct;

var updateProduct = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var errors, storeID, request;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (!errors.isEmpty()) {
              res.status(400).json({
                success: false,
                errors: errors.array()["msg"]
              });
            }

            // container to store the store's ID, be it a store request or an admin request
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context3.next = 7;
            return productService.updateProduct(req.body, req.params.id, storeID);

          case 7:
            request = _context3.sent;
            request.err ? res.status(400).json({
              success: false,
              msg: request.err
            }) : res.status(200).json({
              success: true,
              result: request
            });

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function updateProduct(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

exports.updateProduct = updateProduct;

var deleteProduct = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var storeID, product;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context4.next = 5;
            return productService.deleteProduct(req.params.id, storeID);

          case 5:
            product = _context4.sent;
            product.err ? res.status(404).json({
              success: false,
              msg: product.err
            }) : res.status(201).json({
              success: true,
              result: product.msg
            });

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function deleteProduct(_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}();

exports.deleteProduct = deleteProduct;

var reviewProduct = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var newReview;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!req.store) {
              _context5.next = 2;
              break;
            }

            return _context5.abrupt("return", res.status(400).json({
              success: false,
              msg: "action not allowed by store"
            }));

          case 2:
            _context5.next = 4;
            return productService.reviewProduct(req.body);

          case 4:
            newReview = _context5.sent;

            if (!newReview.err) {
              _context5.next = 7;
              break;
            }

            return _context5.abrupt("return", res.status(400).json({
              success: false,
              msg: newReview.err
            }));

          case 7:
            res.status(200).json({
              success: true,
              result: newReview
            });

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function reviewProduct(_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}();

exports.reviewProduct = reviewProduct;

var getProductDetails = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var productDetails;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            console.log(req.params);
            _context6.next = 3;
            return productService.getProductDetails(req.params.productId);

          case 3:
            productDetails = _context6.sent;

            if (!productDetails.err) {
              _context6.next = 6;
              break;
            }

            return _context6.abrupt("return", res.status(400).json({
              success: false,
              msg: productDetails.err
            }));

          case 6:
            res.status(200).json({
              success: true,
              result: productDetails
            });

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function getProductDetails(_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}();

exports.getProductDetails = getProductDetails;

var createVariant = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var storeID, createVariant;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context7.next = 2;
              break;
            }

            return _context7.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context7.next = 7;
            return productService.createVariant(storeID, req.body);

          case 7:
            createVariant = _context7.sent;

            if (createVariant.err) {
              res.status(500).json({
                success: false,
                msg: createVariant.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: createVariant
              });
            }

          case 9:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function createVariant(_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}();

exports.createVariant = createVariant;

var updateVariant = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var storeID, updateVariant;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context8.next = 2;
              break;
            }

            return _context8.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context8.next = 7;
            return productService.updateVariant(req.params.variantId, req.body);

          case 7:
            updateVariant = _context8.sent;

            if (updateVariant.err) {
              console.log("error");
              res.status(500).json({
                success: false,
                msg: updateVariant.err
              });
            } else {
              console.log("no error");
              res.status(200).json({
                success: true,
                result: updateVariant
              });
            }

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function updateVariant(_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}();

exports.updateVariant = updateVariant;

var addVariantItem = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var storeID, addVariantItem;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context9.next = 2;
              break;
            }

            return _context9.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context9.next = 7;
            return productService.addVariantItem(req.params.variantId, req.body);

          case 7:
            addVariantItem = _context9.sent;

            if (addVariantItem.err) {
              console.log("error");
              res.status(500).json({
                success: false,
                msg: addVariantItem.err
              });
            } else {
              console.log("no error");
              res.status(200).json({
                success: true,
                result: addVariantItem
              });
            }

          case 9:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function addVariantItem(_x25, _x26, _x27) {
    return _ref9.apply(this, arguments);
  };
}();

exports.addVariantItem = addVariantItem;

var getVariantItem = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var storeID, getVariantItem;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context10.next = 2;
              break;
            }

            return _context10.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context10.next = 7;
            return productService.getVariantItem(req.params.variantId);

          case 7:
            getVariantItem = _context10.sent;

            if (getVariantItem.err) {
              res.status(500).json({
                success: false,
                msg: getVariantItem.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: getVariantItem
              });
            }

          case 9:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function getVariantItem(_x28, _x29, _x30) {
    return _ref10.apply(this, arguments);
  };
}();

exports.getVariantItem = getVariantItem;

var addCustomFee = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var storeID, addCustomFee;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context11.next = 2;
              break;
            }

            return _context11.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context11.next = 7;
            return productService.addCustomFee(storeID, req.body);

          case 7:
            addCustomFee = _context11.sent;

            if (addCustomFee.err) {
              res.status(500).json({
                success: false,
                msg: addCustomFee.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: addCustomFee
              });
            }

          case 9:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function addCustomFee(_x31, _x32, _x33) {
    return _ref11.apply(this, arguments);
  };
}();

exports.addCustomFee = addCustomFee;

var deleteCustomFee = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res, next) {
    var storeID, deleteCustomFee;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context12.next = 2;
              break;
            }

            return _context12.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this store"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context12.next = 7;
            return productService.deleteCustomFee(req.params.customFeeId);

          case 7:
            deleteCustomFee = _context12.sent;

            if (deleteCustomFee.err) {
              res.status(500).json({
                success: false,
                msg: deleteCustomFee.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: deleteCustomFee
              });
            }

          case 9:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function deleteCustomFee(_x34, _x35, _x36) {
    return _ref12.apply(this, arguments);
  };
}();

exports.deleteCustomFee = deleteCustomFee;
//# sourceMappingURL=product.controller.js.map