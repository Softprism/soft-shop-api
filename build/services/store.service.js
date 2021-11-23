"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateStore = exports.loginStore = exports.getStores = exports.getStore = exports.getLoggedInStore = exports.getLabels = exports.createStore = exports.addLabel = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _storeModel = _interopRequireDefault(require("../models/store.model.js"));

var getStores = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(urlParams) {
    var pipeline, storesWithRating, limit, skip, rating, matchParam, _long, lat, radian, stores;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // declare fields to exclude from response
            pipeline = [{
              $unset: ["products", "orderReview", "password", "email", "phone_number", "labels", "orders"]
            }];
            storesWithRating = []; // container to hold stores based on rating search
            // setting pagination params

            limit = Number(urlParams.limit);
            skip = Number(urlParams.skip); // validating rating param

            rating = Number(urlParams.rating); // initializing matchParam

            matchParam = {};

            if (urlParams.isOpen === "true" && urlParams.currentTime) {
              matchParam.closingTime = {
                $gte: urlParams.currentTime
              };
              matchParam.isActive = true;
            } // checking opened stores


            if (urlParams.isOpen === "false" && urlParams.currentTime) {
              matchParam.closingTime = {
                $lte: urlParams.currentTime
              };
              matchParam.isActive = false;
            } // checking closed stores


            if (urlParams.name) {
              matchParam.name = new RegExp(urlParams.name, "i");
            }

            if (urlParams.category) {
              urlParams.category = _mongoose["default"].Types.ObjectId(urlParams.category);
              matchParam.category = urlParams.category;
            }

            if (urlParams["long"] && urlParams.lat && urlParams.radius) {
              _long = parseFloat(urlParams["long"]);
              lat = parseFloat(urlParams.lat);
              radian = parseFloat(urlParams.radius / 3963.2);
            } // cleaning up the urlParams


            delete urlParams.limit;
            delete urlParams.skip;
            delete urlParams.rating;
            delete urlParams["long"];
            delete urlParams.lat; // aggregating stores

            stores = _storeModel["default"].aggregate() // matching store with geolocation
            .match({
              location: {
                $geoWithin: {
                  $centerSphere: [[_long, lat], radian]
                }
              }
            }) // matching stores with matchParam
            .match(matchParam) //looking up the product collection for each stores
            .lookup({
              from: "products",
              localField: "_id",
              foreignField: "store",
              as: "products"
            }) //looking up the order collection for each stores
            .lookup({
              from: "orders",
              localField: "_id",
              foreignField: "store",
              as: "orders"
            }) // looking up each product on the review collection
            .lookup({
              from: "reviews",
              localField: "orders._id",
              foreignField: "order",
              as: "orderReview"
            }) // adding metrics to the response
            .addFields({
              sumOfStars: {
                $sum: "$orderReview.star"
              },
              numOfReviews: {
                $size: "$orderReview"
              },
              averageRating: {
                $ceil: {
                  $avg: "$orderReview.star"
                }
              },
              productCount: {
                $size: "$products"
              },
              orderCount: {
                $size: "$orders"
              }
            }) // appending excludes
            .append(pipeline) // sorting and pagination
            .sort("-createdDate").limit(limit).skip(skip);

            if (!(rating >= 0)) {
              _context.next = 25;
              break;
            }

            _context.next = 21;
            return stores;

          case 21:
            _context.sent.forEach(function (store) {
              if (store.averageRating == rating) {
                storesWithRating.push(store);
              }
            });

            return _context.abrupt("return", storesWithRating);

          case 25:
            return _context.abrupt("return", stores);

          case 26:
            _context.next = 32;
            break;

          case 28:
            _context.prev = 28;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);
            return _context.abrupt("return", _context.t0);

          case 32:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 28]]);
  }));

  return function getStores(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getStores = getStores;

var getStore = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(storeId) {
    var pipeline, store;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // declare fields to exclude from response
            pipeline = [{
              $unset: ["products.store", "products.rating", "products.category", "products.customFee.items", "productReview", "password", "email", "phone_number", "orders", "orderReview", "products.variant"]
            }]; // aggregating stores

            _context2.next = 3;
            return _storeModel["default"].aggregate() // matching with requested store
            .match({
              _id: _mongoose["default"].Types.ObjectId(storeId)
            }) // looking up the store in the product collection
            .lookup({
              from: "products",
              localField: "_id",
              foreignField: "store",
              as: "products"
            }) // returning only active products
            .match({
              "products.status": "active"
            }) //looking up the order collection for each stores
            .lookup({
              from: "orders",
              localField: "_id",
              foreignField: "store",
              as: "orders"
            }) // looking up each product on the review collection
            .lookup({
              from: "reviews",
              localField: "orders._id",
              foreignField: "order",
              as: "orderReview"
            }) // adding metrics to the response
            .addFields({
              sumOfStars: {
                $sum: "$orderReview.star"
              },
              numOfReviews: {
                $size: "$orderReview"
              },
              averageRating: {
                $ceil: {
                  $avg: "$orderReview.star"
                }
              },
              productCount: {
                $size: "$products"
              },
              orderCount: {
                $size: "$orders"
              }
            }) // appending excludes
            .append(pipeline);

          case 3:
            store = _context2.sent;
            console.log(store);

            if (!(store.length < 1)) {
              _context2.next = 9;
              break;
            }

            _context2.next = 8;
            return _storeModel["default"].aggregate() // matching with requested store
            .match({
              _id: _mongoose["default"].Types.ObjectId(storeId)
            }) //looking up the order collection for each stores
            .lookup({
              from: "orders",
              localField: "_id",
              foreignField: "store",
              as: "orders"
            }) // looking up each product on the review collection
            .lookup({
              from: "reviews",
              localField: "orders._id",
              foreignField: "order",
              as: "orderReview"
            }) // adding metrics to the response
            .addFields({
              sumOfStars: {
                $sum: "$orderReview.star"
              },
              numOfReviews: {
                $size: "$orderReview"
              },
              averageRating: {
                $ceil: {
                  $avg: "$orderReview.star"
                }
              },
              orderCount: {
                $size: "$orders"
              }
            }).append(pipeline);

          case 8:
            store = _context2.sent;

          case 9:
            // make average rating zero if null
            if (store[0].averageRating === null) store[0].averageRating = 0;
            return _context2.abrupt("return", store[0]);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getStore(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.getStore = getStore;

var createStore = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(StoreParam) {
    var name, address, email, phone_number, password, openingTime, closingTime, location, store, newStore, salt, payload, token;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            name = StoreParam.name, address = StoreParam.address, email = StoreParam.email, phone_number = StoreParam.phone_number, password = StoreParam.password, openingTime = StoreParam.openingTime, closingTime = StoreParam.closingTime, location = StoreParam.location;
            _context3.next = 4;
            return _storeModel["default"].findOne({
              email: email
            });

          case 4:
            store = _context3.sent;

            if (!store) {
              _context3.next = 7;
              break;
            }

            throw {
              err: "A store with this email already exists"
            };

          case 7:
            if (!(!openingTime.includes(":") || !closingTime.includes(":"))) {
              _context3.next = 9;
              break;
            }

            throw {
              err: "Invalid time format"
            };

          case 9:
            newStore = new _storeModel["default"](StoreParam);
            _context3.next = 12;
            return _bcryptjs["default"].genSalt(10);

          case 12:
            salt = _context3.sent;
            _context3.next = 15;
            return _bcryptjs["default"].hash(password, salt);

          case 15:
            newStore.password = _context3.sent;
            _context3.next = 18;
            return newStore.save();

          case 18:
            payload = {
              store: {
                id: newStore.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            });

            if (token) {
              _context3.next = 22;
              break;
            }

            throw {
              err: "Missing Token"
            };

          case 22:
            return _context3.abrupt("return", token);

          case 25:
            _context3.prev = 25;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", _context3.t0);

          case 28:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 25]]);
  }));

  return function createStore(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.createStore = createStore;

var loginStore = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(StoreParam) {
    var email, password, store, storeRes, isMatch, payload, token;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            email = StoreParam.email, password = StoreParam.password;
            _context4.next = 4;
            return _storeModel["default"].findOne({
              email: email
            });

          case 4:
            store = _context4.sent;
            _context4.next = 7;
            return _storeModel["default"].findOne({
              email: email
            }).select("-password");

          case 7:
            storeRes = _context4.sent;

            if (store) {
              _context4.next = 10;
              break;
            }

            throw {
              err: "Invalid Credentials"
            };

          case 10:
            _context4.next = 12;
            return _bcryptjs["default"].compare(password, store.password);

          case 12:
            isMatch = _context4.sent;

            if (isMatch) {
              _context4.next = 15;
              break;
            }

            throw {
              err: "Invalid Credentials"
            };

          case 15:
            payload = {
              store: {
                id: storeRes.id
              }
            }; // Generate and return token to server

            token = _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, {
              expiresIn: 36000
            });
            return _context4.abrupt("return", token);

          case 20:
            _context4.prev = 20;
            _context4.t0 = _context4["catch"](0);
            console.log(_context4.t0);
            return _context4.abrupt("return", _context4.t0);

          case 24:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 20]]);
  }));

  return function loginStore(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.loginStore = loginStore;

var getLoggedInStore = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(userParam) {
    var store;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            console.log("running");
            _context5.prev = 1;
            _context5.next = 4;
            return _storeModel["default"].findById(userParam).select("-password");

          case 4:
            store = _context5.sent;
            return _context5.abrupt("return", store);

          case 8:
            _context5.prev = 8;
            _context5.t0 = _context5["catch"](1);
            return _context5.abrupt("return", _context5.t0);

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 8]]);
  }));

  return function getLoggedInStore(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.getLoggedInStore = getLoggedInStore;

var updateStore = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(storeID, updateParam) {
    var email, password, address, phone_number, images, openingTime, closingTime, category, labels, tax, storeUpdate, salt, store, storeRes;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            email = updateParam.email, password = updateParam.password, address = updateParam.address, phone_number = updateParam.phone_number, images = updateParam.images, openingTime = updateParam.openingTime, closingTime = updateParam.closingTime, category = updateParam.category, labels = updateParam.labels, tax = updateParam.tax;
            storeUpdate = {}; // Check for fields

            if (address) storeUpdate.address = address;
            if (images) storeUpdate.images = images;
            if (email) storeUpdate.email = email;

            if (!openingTime) {
              _context6.next = 11;
              break;
            }

            if (storeUpdate.openingTime.includes(":")) {
              _context6.next = 10;
              break;
            }

            delete storeUpdate.openingTime;
            throw {
              err: "Invalid time"
            };

          case 10:
            storeUpdate.openingTime = openingTime;

          case 11:
            if (!closingTime) {
              _context6.next = 16;
              break;
            }

            if (storeUpdate.closingTime.includes(":")) {
              _context6.next = 15;
              break;
            }

            delete storeUpdate.closingTime;
            throw {
              err: "Invalid time"
            };

          case 15:
            storeUpdate.closingTime = closingTime;

          case 16:
            if (phone_number) storeUpdate.email = phone_number;
            if (category) storeUpdate.category = category;
            if (labels) storeUpdate.labels = labels;

            if (!password) {
              _context6.next = 26;
              break;
            }

            _context6.next = 22;
            return _bcryptjs["default"].genSalt(10);

          case 22:
            salt = _context6.sent;
            _context6.next = 25;
            return _bcryptjs["default"].hash(password, salt);

          case 25:
            storeUpdate.password = _context6.sent;

          case 26:
            _context6.next = 28;
            return _storeModel["default"].findById(storeID);

          case 28:
            store = _context6.sent;

            if (store) {
              _context6.next = 31;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 31:
            console.log(storeID, storeUpdate);
            _context6.next = 34;
            return _storeModel["default"].findByIdAndUpdate(storeID, {
              $set: storeUpdate
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 34:
            store = _context6.sent;
            _context6.next = 37;
            return _storeModel["default"].findById(storeID).select("-password, -__v");

          case 37:
            storeRes = _context6.sent;
            return _context6.abrupt("return", storeRes);

          case 41:
            _context6.prev = 41;
            _context6.t0 = _context6["catch"](0);
            console.log(_context6.t0);
            return _context6.abrupt("return", _context6.t0);

          case 45:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 41]]);
  }));

  return function updateStore(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
}();

exports.updateStore = updateStore;

var addLabel = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(storeId, labelParam) {
    var store;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _storeModel["default"].findById(storeId);

          case 2:
            store = _context7.sent;

            if (store) {
              _context7.next = 5;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 5:
            store.labels.push(labelParam);
            _context7.next = 8;
            return store.save();

          case 8:
            _context7.next = 10;
            return _storeModel["default"].findById(storeId).select("-password, -__v");

          case 10:
            return _context7.abrupt("return", _context7.sent);

          case 11:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function addLabel(_x8, _x9) {
    return _ref7.apply(this, arguments);
  };
}();

exports.addLabel = addLabel;

var getLabels = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(storeId) {
    var store;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _storeModel["default"].findById(storeId);

          case 2:
            store = _context8.sent;

            if (store) {
              _context8.next = 5;
              break;
            }

            throw {
              err: "Store not found"
            };

          case 5:
            return _context8.abrupt("return", store.labels);

          case 6:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function getLabels(_x10) {
    return _ref8.apply(this, arguments);
  };
}();

exports.getLabels = getLabels;
//# sourceMappingURL=store.service.js.map