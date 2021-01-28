const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes

router.get('/', getUsers);
router.post('/register', registerUser)

module.exports = router;

function getUsers(req, res, next) {
    userService.getUsers()
        .then(users => res.json(users))
        .catch(err => next(err));
}
function registerUser(req,res,next) {
    userService.registerUser(req.body)
    .then(()=>res.json({}))
    .catch(err => next(err))
}