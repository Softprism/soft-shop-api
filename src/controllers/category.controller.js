import { validationResult } from "express-validator";
import * as categoryService from "../services/category.service";

// FUNCTIONS
// Get Categories
const getCategories = async (req, res, next) => {
  try {
    // Call getCategories function from category service
    let categories = {};
    if (req.query.nogeo === "true") {
      categories = await categoryService.getCategoriesNogeo(req.query);
    } else {
      categories = await categoryService.getCategories(req.query);
    }

    return res.status(200).json({ success: true, result: categories, status: 200 });
  } catch (error) {
    next(error);
  }
};

// Create Category
const createCategory = async (req, res, next) => {
  try {
    const request = await categoryService.createCategory(req.body);

    if (request.err) {
      res.status(request.status).json({ success: false, msg: request.err, status: request.status });
    } else {
      res.status(201).json({ success: true, result: request, status: 201 });
    }
  } catch (error) {
    next(error);
  }
};

// Edit Category
const editCategory = async (req, res, next) => {
  try {
    const request = await categoryService.editCategory(req.body, req.params.id);

    if (request.err) {
      res.status(request.status).json({ success: false, msg: request.err, status: request.status });
    } else {
      res.status(200).json({ success: true, result: request, status: 200 }); // request returns the modified category
    }
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const request = await categoryService.deleteCategory(req.params.id);

    if (request.err) {
      res.status(equest.status).json({ success: false, msg: request.err, status: request.status });
    } else {
      res.status(200).json({ success: true, result: request, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

export {
  getCategories, editCategory, createCategory, deleteCategory
};
