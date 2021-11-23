"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateStore = exports.loginStore = exports.getStores = exports.getStore = exports.getLoggedInStore = exports.getLabels = exports.createStore = exports.addLabel = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var storeService = _interopRequireWildcard(require("../services/store.service.js"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _auth = require("../middleware/auth.js");

var _expressValidator = require("express-validator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var getStores = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var stores;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(req.query.skip === undefined || req.query.limit === undefined)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", res.status(400).json({
              success: false,
              msg: "Filtering parameters are missing"
            }));

          case 2:
            _context.next = 4;
            return storeService.getStores(req.query);

          case 4:
            stores = _context.sent;
            stores && stores.length > 0 ? res.status(200).json({
              success: true,
              result: stores
            }) : res.status(404).json({
              success: false,
              msg: "No Store found"
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getStores(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.getStores = getStores;

var createStore = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var errors, error_msgs, store;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context2.next = 5;
              break;
            }

            error_msgs = [];
            errors.array().forEach(function (element) {
              error_msgs = [].concat((0, _toConsumableArray2["default"])(error_msgs), [element.msg]);
            });
            return _context2.abrupt("return", res.status(400).json({
              success: false,
              errors: error_msgs
            }));

          case 5:
            _context2.next = 7;
            return storeService.createStore(req.body);

          case 7:
            store = _context2.sent;

            if (store.err) {
              res.status(409).json({
                success: false,
                msg: store.err
              });
            } else {
              res.status(201).json({
                success: true,
                result: store
              });
            }

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function createStore(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

exports.createStore = createStore;

var loginStore = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var errors, store;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (!errors.isEmpty()) {
              res.status(400).json({
                success: false,
                errors: errors
              });
            }

            _context3.next = 4;
            return storeService.loginStore(req.body);

          case 4:
            store = _context3.sent;

            if (!store.err) {
              _context3.next = 10;
              break;
            }

            console.log(store.err.msg);
            return _context3.abrupt("return", res.status(403).json({
              success: false,
              msg: store.err
            }));

          case 10:
            res.status(200).json({
              success: true,
              result: store
            });

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function loginStore(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

exports.loginStore = loginStore;

var getLoggedInStore = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var store;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return storeService.getLoggedInStore(req.store.id);

          case 2:
            store = _context4.sent;

            if (store.err) {
              res.status(500).json({
                success: false,
                msg: store.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: store
              });
            }

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getLoggedInStore(_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}();

exports.getLoggedInStore = getLoggedInStore;

var updateStore = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var errors, storeID, store;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context5.next = 2;
              break;
            }

            return _context5.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            errors = (0, _expressValidator.validationResult)(req);

            if (!errors.isEmpty()) {
              res.status(400).json({
                success: false,
                errors: errors.array()["msg"]
              });
            }

            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this user"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context5.next = 9;
            return storeService.updateStore(storeID, req.body);

          case 9:
            store = _context5.sent;

            if (store.err) {
              res.status(500).json({
                success: false,
                msg: store.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: store
              });
            }

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function updateStore(_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}();

exports.updateStore = updateStore;

var addLabel = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var errors, storeID, store;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(req.admin === undefined && req.store === undefined)) {
              _context6.next = 2;
              break;
            }

            return _context6.abrupt("return", res.status(403).json({
              success: false,
              msg: "You're not permitted to carry out this action"
            }));

          case 2:
            errors = (0, _expressValidator.validationResult)(req);

            if (!errors.isEmpty()) {
              res.status(400).json({
                success: false,
                errors: errors.array()["msg"]
              });
            }

            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this user"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            _context6.next = 9;
            return storeService.addLabel(storeID, req.body);

          case 9:
            store = _context6.sent;
            console.log(req.body);

            if (store.err) {
              res.status(500).json({
                success: false,
                msg: store.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: store
              });
            }

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function addLabel(_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}();

exports.addLabel = addLabel;

var getLabels = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var errors, storeID, store;
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
            errors = (0, _expressValidator.validationResult)(req);

            if (!errors.isEmpty()) {
              res.status(400).json({
                success: false,
                errors: errors.array()["msg"]
              });
            }

            if (req.store === undefined && req.query.storeID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this user"
              });
            }

            if (req.store) storeID = req.store.id;
            if (req.query.storeID && req.admin) storeID = req.query.storeID;
            console.log(storeID);
            _context7.next = 10;
            return storeService.getLabels(storeID);

          case 10:
            store = _context7.sent;

            if (store.err) {
              res.status(500).json({
                success: false,
                msg: store.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: store
              });
            }

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function getLabels(_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}();

exports.getLabels = getLabels;

var getStore = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var storeDetails;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return storeService.getStore(req.params.storeId);

          case 2:
            storeDetails = _context8.sent;

            if (!storeDetails.err) {
              _context8.next = 7;
              break;
            }

            return _context8.abrupt("return", res.status(403).json({
              success: false,
              msg: storeDetails.err
            }));

          case 7:
            res.status(200).json({
              success: true,
              result: storeDetails
            });

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function getStore(_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}();

exports.getStore = getStore;
//# sourceMappingURL=store.controller.js.map