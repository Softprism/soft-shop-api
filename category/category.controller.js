const express = require('express');
const router = express.Router();
const categoryService = require('./category.service');

// routes

router.get('/', getCategories);
router.post('/create', createCategory)

module.exports = router;

function getCategories(req, res, next) {
    categoryService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => next(err));
}
function createCategory(req,res,next) {
    console.log(req.body)
    categoryService.createCategory(req.body)
    .then(()=>res.json({}))
    .catch(err => next(err))
}