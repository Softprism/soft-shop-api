// const mongoose = require('mongoose');

// const connectionOptions = {
// 	useCreateIndex: true,
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	useFindAndModify: false,
// 	useNewUrlParser: true,
// 	useCreateIndex: true,
// 	useFindAndModify: true,
// };

// try {
// 	mongoose.connect(process.env.MONGO_URI, connectionOptions).then(() => {
// 		console.log('Database Connected');
// 	});
// } catch (err) {
// 	console.error(err.message);
// 	process.exit(1);
// }

// mongoose.pluralize(null);
// mongoose.Promise = global.Promise;

// module.exports = {
// 	User: require('../models/user.model'),
// 	Store: require('../models/store.model'),
// 	Product: require('../models/product.model'),
// 	Category: require('../models/category.model'),
// 	Order: require('../models/order.model'),
// 	Admin: require('../models/admin.model'),
// };

import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useCreateIndex: true,
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
