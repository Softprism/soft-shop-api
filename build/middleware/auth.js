"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auth = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var auth = function auth(req, res, next) {
  var token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      var decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);

      if (decoded.user) {
        req.user = decoded.user;
      }

      if (decoded.store) {
        req.store = decoded.store;
      }

      if (decoded.admin) {
        req.admin = decoded.admin;
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({
        success: false,
        msg: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      msg: 'Not authorized, no token'
    });
  }
};

exports.auth = auth;
//# sourceMappingURL=auth.js.map