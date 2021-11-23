"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOTP = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _tokensModel = _interopRequireDefault(require("../../models/tokens.model.js"));

var _otpGenerator = _interopRequireDefault(require("otp-generator"));

var getOTP = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(type, email) {
    var oldTokenRequest, otp, tokenData, newOTP;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _tokensModel["default"].findOne({
              email: email,
              type: type
            });

          case 2:
            oldTokenRequest = _context.sent;

            if (!oldTokenRequest) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", oldTokenRequest);

          case 5:
            // generate OTP
            otp = _otpGenerator["default"].generate(4, {
              alphabets: false,
              upperCase: false,
              specialChars: false
            }); // add token to DB

            tokenData = {
              email: email,
              otp: otp,
              type: type
            };
            newOTP = new _tokensModel["default"](tokenData).save();
            return _context.abrupt("return", newOTP);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getOTP(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.getOTP = getOTP;
//# sourceMappingURL=sendOTP.js.map