require('rootpath')(); 
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('middlewares/jwt');
const errorHandler = require('middlewares/error-handler');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/admin', require('./admin/admin.controller'));
app.use('/user', require('./user/user.controller'));
app.use('/store', require('./store/store.controller'));
app.use('/order', require('./order/order.controller'));
app.use('/product', require('./product/product.controller'));
app.use('/category', require('./category/category.controller'));

  // this is just here to verify if the server is online
app.use('/', require('./app.controller'));  

// global error handler
app.use(errorHandler);

// start server
const port =
	process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 4000;

const server = app.listen(port, function () {
	console.log('Server listening on port ' + port);
});
