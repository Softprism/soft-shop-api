const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(config.connectionString, connectionOptions).then(()=>{
    console.log('database connected')
});
mongoose.pluralize(null);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../user/user.model'),
    Store: require('../store/store.model'),
    Product: require('../product/product.model'),
    Category: require('../category/category.model'),
    Order: require('../order/order.model')
};