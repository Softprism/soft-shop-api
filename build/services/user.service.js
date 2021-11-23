"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyEmailAddress = exports.validateToken = exports.updateUser = exports.registerUser = exports.loginUser = exports.getUsers = exports.getUserBasketItems = exports.getLoggedInUser = exports.forgotPassword = exports.editBasketItems = exports.deleteBasketItem = exports.deleteAllBasketItems = exports.createNewPassword = exports.addItemToBasket = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _userModel = _interopRequireDefault(require("../models/user.model.js"));

var _productModel = _interopRequireDefault(require("../models/product.model.js"));

var _tokensModel = _interopRequireDefault(require("../models/tokens.model.js"));

var _userCartModel = _interopRequireDefault(require("../models/user-cart.model.js"));

var _sendMail = require("../utils/sendMail.js");

var _sendOTP = require("../utils/sendOTP.js");

// Get all Users
var getUsers = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(urlParams) {
    var limit, skip, users;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            limit = Number(urlParams.limit);
            skip = Number(urlParams.skip);
            delete urlParams.limit;
            delete urlParams.skip;
            delete urlParams.cart;
            _context.next = 8;
            return _userModel["default"].find(urlParams).select("-password").sort({
              createdDate: -1
            }) // -1 for descending sort
            .populate({
              path: "cart.product_id",
              select: "product_name price availability"
            }).populate({
              path: "orders",
              select: "orderId status"
            }).limit(limit).skip(skip);

          case 8:
            users = _context.sent;
            return _context.abrupt("return", users);

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _context.t0);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 12]]);
  }));

  return function getUsers(_x) {
    return _ref.apply(this, arguments);
  };
}(); // send otp to Verify user email before sign up


exports.getUsers = getUsers;

var verifyEmailAddress = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref2) {
    var email, user, token, email_subject, email_message;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            email = _ref2.email;
            _context2.prev = 1;
            _context2.next = 4;
            return _userModel["default"].findOne({
              email: email
            });

          case 4:
            user = _context2.sent;

            if (!user) {
              _context2.next = 7;
              break;
            }

            throw {
              err: "User with this email already exists"
            };

          case 7:
            _context2.next = 9;
            return (0, _sendOTP.getOTP)("user-signup", email);

          case 9:
            token = _context2.sent;
            // send otp
            email_subject = "OTP For Account Creation";
            email_message = token.otp;
            _context2.next = 14;
            return (0, _sendMail.sendEmail)(email, email_subject, email_message);

          case 14:
            return _context2.abrupt("return", token);

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", _context2.t0);

          case 20:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 17]]);
  }));

  return function verifyEmailAddress(_x2) {
    return _ref3.apply(this, arguments);
  };
}(); // Register User


exports.verifyEmailAddress = verifyEmailAddress;

var registerUser = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(userParam) {
    var first_name, last_name, email, phone_number, password, user, salt, signupToken, newUser, payload, token;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            first_name = userParam.first_name, last_name = userParam.last_name, email = userParam.email, phone_number = userParam.phone_number, password = userParam.password;
            _context3.next = 4;
            return _userModel["default"].findOne({
              email: email
            });

          case 4:
            user = _context3.sent;

            if (!user) {
              _context3.next = 7;
              break;
            }

            throw {
              err: "User with this email already exists"
            };

          case 7:
            // Create User Object
            user = new _userModel["default"]({
              first_name: first_name,
              last_name: last_name,
              email: email,
              phone_number: phone_number,
              password: password
            });
            _context3.next = 10;
            return _bcryptjs["default"].genSalt(10);

          case 10:
            salt = _context3.sent;
            _context3.next = 13;
            return _bcryptjs["default"].hash(password, salt);

          case 13:
            user.password = _context3.sent;
            _context3.next = 16;
            return _tokensModel["default"].findById(userParam.token);

          case 16:
            signupToken = _context3.sent;

            if (signupToken) {
              user.isVerified = true;
            } // Save user to db


            _context3.next = 20;
            return user.save();

          case 20:
            newUser = _context3.sent;

            if (!newUser._id) {
              _context3.next = 24;
              break;
            }

            _context3.next = 24;
            return _tokensModel["default"].findByIdAndDelete(userParam.token);

          case 24:
            // delete user on creation, uncomment to test registration without populating your database
            // await User.findByIdAndDelete(newUser._id);
            // Define payload for token
            payload = {
              user: {
                id: user.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            }); // unset user pass****d

            user.password = undefined; // set user token

            user.set("token", token, {
              strict: false
            });
            return _context3.abrupt("return", user);

          case 31:
            _context3.prev = 31;
            _context3.t0 = _context3["catch"](0);
            console.log(_context3.t0);
            return _context3.abrupt("return", _context3.t0);

          case 35:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 31]]);
  }));

  return function registerUser(_x3) {
    return _ref4.apply(this, arguments);
  };
}(); // Login User


