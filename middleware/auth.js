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

			next();
		} catch (err) {
			console.error(err);
			res
				.status(401)
				.json({ success: false, msg: 'Not authorized, token failed' });
		}
	}

	if (!token) {
		res.status(401).json({ success: false, msg: 'Not authorized, no token' });
	}
};

export { auth };
