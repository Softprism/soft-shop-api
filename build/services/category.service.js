"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCategories = exports.editCategory = exports.deleteCategory = exports.createCategory = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _categoryModel = _interopRequireDefault(require("../models/category.model.js"));

//  Get all Categories
var getCategories = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(urlParams) {
    var limit, skip, pipeline;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            limit = Number(urlParams.limit);
            skip = Number(urlParams.skip);
            pipeline = [{
              $unset: ['products', 'stores']
            }];
            return _context.abrupt("return", _categoryModel["default"].aggregate().lookup({
              from: 'products',
              localField: '_id',
              foreignField: 'category',
              as: 'products'
            }).lookup({
              from: 'stores',
              localField: '_id',
              foreignField: 'category',
              as: 'stores'
            }).addFields({
              productCount: {
                $size: '$products'
              }
            }).addFields({
              storeCount: {
                $size: '$stores'
              }
            }).append(pipeline));

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _context.t0);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 7]]);
  }));

  return function getCategories(_x) {
    return _ref.apply(this, arguments);
  };
}(); // Create a new Category


exports.getCategories = getCategories;

var createCategory = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(categoryParams) {
    var name, image, category;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            name = categoryParams.name, image = categoryParams.image;
            _context2.prev = 1;
            _context2.next = 4;
            return _categoryModel["default"].findOne({
              name: name
            });

          case 4:
            category = _context2.sent;

            if (!category) {
              _context2.next = 7;
              break;
            }

            throw {
              err: "".concat(category.name, " already Exists")
            };

          case 7:
            // Create Category Object
            category = new _categoryModel["default"]({
              name: name,
              image: image
            }); // Save Category to db

            _context2.next = 10;
            return category.save();

          case 10:
            return _context2.abrupt("return", {
              msg: "".concat(category.name, " category successfully created")
            });

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", _context2.t0);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 13]]);
  }));

  return function createCategory(_x2) {
    return _ref2.apply(this, arguments);
  };
}(); // Edit a category


exports.createCategory = createCategory;

var editCategory = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(editParams, id) {
    var category;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _categoryModel["default"].findById(id);

          case 3:
            category = _context3.sent;

            if (category) {
              _context3.next = 6;
              break;
            }

            throw {
              err: 'Category not found'
            };

          case 6:
            _context3.next = 8;
            return _categoryModel["default"].findByIdAndUpdate(id, {
              $set: editParams
            }, {
              omitUndefined: true,
              "new": true,
              useFindAndModify: false
            });

          case 8:
            category = _context3.sent;
            return _context3.abrupt("return", category);

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", _context3.t0);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 12]]);
  }));

  return function editCategory(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}(); //   Delete a Category


exports.editCategory = editCategory;

var deleteCategory = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(id) {
    var category;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _categoryModel["default"].findById(id);

          case 3:
            category = _context4.sent;

            if (category) {
              _context4.next = 6;
              break;
            }

            throw {
              err: 'Category not found'
            };

          case 6:
            _context4.next = 8;
            return _categoryModel["default"].findByIdAndRemove(id);

          case 8:
            return _context4.abrupt("return", {
              msg: 'Category Deleted'
            });

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", _context4.t0);

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 11]]);
  }));

  return function deleteCategory(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.service.js.map