exports.registerUser = registerUser;

var loginUser = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(loginParam) {
    var email, password, user, isMatch, payload, token, pipeline, userDetails;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            email = loginParam.email, password = loginParam.password;
            _context4.prev = 1;
            _context4.next = 4;
            return _userModel["default"].findOne({
              email: email
            });

          case 4:
            user = _context4.sent;

            if (user) {
              _context4.next = 7;
              break;
            }

            throw {
              err: "User not found"
            };

          case 7:
            _context4.next = 9;
            return _bcryptjs["default"].compare(password, user.password);

          case 9:
            isMatch = _context4.sent;

            if (isMatch) {
              _context4.next = 12;
              break;
            }

            throw {
              err: "Wrong password"
            };

          case 12:
            // unset user pass***d
            user.password = undefined; // Define payload for token

            payload = {
              user: {
                id: user.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            });

            if (token) {
              _context4.next = 17;
              break;
            }

            throw {
              err: "Missing Token"
            };

          case 17:
            pipeline = [{
              $unset: ["userReviews", "userOrders", "cart", "password", "orders"]
            }];
            userDetails = _userModel["default"].aggregate().match({
              _id: _mongoose["default"].Types.ObjectId(user._id)
            }).lookup({
              from: "reviews",
              localField: "_id",
              foreignField: "user",
              as: "userReviews"
            }).lookup({
              from: "orders",
              localField: "_id",
              foreignField: "user",
              as: "userOrders"
            }).addFields({
              totalReviews: {
                $size: "$userReviews"
              },
              totalOrders: {
                $size: "$userOrders"
              },
              token: token
            }).append(pipeline);
            return _context4.abrupt("return", userDetails);

          case 22:
            _context4.prev = 22;
            _context4.t0 = _context4["catch"](1);
            return _context4.abrupt("return", _context4.t0);

          case 25:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 22]]);
  }));

  return function loginUser(_x4) {
    return _ref5.apply(this, arguments);
  };
}(); // Get Logged in User info


exports.loginUser = loginUser;

var getLoggedInUser = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(userParam) {
    var pipeline, user;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            pipeline = [{
              $unset: ["userReviews", "userOrders", "cart", "password", "orders"]
            }];
            user = _userModel["default"].aggregate().match({
              _id: _mongoose["default"].Types.ObjectId(userParam)
            }).lookup({
              from: "reviews",
              localField: "_id",
              foreignField: "user",
              as: "userReviews"
            }).lookup({
              from: "orders",
              localField: "_id",
              foreignField: "user",
              as: "userOrders"
            }).addFields({
              totalReviews: {
                $size: "$userReviews"
              },
              totalOrders: {
                $size: "$userOrders"
              }
            }).append(pipeline);
            return _context5.abrupt("return", user);

          case 6:
            _context5.prev = 6;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return", _context5.t0);

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 6]]);
  }));

  return function getLoggedInUser(_x5) {
    return _ref6.apply(this, arguments);
  };
}(); // Update User Details


exports.getLoggedInUser = getLoggedInUser;

var updateUser = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(updateParam, id) {
    var address, password, email, phone_number, userFields, salt, user;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            address = updateParam.address, password = updateParam.password, email = updateParam.email, phone_number = updateParam.phone_number; // Build User Object

            userFields = {}; // Check for fields

            if (address) userFields.address = address;
            if (email) userFields.email = email;
            if (phone_number) userFields.phone_number = phone_number;

            if (!password) {
              _context6.next = 12;
              break;
            }

            _context6.next = 8;
            return _bcryptjs["default"].genSalt(10);

          case 8:
            salt = _context6.sent;
            _context6.next = 11;
            return _bcryptjs["default"].hash(password, salt);

          case 11:
            userFields.password = _context6.sent;

          case 12:
            _context6.prev = 12;
            _context6.next = 15;
            return _userModel["default"].findById(id);

          case 15:
            user = _context6.sent;

            if (user) {
              _context6.next = 18;
              break;
            }

            throw {
              err: "User not found"
            };

          case 18:
            _context6.next = 20;
            return _userModel["default"].findByIdAndUpdate(id, {
              $set: userFields
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 20:
            user = _context6.sent;
            user.cart = undefined;
            user.password = undefined;
            user.orders = undefined;
            return _context6.abrupt("return", user);

          case 27:
            _context6.prev = 27;
            _context6.t0 = _context6["catch"](12);
            return _context6.abrupt("return", _context6.t0);

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[12, 27]]);
  }));

  return function updateUser(_x6, _x7) {
    return _ref7.apply(this, arguments);
  };
}(); // const createUserBasket = async (userId, basketMeta) => { DEPRECATED
//   // baskets should be initialized for users
//   // basket is created per store
//   // add user ID to basketMeta
//   basketMeta.user = userId;
//   try {
//     // first verify if user already has a basket for the store
//     let existingBasket = await Basket.findOne(basketMeta);
//     if (existingBasket) throw { err: "user has a basket for this store!" };
//     // create basket if none exists
//     let newBasket = new Basket(basketMeta);
//     newBasket.save();
//     return newBasket;
//   } catch (err) {
//     return err;
//   }
// };


