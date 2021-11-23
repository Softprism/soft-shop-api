"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleFavorite = exports.reviewOrder = exports.getOrders = exports.getOrderDetails = exports.editOrder = exports.createOrder = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var orderService = _interopRequireWildcard(require("../services/order.service.js"));

var _expressValidator = require("express-validator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//======================================================================
var getOrders = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var allOrders;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (req.query.skip === undefined || req.query.limit === undefined) {
              res.status(400).json({
                success: false,
                msg: "filtering parameters are missing"
              });
            }

            _context.next = 3;
            return orderService.getOrders(req.query);

          case 3:
            allOrders = _context.sent;

            if (allOrders.err) {
              res.status(500).json({
                success: false,
                msg: allOrders.err
              });
            }

            allOrders && allOrders.length > 0 ? res.status(200).json({
              success: true,
              result: allOrders
            }) : res.status(404).json({
              success: false,
              msg: "No order found"
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getOrders(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}(); //======================================================================


exports.getOrders = getOrders;

var createOrder = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var newOrder;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (req.user) req.body.user = req.user.id;
            _context2.next = 3;
            return orderService.createOrder(req.body);

          case 3:
            newOrder = _context2.sent;
            newOrder.err ? res.status(500).json({
              success: false,
              msg: newOrder.err
            }) : res.status(201).json({
              success: true,
              result: newOrder
            });

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function createOrder(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}(); //======================================================================


exports.createOrder = createOrder;

var toggleFavorite = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var favoriteOrder;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return orderService.toggleFavorite(req.params.orderID);

          case 2:
            favoriteOrder = _context3.sent;
            favoriteOrder.err ? res.status(500).json({
              success: false,
              msg: favoriteOrder.err
            }) : res.status(200).json({
              success: true,
              result: favoriteOrder.msg
            });

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function toggleFavorite(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

exports.toggleFavorite = toggleFavorite;

var getOrderDetails = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var orderDetails;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return orderService.getOrderDetails(req.params.orderID);

          case 2:
            orderDetails = _context4.sent;
            orderDetails.err ? res.status(500).json({
              success: false,
              msg: orderDetails.err
            }) : res.status(200).json({
              success: true,
              result: orderDetails
            });

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getOrderDetails(_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}(); //======================================================================


exports.getOrderDetails = getOrderDetails;

var editOrder = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var updatedOrder;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return orderService.editOrder(req.params.orderID, req.body);

          case 2:
            updatedOrder = _context5.sent;
            updatedOrder.err ? res.status(500).json({
              success: false,
              msg: updatedOrder.err
            }) : res.status(200).json({
              success: true,
              result: updatedOrder
            });

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function editOrder(_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}(); //======================================================================


exports.editOrder = editOrder;

var reviewOrder = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var newReview;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!req.store) {
              _context6.next = 2;
              break;
            }

            return _context6.abrupt("return", res.status(400).json({
              success: false,
              msg: "action not allowed by store"
            }));

          case 2:
            _context6.next = 4;
            return orderService.reviewOrder(req.body);

          case 4:
            newReview = _context6.sent;

            if (!newReview.err) {
              _context6.next = 7;
              break;
            }

            return _context6.abrupt("return", res.status(400).json({
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
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function reviewOrder(_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}();

exports.reviewOrder = reviewOrder;
//# sourceMappingURL=order.controller.js.map