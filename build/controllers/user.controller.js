"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyEmailAddress = exports.validateToken = exports.updateUser = exports.registerUser = exports.loginUser = exports.getUsers = exports.getUserBasketItems = exports.getLoggedInUser = exports.forgotPassword = exports.editBasketItems = exports.deleteBasketItem = exports.deleteAllBasketItems = exports.createNewPassword = exports.addItemToBasket = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _auth = require("../middleware/auth.js");

var userService = _interopRequireWildcard(require("../services/user.service.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var router = _express["default"].Router();

var getUsers = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var users;
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
              msg: "filtering parameters are missing"
            }));

          case 2:
            _context.next = 4;
            return userService.getUsers(req.query);

          case 4:
            users = _context.sent;
            users && users.length > 0 ? res.status(200).json(users) : res.status(404).json({
              success: false,
              msg: "No Users found"
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getUsers(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.getUsers = getUsers;

var verifyEmailAddress = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var action;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return userService.verifyEmailAddress(req.body);

          case 2:
            action = _context2.sent;

            if (!action.err) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", res.status(403).json({
              success: false,
              msg: action.err
            }));

          case 5:
            return _context2.abrupt("return", res.status(202).json({
              success: true,
              result: action
            }));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function verifyEmailAddress(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.verifyEmailAddress = verifyEmailAddress;

var registerUser = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var errors, result;
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
            return userService.registerUser(req.body);

          case 5:
            result = _context3.sent;

            if (!result.err) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", res.status(409).json({
              success: false,
              msg: result.err
            }));

          case 8:
            return _context3.abrupt("return", res.status(201).json({
              success: true,
              result: result
            }));

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function registerUser(_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

exports.registerUser = registerUser;

var loginUser = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var errors, token;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", res.status(400).json({
              success: false,
              msg: errors
            }));

          case 3:
            _context4.next = 5;
            return userService.loginUser(req.body);

          case 5:
            token = _context4.sent;
            console.log(token);

            if (!token.err) {
              _context4.next = 9;
              break;
            }

            return _context4.abrupt("return", res.status(403).json({
              success: false,
              msg: token.err
            }));

          case 9:
            res.status(200).json({
              success: true,
              result: token[0]
            });

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function loginUser(_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

exports.loginUser = loginUser;

var getLoggedInUser = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var user;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return userService.getLoggedInUser(req.user.id);

          case 2:
            user = _context5.sent;
            console.log(user);

            if (user.err) {
              res.status(400).json({
                success: false,
                msg: user.err
              });
            }

            res.status(200).json({
              success: true,
              result: user[0]
            });

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function getLoggedInUser(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();

exports.getLoggedInUser = getLoggedInUser;

var updateUser = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var errors, userID, user;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context6.next = 3;
              break;
            }

            return _context6.abrupt("return", res.status(400).json({
              errors: errors.array()
            }));

          case 3:
            if (req.user === undefined && req.query.userID === undefined) {
              res.status(400).json({
                success: false,
                msg: "unable to authenticate this user"
              });
            }

            if (req.user) userID = req.user.id;
            if (req.query.userID && req.admin) userID = req.query.userID;
            _context6.next = 8;
            return userService.updateUser(req.body, userID);

          case 8:
            user = _context6.sent;

            if (!user.err) {
              _context6.next = 11;
              break;
            }

            return _context6.abrupt("return", res.status(500).json({
              success: false,
              msg: user.err
            }));

          case 11:
            res.status(200).json({
              success: true,
              user: user
            });

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function updateUser(_x14, _x15) {
    return _ref6.apply(this, arguments);
  };
}(); // const createUserBasket = async (req, res) => { deprecated
//   if (!req.body.store) {
//     return res
//       .status(400)
//       .json({ success: false, msg: "basket details required" });
//   }
//   const action = await userService.createUserBasket(req.user.id, req.body);
//   if (action.err) {
//     return res.status(403).json({ success: false, msg: action.err });
//   }
//   res.status(200).json({ success: true, result: action });
// };


exports.updateUser = updateUser;

var addItemToBasket = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var action;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return userService.addItemToBasket(req.user.id, req.body);

          case 3:
            action = _context7.sent;

            if (action) {
              _context7.next = 6;
              break;
            }

            return _context7.abrupt("return", res.status(400).json({
              success: false,
              msg: "error adding item to basket"
            }));

          case 6:
            res.status(200).json({
              success: true,
              result: action
            });
            _context7.next = 12;
            break;

          case 9:
            _context7.prev = 9;
            _context7.t0 = _context7["catch"](0);
            next(_context7.t0);

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 9]]);
  }));

  return function addItemToBasket(_x16, _x17, _x18) {
    return _ref7.apply(this, arguments);
  };
}();

exports.addItemToBasket = addItemToBasket;