exports.updateUser = updateUser;

var addItemToBasket = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(userId, basketItemMeta) {
    var newBasketItem;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            // add user ID to basketMeta
            basketItemMeta.user = userId; // add item to basket

            newBasketItem = new _userCartModel["default"](basketItemMeta);
            _context7.next = 4;
            return newBasketItem.save();

          case 4:
            _context7.next = 6;
            return getUserBasketItems(userId);

          case 6:
            return _context7.abrupt("return", _context7.sent);

          case 7:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function addItemToBasket(_x8, _x9) {
    return _ref8.apply(this, arguments);
  };
}();

exports.addItemToBasket = addItemToBasket;

var getUserBasketItems = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(userId) {
    var totalProductPriceInBasket, userBasket;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _userCartModel["default"].aggregate().match({
              user: _mongoose["default"].Types.ObjectId(userId)
            }).group({
              _id: "$user",
              total: {
                $sum: "$product.price"
              }
            });

          case 2:
            totalProductPriceInBasket = _context8.sent;
            _context8.next = 5;
            return _userCartModel["default"].aggregate().match({
              user: _mongoose["default"].Types.ObjectId(userId)
            });

          case 5:
            userBasket = _context8.sent;
            return _context8.abrupt("return", {
              userBasket: userBasket,
              total: totalProductPriceInBasket[0].total,
              count: userBasket.length
            });

          case 7:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function getUserBasketItems(_x10) {
    return _ref9.apply(this, arguments);
  };
}();

exports.getUserBasketItems = getUserBasketItems;

var editBasketItems = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(userId, basketMeta) {
    var userBasket, updateBasket;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return _userCartModel["default"].findById(basketMeta.basketId);

          case 3:
            userBasket = _context9.sent;

            if (userBasket) {
              _context9.next = 6;
              break;
            }

            throw {
              err: "basket not found"
            };

          case 6:
            _context9.next = 8;
            return _userCartModel["default"].findByIdAndUpdate(basketMeta.basketId, {
              $set: basketMeta
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 8:
            updateBasket = _context9.sent;
            _context9.next = 11;
            return getUserBasketItems(userId);

          case 11:
            return _context9.abrupt("return", _context9.sent);

          case 14:
            _context9.prev = 14;
            _context9.t0 = _context9["catch"](0);
            return _context9.abrupt("return", _context9.t0);

          case 17:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 14]]);
  }));

  return function editBasketItems(_x11, _x12) {
    return _ref10.apply(this, arguments);
  };
}();

exports.editBasketItems = editBasketItems;

var deleteBasketItem = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(userId, _ref11) {
    var basketId, userBasket;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            basketId = _ref11.basketId;
            _context10.prev = 1;
            _context10.next = 4;
            return _userCartModel["default"].findById(basketId);

          case 4:
            userBasket = _context10.sent;

            if (userBasket) {
              _context10.next = 7;
              break;
            }

            throw {
              err: "basket not found"
            };

          case 7:
            _context10.next = 9;
            return _userCartModel["default"].findByIdAndDelete(basketId);

          case 9:
            _context10.next = 11;
            return getUserBasketItems(userId);

          case 11:
            return _context10.abrupt("return", _context10.sent);

          case 14:
            _context10.prev = 14;
            _context10.t0 = _context10["catch"](1);
            return _context10.abrupt("return", _context10.t0);

          case 17:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[1, 14]]);
  }));

  return function deleteBasketItem(_x13, _x14) {
    return _ref12.apply(this, arguments);
  };
}();

exports.deleteBasketItem = deleteBasketItem;

