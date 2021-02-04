const config = require('config.json');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectionOptions = {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: true,
};

try {
	mongoose.connect(config.connectionString, connectionOptions).then(() => {
		console.log('Database Connected');
	});
} catch (err) {
	console.error(err.message);
	process.exit(1);
}

mongoose.pluralize(null);
mongoose.Promise = global.Promise;

module.exports = {
	User: require('../user/user.model'),
	Store: require('../store/store.model'),
	Product: require('../product/product.model'),
	Category: require('../category/category.model'),
	Order: require('../order/order.model'),
	Admin: require('../admin/admin.model')
};
