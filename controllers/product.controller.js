import express from 'express';
import * as productService from '../services/product.service.js'
import { auth } from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';

const getProducts  = async (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
    res.status(400).json({
      success: false,
      msg: 'missing some parameters',
    })
  }
  let allProducts = await productService.getProducts(req.query)

  allProducts && allProducts.length > 0 
  ? res.status(200).json({success:true, result: allProducts})
  : res.status(404).json({success: false, msg: 'No product found'})
  
  if (allProducts.err) {
		res.status(500).json({ success: false, msg: allProducts.err });
	}
}

const getStoreProducts = async (req, res, next) => {
  let storeID // container to store the store's ID, be it a store request or an admin request
  if (req.store === undefined && req.query.storeID === undefined) {
    res.status(400).json({
      success: false,
      msg: 'unable to authenticate this store',
    })
  } 

  if(req.store) storeID = req.store.id
  if(req.query.storeID) storeID = req.query.storeID

	let storeProducts = await productService.getStoreProducts(storeID,req.query)

  if(storeProducts.err) res.status(500).json({ success: false, msg: storeProducts.err })

  storeProducts && storeProducts.length > 0
  ? res.status(200).json({ success: true, result: storeProducts })
	: res.status(404).json({ success: false, msg: 'No product found' })
}

const createProduct = async (req, res, next) => {
  let storeID // container to store the store's ID, be it a store request or an admin request

  if (req.store === undefined && req.query.storeID === undefined) {
    res.status(400).json({
      success: false,
      msg: 'unable to authenticate this store',
    })
  } 
  if(req.store) {
    storeID = req.store.id
  }
  if(req.query.storeID) {
    storeID = req.query.storeID
  }

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let error_msgs = [];
		errors.array().forEach((element) => {
			error_msgs = [...error_msgs, element.msg];
		});
		return res.status(400).json({
			success: false,
			msg: error_msgs,
		});
	}

	productService.createProduct(req.body, storeID)
	.then(() => {
    res.status(201).json({success: true });
  })
  .catch((err) => {
    res.status(500).send({ success: false, msg: err.err })
  }
  );
}

const updateProduct = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
	    res.status(400).json({
	        success: false,
	        errors: errors.array()['msg']
	    });
	}

  let storeID // container to store the store's ID, be it a store request or an admin request

  if (req.store === undefined && req.query.storeID === undefined) {
    res.status(400).json({
      success: false,
      msg: 'unable to authenticate this store',
    })
  } 
  if(req.store) {
    storeID = req.store.id
  }
  if(req.query.storeID) {
    storeID = req.query.storeID
  }

	productService
  .updateProduct(req.body, req.params.id, storeID)
  .then(() => {
    console.log(1234)
    res.status(200).json({ success: true });
  })
  .catch((err) => {
    res.status(500).json({ success: false, message: err.err })});
}

const deleteProduct = (req, res, next) => {
  let storeID;
  if (req.store === undefined && req.query.storeID === undefined) {
    res.status(400).json({
      success: false,
      msg: 'unable to authenticate this store',
    })
  } 

  if(req.store) storeID = req.store.id

  if(req.query.storeID) storeID = req.query.storeID

	productService
  .deleteProduct(req.params.id, storeID)
  .then( () => res.status(200).json({ success: true }) )
  .catch((err) => res.status(500).json({ success: false, message: err.err }) );
}

const findProduct = async (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
    res.status(400).json({
      success: false,
      msg: 'missing some parameters',
    })
  }

  let allProducts = await productService.findProduct(req.body,req.query)

  allProducts && allProducts.length > 0 
  ? res.status(200).json({success:true, result: allProducts})
  : res.status(404).json({success: false, msg: 'No product found'})
  
  if (allProducts.err) {
		res.status(500).json({ success: false, msg: allProducts.err });
	}

}

export { findProduct, deleteProduct, updateProduct, createProduct, getProducts, getStoreProducts }