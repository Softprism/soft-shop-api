"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAdmin = exports.registerAdmin = exports.loginAdmin = exports.getLoggedInAdmin = exports.getAdmins = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = require("../middleware/auth.js");

var adminService = _interopRequireWildcard(require("../services/admin.service.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var router = _express["default"].Router();

var getAdmins = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var admins;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return adminService.getAdmins();

          case 2:
            admins = _context.sent;
            admins && admins.length > 0 ? res.status(200).json(admins) : res.status(404).json({
              msg: 'No Admin Users found'
            });

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getAdmins(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.getAdmins = getAdmins;

var registerAdmin = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var errors, token;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", res.status(400).json({
              success: false,
              msg: errors.array()
            }));

          case 3:
            _context2.next = 5;
            return adminService.registerAdmin(req.body);

          case 5:
            token = _context2.sent;

            if (token.err) {
              res.status(409).json({
                success: false,
                msg: token.err
              });
            } else {
              res.status(201).json({
                success: true,
                result: token
              });
            }

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function registerAdmin(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

exports.registerAdmin = registerAdmin;

var loginAdmin = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var errors, token;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", res.status(400).json({
              success: false,
              msg: errors.array()
            }));

          case 3:
            _context3.next = 5;
            return adminService.loginAdmin(req.body);

          case 5:
            token = _context3.sent;

            if (token.err) {
              res.status(403).json({
                success: false,
                msg: token.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: token
              });
            }

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function loginAdmin(_x6, _x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();

exports.loginAdmin = loginAdmin;

var getLoggedInAdmin = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var admin;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log(req.admin);
            _context4.next = 3;
            return adminService.getLoggedInAdmin(req.admin.id);

          case 3:
            admin = _context4.sent;

            if (admin.err) {
              res.status(500).json({
                success: false,
                msg: token.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: admin
              });
            }

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getLoggedInAdmin(_x9, _x10, _x11) {
    return _ref4.apply(this, arguments);
  };
}();

exports.getLoggedInAdmin = getLoggedInAdmin;

var updateAdmin = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var errors, admin;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", res.status(400).json({
              errors: errors.array()
            }));

          case 3:
            _context5.next = 5;
            return adminService.updateAdmin(req.body, req.admin.id);

          case 5:
            admin = _context5.sent;
            console.log(admin);

            if (admin.msg) {
              res.status(500).json({
                success: false,
                msg: admin.msg
              });
            } else {
              res.status(200).json({
                success: true,
                result: admin
              });
            }

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function updateAdmin(_x12, _x13, _x14) {
    return _ref5.apply(this, arguments);
  };
}();

exports.updateAdmin = updateAdmin;
//# sourceMappingURL=admin.controller.js.map