var getUserBasketItems = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var action;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return userService.getUserBasketItems(req.user.id);

          case 3:
            action = _context8.sent;

            if (action) {
              _context8.next = 6;
              break;
            }

            return _context8.abrupt("return", res.status(400).json({
              success: false,
              msg: "error adding item to basket"
            }));

          case 6:
            res.status(200).json({
              success: true,
              result: action
            });
            _context8.next = 12;
            break;

          case 9:
            _context8.prev = 9;
            _context8.t0 = _context8["catch"](0);
            next(_context8.t0);

          case 12:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 9]]);
  }));

  return function getUserBasketItems(_x19, _x20, _x21) {
    return _ref8.apply(this, arguments);
  };
}();

exports.getUserBasketItems = getUserBasketItems;

var editBasketItems = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var action;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return userService.editBasketItems(req.user.id, req.body);

          case 3:
            action = _context9.sent;

            if (!action.err) {
              _context9.next = 6;
              break;
            }

            return _context9.abrupt("return", res.status(400).json({
              success: false,
              msg: action.err
            }));

          case 6:
            res.status(200).json({
              success: true,
              result: action
            });
            _context9.next = 12;
            break;

          case 9:
            _context9.prev = 9;
            _context9.t0 = _context9["catch"](0);
            next(_context9.t0);

          case 12:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 9]]);
  }));

  return function editBasketItems(_x22, _x23, _x24) {
    return _ref9.apply(this, arguments);
  };
}();

exports.editBasketItems = editBasketItems;

var deleteBasketItem = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var action;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _context10.next = 3;
            return userService.deleteBasketItem(req.user.id, req.body);

          case 3:
            action = _context10.sent;

            if (!action.err) {
              _context10.next = 6;
              break;
            }

            return _context10.abrupt("return", res.status(400).json({
              success: false,
              msg: action.err
            }));

          case 6:
            res.status(200).json({
              success: true,
              result: action
            });
            _context10.next = 12;
            break;

          case 9:
            _context10.prev = 9;
            _context10.t0 = _context10["catch"](0);
            next(_context10.t0);

          case 12:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 9]]);
  }));

  return function deleteBasketItem(_x25, _x26, _x27) {
    return _ref10.apply(this, arguments);
  };
}();

exports.deleteBasketItem = deleteBasketItem;

var deleteAllBasketItems = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var action;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            console.log(13456);
            _context11.prev = 1;
            _context11.next = 4;
            return userService.deleteAllBasketItems(req.user.id);

          case 4:
            action = _context11.sent;

            if (!action.err) {
              _context11.next = 7;
              break;
            }

            return _context11.abrupt("return", res.status(400).json({
              success: false,
              msg: action.err
            }));

          case 7:
            res.status(200).json({
              success: true,
              result: action
            });
            _context11.next = 13;
            break;

          case 10:
            _context11.prev = 10;
            _context11.t0 = _context11["catch"](1);
            next(_context11.t0);

          case 13:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[1, 10]]);
  }));

  return function deleteAllBasketItems(_x28, _x29, _x30) {
    return _ref11.apply(this, arguments);
  };
}();

exports.deleteAllBasketItems = deleteAllBasketItems;

var forgotPassword = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res) {
    var action;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return userService.forgotPassword(req.body);

          case 2:
            action = _context12.sent;

            if (!action.err) {
              _context12.next = 5;
              break;
            }

            return _context12.abrupt("return", res.status(404).json({
              success: false,
              msg: action.err
            }));

          case 5:
            return _context12.abrupt("return", res.status(200).json({
              success: true,
              result: action
            }));

          case 6:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function forgotPassword(_x31, _x32) {
    return _ref12.apply(this, arguments);
  };
}();

exports.forgotPassword = forgotPassword;

var validateToken = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(req, res) {
    var action;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return userService.validateToken(req.query);

          case 2:
            action = _context13.sent;

            if (!action.err) {
              _context13.next = 5;
              break;
            }

            return _context13.abrupt("return", res.status(403).json({
              success: false,
              msg: action.err
            }));

          case 5:
            return _context13.abrupt("return", res.status(200).json({
              success: true,
              result: action
            }));

          case 6:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function validateToken(_x33, _x34) {
    return _ref13.apply(this, arguments);
  };
}();

exports.validateToken = validateToken;

var createNewPassword = /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(req, res) {
    var action;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return userService.createNewPassword(req.body);

          case 2:
            action = _context14.sent;

            if (!action.err) {
              _context14.next = 5;
              break;
            }

            return _context14.abrupt("return", res.status(403).json({
              success: false,
              msg: action.err
            }));

          case 5:
            return _context14.abrupt("return", res.status(200).json({
              success: true,
              result: action
            }));

          case 6:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function createNewPassword(_x35, _x36) {
    return _ref14.apply(this, arguments);
  };
}();

exports.createNewPassword = createNewPassword;
//# sourceMappingURL=user.controller.js.map