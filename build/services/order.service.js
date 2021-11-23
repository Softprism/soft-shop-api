"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleFavorite = exports.reviewOrder = exports.getOrders = exports.getOrderDetails = exports.editOrder = exports.createOrder = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _orderModel = _interopRequireDefault(require("../models/order.model.js"));

var _userModel = _interopRequireDefault(require("../models/user.model.js"));

var _storeModel = _interopRequireDefault(require("../models/store.model.js"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _reviewModel = _interopRequireDefault(require("../models/review.model.js"));

var getOrders = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(urlParams) {
    var matchParam, limit, skip, pipeline, orders;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            matchParam = {};
            limit = Number(urlParams.limit);
            skip = Number(urlParams.skip);
            if (urlParams.store) matchParam.store = _mongoose["default"].Types.ObjectId(urlParams.store);
            if (urlParams.user) matchParam.user = _mongoose["default"].Types.ObjectId(urlParams.user);
            if (urlParams.isFavorite) matchParam.isFavorite = urlParams.isFavorite;
            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "store.images", "store.category", "store.openingTime", "store.closingTime", "product_meta.details.variants", "product_meta.details.store", "product_meta.details.category", "product_meta.details.label", "productData", "user.password", "user.orders"]
            }];
            orders = _orderModel["default"].aggregate().match(matchParam).project({
              status: 1,
              totalPrice: 1,
              "orderItems.productName": 1,
              orderId: 1,
              "orderItems.selectedVariants.itemName": 1
            }).append(pipeline).sort("-createdDate").limit(limit).skip(skip);
            return _context.abrupt("return", orders);

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);
            return _context.abrupt("return", {
              err: "error loading orders"
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 12]]);
  }));

  return function getOrders(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getOrders = getOrders;

var createOrder = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(orderParam) {
    var store, user, vUser, vStore, orderId, order, newOrder, pipeline, neworder;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            store = orderParam.store, user = orderParam.user; //validate user

            _context2.next = 4;
            return _userModel["default"].findById(user);

          case 4:
            vUser = _context2.sent;

            if (vUser) {
              _context2.next = 7;
              break;
            }

            throw {
              err: "User not found"
            };

          case 7:
            _context2.next = 9;
            return _storeModel["default"].findById(store);

          case 9:
            vStore = _context2.sent;

            if (vStore) {
              _context2.next = 12;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 12:
            //generates random unique id;
            orderId = function orderId() {
              var s4 = function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
              }; //return id of format 'soft - aaaaa'


              return "soft - " + s4();
            }; //creates an order for user after all validation passes


            order = new _orderModel["default"](orderParam);
            order.orderId = orderId();
            _context2.next = 17;
            return order.save();

          case 17:
            newOrder = _context2.sent;
            // Returns new order to response
            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "store.images", "store.category", "store.openingTime", "store.closingTime", "productData", "user.password", "user.orders"]
            }];
            _context2.next = 21;
            return _orderModel["default"].aggregate().match({
              orderId: newOrder.orderId
            }).lookup({
              from: "stores",
              localField: "store",
              foreignField: "_id",
              as: "store"
            }).lookup({
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }).addFields({
              user: {
                $arrayElemAt: ["$user", 0]
              },
              store: {
                $arrayElemAt: ["$store", 0]
              }
            }).append(pipeline);

          case 21:
            neworder = _context2.sent;
            return _context2.abrupt("return", neworder);

          case 25:
            _context2.prev = 25;
            _context2.t0 = _context2["catch"](0);
            console.log(_context2.t0);
            return _context2.abrupt("return", {
              err: "error creating new order"
            });

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 25]]);
  }));

  return function createOrder(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.createOrder = createOrder;

var toggleFavorite = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(orderID) {
    var order;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _orderModel["default"].findById(orderID);

          case 3:
            order = _context3.sent;

            if (order) {
              _context3.next = 6;
              break;
            }

            throw {
              err: "Invalid Order"
            };

          case 6:
            order.isFavorite = !order.isFavorite;
            order.save();

            if (!order.isFavorite) {
              _context3.next = 13;
              break;
            }

            console.log("Order marked as favorite");
            return _context3.abrupt("return", {
              msg: "Order marked as favorite"
            });

          case 13:
            console.log("Order removed from favorite");
            return _context3.abrupt("return", {
              msg: "Order removed from favorites"
            });

          case 15:
            _context3.next = 20;
            break;

          case 17:
            _context3.prev = 17;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", {
              err: "Error marking order as favorite"
            });

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 17]]);
  }));

  return function toggleFavorite(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.toggleFavorite = toggleFavorite;

var getOrderDetails = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(orderID) {
    var order, pipeline, orderDetails;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _orderModel["default"].findById(orderID);

          case 3:
            order = _context4.sent;

            if (order) {
              _context4.next = 6;
              break;
            }

            throw {
              err: "Error getting this order details"
            };

          case 6:
            //get users order details
            //can be used by users, stores and admin
            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "store.images", "store.category", "store.openingTime", "store.closingTime", "productData", "user.password", "user.orders"]
            }];
            _context4.next = 9;
            return _orderModel["default"].aggregate().match({
              orderId: order.orderId
            }).lookup({
              from: "stores",
              localField: "store",
              foreignField: "_id",
              as: "store"
            }).lookup({
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }).addFields({
              user: {
                $arrayElemAt: ["$user", 0]
              },
              store: {
                $arrayElemAt: ["$store", 0]
              }
            }).append(pipeline);

          case 9:
            orderDetails = _context4.sent;
            return _context4.abrupt("return", orderDetails);

          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", _context4.t0);

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 13]]);
  }));

  return function getOrderDetails(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.getOrderDetails = getOrderDetails;

var editOrder = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(orderID, orderParam) {
    var pipeline, newOrder;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return _orderModel["default"].findByIdAndUpdate(orderID, {
              $set: orderParam
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 3:
            pipeline = [{
              $unset: ["store.password", "store.email", "store.labels", "store.phone_number", "store.images", "store.category", "store.openingTime", "store.closingTime", "productData", "user.password", "user.orders"]
            }];
            _context5.next = 6;
            return _orderModel["default"].aggregate().match({
              _id: _mongoose["default"].Types.ObjectId(orderID)
            }).lookup({
              from: "stores",
              localField: "store",
              foreignField: "_id",
              as: "store"
            }).lookup({
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }).addFields({
              user: {
                $arrayElemAt: ["$user", 0]
              },
              store: {
                $arrayElemAt: ["$store", 0]
              }
            }).append(pipeline);

          case 6:
            newOrder = _context5.sent;
            return _context5.abrupt("return", newOrder);

          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);
            return _context5.abrupt("return", {
              err: "error editing this order"
            });

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 10]]);
  }));

  return function editOrder(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
}();

exports.editOrder = editOrder;

var reviewOrder = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(review) {
    var product, newReview;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return _orderModel["default"].findById(review.order);

          case 3:
            product = _context6.sent;

            if (product) {
              _context6.next = 6;
              break;
            }

            throw {
              err: "order could not be found"
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

  return function reviewOrder(_x7) {
    return _ref6.apply(this, arguments);
  };
}(); // Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
//scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.


exports.reviewOrder = reviewOrder;
//# sourceMappingURL=order.service.js.map