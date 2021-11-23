"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCategories = exports.editCategory = exports.deleteCategory = exports.createCategory = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var categoryService = _interopRequireWildcard(require("../services/category.service.js"));

var _expressValidator = require("express-validator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// FUNCTIONS
// Get Categories
var getCategories = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var categories;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (req.query.skip === undefined || req.query.limit === undefined) {
              res.status(400).json({
                success: false,
                msg: 'filtering parameters are missing'
              });
            } // Call getCategories function from category service


            _context.next = 3;
            return categoryService.getCategories(req.query);

          case 3:
            categories = _context.sent;

            if (categories.err) {
              res.status(400).json({
                success: false,
                msg: categories.err
              });
            }

            categories && categories.length > 0 ? res.status(200).json({
              success: true,
              result: categories
            }) : res.status(404).json({
              success: false,
              msg: 'No categories found'
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getCategories(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}(); // Create Category


exports.getCategories = getCategories;

var createCategory = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var errors, request;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(req.admin === undefined)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", res.status(403).json({
              success: false,
              msg: 'you\'re not permiited to carry out this action'
            }));

          case 2:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", res.status(400).json({
              errors: errors.array()
            }));

          case 5:
            _context2.next = 7;
            return categoryService.createCategory(req.body);

          case 7:
            request = _context2.sent;

            if (request.err) {
              res.status(500).json({
                success: false,
                msg: request.err
              });
            } else {
              res.status(201).json({
                success: true,
                result: request.msg
              });
            }

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function createCategory(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}(); // Edit Category


exports.createCategory = createCategory;

var editCategory = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var errors, request;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(req.admin === undefined)) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", res.status(403).json({
              success: false,
              msg: 'you\'re not permiited to carry out this action'
            }));

          case 2:
            errors = (0, _expressValidator.validationResult)(req);

            if (errors.isEmpty()) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", res.status(400).json({
              errors: errors.array()
            }));

          case 5:
            _context3.next = 7;
            return categoryService.editCategory(req.body, req.params.id);

          case 7:
            request = _context3.sent;

            if (request.err) {
              res.status(500).json({
                success: false,
                msg: request.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: request
              }); //request returns the modified category
            }

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function editCategory(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

exports.editCategory = editCategory;

var deleteCategory = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var request;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(req.admin === undefined)) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt("return", res.status(403).json({
              success: false,
              msg: 'you\'re not permiited to carry out this action'
            }));

          case 2:
            _context4.next = 4;
            return categoryService.deleteCategory(req.params.id);

          case 4:
            request = _context4.sent;

            if (request.err) {
              res.status(404).json({
                success: false,
                msg: request.err
              });
            } else {
              res.status(200).json({
                success: true,
                result: request.msg
              });
            }

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function deleteCategory(_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}();

exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map