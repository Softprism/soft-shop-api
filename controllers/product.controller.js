import express from 'express';
import * as productService from '../services/product.service.js';
import { auth } from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const getProducts = async (req, res, next) => {
	if (req.query.skip === undefined || req.query.limit === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'filtering parameters are missing' });
	}

	const allProducts = await productService.getProducts(req.query);

	if (allProducts.err) {
		res.status(400).json({ success: false, msg: allProducts.err });
	}

	allProducts && allProducts.length > 0
		? res.status(200).json({ success: true, result: allProducts })
		: res.status(404).json({ success: false, msg: 'No product found' });
};

const getStoreProducts = async (req, res, next) => {
	let storeID; // container to store the store's ID, be it a store request or an admin request
	if (req.store === undefined && req.query.storeID === undefined) {
		return res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}

	if (req.store) {
    storeID = req.store.id;
  } else if (req.query.storeID) {
    storeID = req.query.storeID;
  }
	
	const storeProducts = await productService.getStoreProducts(
		storeID,
		req.query
	);

	if (storeProducts.err)
		res.status(400).json({ success: false, msg: storeProducts.err });

	storeProducts && storeProducts.length > 0
		? res.status(200).json({ success: true, result: storeProducts })
		: res.status(404).json({ success: false, msg: 'No product found' });
};

const createProduct = async (req, res, next) => {
	let storeID; // container to store the store's ID, be it a store request or an admin request

	if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}

	if (req.store) storeID = req.store.id;
	if (req.query.storeID && req.admin) storeID = req.query.storeID;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let error_msgs = [];
		errors.array().forEach((element) => {
			error_msgs = [...error_msgs, element.msg];
		});

		return res.status(400).json({ success: false, msg: error_msgs });
	}

	const product = await productService.createProduct(req.body, storeID);

	product.err
		? res.status(409).json({ success: false, msg: product.err })
		: res.status(201).json({ success: true, result: product });
};

const updateProduct = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			success: false,
			errors: errors.array()['msg'],
		});
	}

	let storeID; // container to store the store's ID, be it a store request or an admin request
	if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}

	if (req.store) storeID = req.store.id;
	if (req.query.storeID && req.admin) storeID = req.query.storeID;

	const request = await productService.updateProduct(
		req.body,
		req.params.id,
		storeID
	);
	request.err
		? res.status(400).json({ success: false, msg: request.err })
		: res.status(200).json({ success: true, result: request });
};

const deleteProduct = async (req, res, next) => {
	let storeID;
	if (req.store === undefined && req.query.storeID === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'unable to authenticate this store' });
	}

	if (req.store) storeID = req.store.id;

	if (req.query.storeID && req.admin) storeID = req.query.storeID;

	const product = await productService.deleteProduct(req.params.id, storeID);

	product.err
		? res.status(404).json({ success: false, msg: product.err })
		: res.status(201).json({ success: true, result: product.msg });
};

const findProduct = async (req, res, next) => {
	if (req.query.skip === undefined || req.query.limit === undefined) {
		res
			.status(400)
			.json({ success: false, msg: 'filtering parameters are missing' });
	}

	const allProducts = await productService.findProduct(req.body, req.query);


  if (allProducts.err) {
		return res.status(400).json({ success: false, msg: allProducts.err });

	}

	allProducts && allProducts.length > 0
		? res.status(200).json({ success: true, result: allProducts })
		: res.status(404).json({ success: false, msg: 'No product found' });
};

const reviewProduct = async (req, res, next) => {
  if(req.store) {
    return res.status(400).json({ success: false, msg: 'action not allowed by store' });
  }
	const newReview = await productService.reviewProduct(req.body);

  if (newReview.err) {
		return res.status(400).json({ success: false, msg: newReview.err });
	}
  
	res.status(200).json({ success: true, result: newReview })

};

export {
	findProduct,
	deleteProduct,
	updateProduct,
	createProduct,
	getProducts,
	getStoreProducts,
  reviewProduct,
};
