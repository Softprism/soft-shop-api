import * as categoryService from '../services/category.service.js'
import { validationResult } from 'express-validator';

// FUNCTIONS
// Get Categories
const getCategories = async (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
		res.status(400).json({ success: false, msg: 'filtering parameters are missing' });
	}
	// Call getCategories function from category service
	const categories = await categoryService.getCategories(req.query)

  if(categories.err) {
		res.status(400).json({ success: false, msg: categories.err });
	}
  categories && categories.length > 0
  ? res.status(200).json({ success: true, result: categories })
  : res.status(404).json({ success: false, msg: 'No categories found' });
}

// Create Category
const createCategory = async (req, res, next) => {
  // verifiy permission
  if(req.admin === undefined) return res.status(403).json({ success: false, msg: 'you\'re not permiited to carry out this action' })

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const request = await categoryService.createCategory(req.body)
	
  if(request.err) {
		res.status(500).json({ success: false, msg: request.err })
  } else {
    res.status(201).json({ success: true, result: request.msg })
  }
}

// Edit Category
const editCategory = async (req, res, next) => {
  // verifiy permission
  if(req.admin === undefined) return res.status(403).json({ success: false, msg: 'you\'re not permiited to carry out this action' })
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const request = await categoryService.editCategory(req.body, req.params.id)

	if(request.err) {
		res.status(500).json({ success: false, msg: request.err })
  } else {
    res.status(200).json({ success: true, result: request }) //request returns the modified category
  }

}

const deleteCategory = async (req, res, next) => {
  // verifiy permission
  if(req.admin === undefined) return res.status(403).json({ success: false, msg: 'you\'re not permiited to carry out this action' })
	const request = await categoryService.deleteCategory(req.params.id)
	
  if(request.err) {
		res.status(404).json({ success: false, msg: request.err })
  } else {
    res.status(200).json({ success: true, result: request.msg })
  }
}

export {getCategories, editCategory, createCategory, deleteCategory}
