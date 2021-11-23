"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAdmin = exports.registerAdmin = exports.loginAdmin = exports.getLoggedInAdmin = exports.getAdmins = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _adminModel = _interopRequireDefault(require("../models/admin.model.js"));

var getAdmins = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var admins;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _adminModel["default"].find();

          case 3:
            admins = _context.sent;

            if (!(admins.length > 0)) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", admins);

          case 6:
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _context.t0);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  }));

  return function getAdmins() {
    return _ref.apply(this, arguments);
  };
}();

exports.getAdmins = getAdmins;

var registerAdmin = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(params) {
    var username, password, admin, salt, payload, token;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            username = params.username, password = params.password;
            _context2.prev = 1;
            _context2.next = 4;
            return _adminModel["default"].findOne({
              username: username
            });

          case 4:
            admin = _context2.sent;

            if (!admin) {
              _context2.next = 7;
              break;
            }

            throw {
              err: 'Admin account already exists'
            };

          case 7:
            // Create Admin Object
            admin = new _adminModel["default"]({
              username: username,
              password: password
            });
            _context2.next = 10;
            return _bcryptjs["default"].genSalt(10);

          case 10:
            salt = _context2.sent;
            _context2.next = 13;
            return _bcryptjs["default"].hash(password, salt);

          case 13:
            admin.password = _context2.sent;
            _context2.next = 16;
            return admin.save();

          case 16:
            // Define payload for token
            payload = {
              admin: {
                id: admin.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            });
            return _context2.abrupt("return", token);

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", _context2.t0);

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 21]]);
  }));

  return function registerAdmin(_x) {
    return _ref2.apply(this, arguments);
  };
}();

exports.registerAdmin = registerAdmin;

var loginAdmin = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(loginParam) {
    var username, password, admin, isMatch, payload, token;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            username = loginParam.username, password = loginParam.password;
            _context3.prev = 1;
            _context3.next = 4;
            return _adminModel["default"].findOne({
              username: username
            });

          case 4:
            admin = _context3.sent;

            if (admin) {
              _context3.next = 7;
              break;
            }

            throw {
              err: 'Admin not found'
            };

          case 7:
            _context3.next = 9;
            return _bcryptjs["default"].compare(password, admin.password);

          case 9:
            isMatch = _context3.sent;

            if (isMatch) {
              _context3.next = 12;
              break;
            }

            throw {
              err: 'Wrong password'
            };

          case 12:
            // Define payload for token
            payload = {
              admin: {
                id: admin.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            });

            if (token) {
              _context3.next = 16;
              break;
            }

            throw {
              err: 'Missing Token'
            };

          case 16:
            return _context3.abrupt("return", token);

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](1);
            console.log(_context3.t0);
            return _context3.abrupt("return", _context3.t0);

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 19]]);
  }));

  return function loginAdmin(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

exports.loginAdmin = loginAdmin;

var getLoggedInAdmin = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(adminParam) {
    var admin;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _adminModel["default"].findById(adminParam).select('-password');

          case 3:
            admin = _context4.sent;
            return _context4.abrupt("return", admin);

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", _context4.t0);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 7]]);
  }));

  return function getLoggedInAdmin(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

exports.getLoggedInAdmin = getLoggedInAdmin;

var updateAdmin = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(updateParam, id) {
    var username, password, adminFields, salt, admin;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            username = updateParam.username, password = updateParam.password; // Build Admin Object

            adminFields = {}; // Check for fields

            if (username) adminFields.username = username;

            if (!password) {
              _context5.next = 10;
              break;
            }

            _context5.next = 6;
            return _bcryptjs["default"].genSalt(10);

          case 6:
            salt = _context5.sent;
            _context5.next = 9;
            return _bcryptjs["default"].hash(password, salt);

          case 9:
            adminFields.password = _context5.sent;

          case 10:
            _context5.prev = 10;
            _context5.next = 13;
            return _adminModel["default"].findById(id);

          case 13:
            admin = _context5.sent;

            if (admin) {
              _context5.next = 16;
              break;
            }

            throw {
              msg: 'Admin not found'
            };

          case 16:
            _context5.next = 18;
            return _adminModel["default"].findByIdAndUpdate(id, {
              $set: adminFields
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 18:
            admin = _context5.sent;
            return _context5.abrupt("return", admin);

          case 22:
            _context5.prev = 22;
            _context5.t0 = _context5["catch"](10);
            return _context5.abrupt("return", _context5.t0);

          case 25:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[10, 22]]);
  }));

  return function updateAdmin(_x4, _x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.updateAdmin = updateAdmin;
//# sourceMappingURL=admin.service.js.map