"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendEmail = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var sendEmail = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(toEmail, mailSubj, mailBody) {
    var transporter, mailOptions;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(1, toEmail);
            transporter = _nodemailer["default"].createTransport({
              host: "mail.soft-shop.app",
              port: 465,
              secure: true,
              auth: {
                user: "nduka@soft-shop.app",
                pass: "2021@Softprism"
              }
            }); // Verify connection configuration

            transporter.verify(function (error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log("Server is ready to take our messages");
              }
            }); // Set mail options

            mailOptions = {
              from: '"Nduka from Softshop" <nduka@soft-shop.app>',
              to: toEmail,
              subject: mailSubj,
              text: mailBody
            }; // Send email

            transporter.sendMail(mailOptions, function (err, data) {
              if (err) {
                console.log("Error " + err);
              } else {
                console.log("Email sent successfully");
              }
            });

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function sendEmail(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.sendEmail = sendEmail;
//# sourceMappingURL=sendMail.js.map