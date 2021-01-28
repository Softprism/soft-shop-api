const express = require('express');
const router = express.Router();
const storeService = require('./store.service');

// routes

router.get('/', getStores);
router.post('/create', createStore)

module.exports = router;

function getStores(req, res, next) {
    storeService.getStores()
        .then(stores => res.json(stores))
        .catch(err => next(err));
}
function createStore(req,res,next) {
    storeService.createStore(req.body)
    .then(()=>res.json({}))
    .catch(err => next(err))
}