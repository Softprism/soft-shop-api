// import expressJwt from 'express-jwt';
// // import userService from '../services/user.service.js';

// const jwt = () => {
// 	const secret = process.env.JWT_SECRET;
// 	return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
// 		path: [
// 			'/',
// 			/\/admin/i,
// 			/\/user/i,
// 			/\/store/i,
// 			/\/category/i,
// 			/\/order/i,
// 			/\/product/i,
// 		],
// 	});
// };

// // async function isRevoked(req, payload, done) {
// // 	const user = await userService.getById(payload.id);

// // 	// revoke token if user no longer exists
// // 	if (!user) {
// // 		return done(null, true);
// // 	}

// // 	done();
// // }

// export { jwt };
