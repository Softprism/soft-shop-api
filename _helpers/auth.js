const jwt = require('jsonwebtoken');
const config = require('../config.json');

module.exports = (req, res, next) => {
	// Get Token from Header
	const token = req.header('auth-token');

	// Check if it's not a token
	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'No token detected, authorization denied',
		});
	}

	try {
		const decoded = jwt.verify(token, config.jwtSecret);

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
		res.status(401).json({
			success: false,
			msg: 'Token is not Valid',
		});
	}
};
