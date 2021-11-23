"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _errorMiddleware = require("./middleware/errorMiddleware.js");

var _cors = _interopRequireDefault(require("cors"));

var _db = require("./config/db.js");

var _userRoutes = _interopRequireDefault(require("./routes/user.routes.js"));

var _adminRoutes = _interopRequireDefault(require("./routes/admin.routes.js"));

var _productRoutes = _interopRequireDefault(require("./routes/product.routes.js"));

var _storeRoutes = _interopRequireDefault(require("./routes/store.routes.js"));

var _orderRoutes = _interopRequireDefault(require("./routes/order.routes.js"));

var _categoryRoutes = _interopRequireDefault(require("./routes/category.routes.js"));

_dotenv["default"].config();

(0, _db.connectDB)();
var app = (0, _express["default"])();
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use(_express["default"].json());
app.use((0, _cors["default"])()); // api routes

app.use('/users', _userRoutes["default"]);
app.use('/admins', _adminRoutes["default"]);
app.use('/products', _productRoutes["default"]);
app.use('/stores', _storeRoutes["default"]);
app.use('/order', _orderRoutes["default"]);
app.use('/category', _categoryRoutes["default"]);
app.get('/', function (req, res) {
  res.status(200).json({
    success: true,
    msg: 'API is running...'
  });
}); // global error handler

app.use(_errorMiddleware.errorHandler); // Start server

var PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("Server running in ".concat(process.env.NODE_ENV, " mode on port ").concat(PORT)));
//# sourceMappingURL=server.js.map