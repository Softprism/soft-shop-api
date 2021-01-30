const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
	getUsers,
	registerUser,
};

async function getUsers() {
	return await User.find();
}

async function registerUser(userParam) {
	const { first_name, last_name, email, phone_number, password } = userParam;

		let user = await User.findOne({ email });

		if (user) {
			return { msg: 'User already exists' };
		}

		user = new User({
			first_name,
			last_name,
			email,
			phone_number,
			password,
		});

		let pass = user.password;

		const salt = await bcrypt.genSalt(10);

		user.password = await bcrypt.hash(pass, salt);

		await user.save();
		const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '7d' });
		return token;

}
