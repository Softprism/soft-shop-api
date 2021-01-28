const expressJwt = require('express-jwt');
const config = require('config.json');
const userService = require('../user/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            /\/user/i,
            /\/store/i,
            /\/category/i,
            /\/order/i,
            /\/product/i,
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
}; 