import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (decoded.user) {
				req.user = decoded.user;
			}

			if (decoded.store) {
				req.store = decoded.store;
			}

			if (decoded.admin) {
				req.admin = decoded.admin;
			}

			// req.user = await User.findById(decoded.id).select('-password');

			next();
		} catch (err) {
			console.error(err);
			res.status(401);

			throw Error('Not authorized, token failed');
		}
	}

	if (!token) {
		res.status(401);
		throw Error('Not authorized, no token');
	}

	// Get Token from Header
	// const BearerToken = req.header('authorization');
	// const token = BearerToken.split(' ')[1]; //removes the bearer phrase
	// // Check if it's not a token
	// if (!token) {
	// 	return res.status(401).json({
	// 		success: false,
	// 		message: 'No token detected, authorization denied',
	// 	});
	// }

	// try {
	// 	const decoded = jwt.verify(token, config.jwtSecret);

	// 	if (decoded.user) {
	// 		req.user = decoded.user;
	// 	}

	// 	if (decoded.store) {
	// 		req.store = decoded.store;
	// 	}

	// 	if (decoded.admin) {
	// 		req.admin = decoded.admin;
	// 	}

	// 	next();
	// } catch (err) {
	// 	res.status(401).json({
	// 		success: false,
	// 		msg: 'Token is not Valid',
	// 	});
	// }
};

export { auth };