var deleteAllBasketItems = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(userId) {
    var userBasket;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _context11.next = 3;
            return _userCartModel["default"].find({
              user: userId
            });

          case 3:
            userBasket = _context11.sent;

            if (userBasket) {
              _context11.next = 6;
              break;
            }

            throw {
              err: "user basket not found"
            };

          case 6:
            _context11.next = 8;
            return _userCartModel["default"].deleteMany({
              user: userId
            });

          case 8:
            _context11.next = 10;
            return getUserBasketItems(userId);

          case 10:
            return _context11.abrupt("return", _context11.sent);

          case 13:
            _context11.prev = 13;
            _context11.t0 = _context11["catch"](0);
            return _context11.abrupt("return", _context11.t0);

          case 16:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[0, 13]]);
  }));

  return function deleteAllBasketItems(_x15) {
    return _ref13.apply(this, arguments);
  };
}();

exports.deleteAllBasketItems = deleteAllBasketItems;

var forgotPassword = /*#__PURE__*/function () {
  var _ref15 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(_ref14) {
    var email, findUser, token, email_subject, email_message;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            email = _ref14.email;
            _context12.prev = 1;
            _context12.next = 4;
            return _userModel["default"].findOne({
              email: email
            });

          case 4:
            findUser = _context12.sent;

            if (findUser) {
              _context12.next = 7;
              break;
            }

            throw {
              err: "email is not registered"
            };

          case 7:
            _context12.next = 9;
            return (0, _sendOTP.getOTP)("user-forgot-password", email);

          case 9:
            token = _context12.sent;
            // send otp
            email_subject = "forgot password";
            email_message = token.otp;
            _context12.next = 14;
            return (0, _sendMail.sendEmail)(email, email_subject, email_message);

          case 14:
            return _context12.abrupt("return", token);

          case 17:
            _context12.prev = 17;
            _context12.t0 = _context12["catch"](1);
            return _context12.abrupt("return", _context12.t0);

          case 20:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[1, 17]]);
  }));

  return function forgotPassword(_x16) {
    return _ref15.apply(this, arguments);
  };
}();

exports.forgotPassword = forgotPassword;

var validateToken = /*#__PURE__*/function () {
  var _ref17 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(_ref16) {
    var type, otp, email, userToken;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            type = _ref16.type, otp = _ref16.otp, email = _ref16.email;
            _context13.prev = 1;
            _context13.next = 4;
            return _tokensModel["default"].findOne({
              otp: otp,
              email: email,
              type: type
            });

          case 4:
            userToken = _context13.sent;

            if (userToken) {
              _context13.next = 7;
              break;
            }

            throw {
              err: "invalid token"
            };

          case 7:
            return _context13.abrupt("return", userToken);

          case 10:
            _context13.prev = 10;
            _context13.t0 = _context13["catch"](1);
            return _context13.abrupt("return", _context13.t0);

          case 13:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[1, 10]]);
  }));

  return function validateToken(_x17) {
    return _ref17.apply(this, arguments);
  };
}();

exports.validateToken = validateToken;

var createNewPassword = /*#__PURE__*/function () {
  var _ref19 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(_ref18) {
    var token, email, password, requestToken, salt, user, email_subject, email_message;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            token = _ref18.token, email = _ref18.email, password = _ref18.password;
            _context14.prev = 1;
            _context14.next = 4;
            return _tokensModel["default"].findById(token);

          case 4:
            requestToken = _context14.sent;

            if (requestToken) {
              _context14.next = 7;
              break;
            }

            throw {
              err: "invalid token"
            };

          case 7:
            _context14.next = 9;
            return _bcryptjs["default"].genSalt(10);

          case 9:
            salt = _context14.sent;
            _context14.next = 12;
            return _bcryptjs["default"].hash(password, salt);

          case 12:
            password = _context14.sent;
            _context14.next = 15;
            return _userModel["default"].findOneAndUpdate({
              email: email
            }, {
              $set: {
                password: password
              }
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 15:
            user = _context14.sent;
            _context14.next = 18;
            return _tokensModel["default"].findByIdAndDelete(token);

          case 18:
            // Unsetting unneeded fields
            user.cart = undefined;
            user.password = undefined;
            user.orders = undefined; //send confirmation email

            email_subject = "Password Reset Successful";
            email_message = "Password has been reset successfully";
            _context14.next = 25;
            return (0, _sendMail.sendEmail)(email, email_subject, email_message);

          case 25:
            return _context14.abrupt("return", user);

          case 28:
            _context14.prev = 28;
            _context14.t0 = _context14["catch"](1);
            return _context14.abrupt("return", _context14.t0);

          case 31:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, null, [[1, 28]]);
  }));

  return function createNewPassword(_x18) {
    return _ref19.apply(this, arguments);
  };
}();

exports.createNewPassword = createNewPassword;
//# sourceMappingURL=user.service.js.map