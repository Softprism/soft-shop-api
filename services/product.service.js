const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('middlewares/db');
const mongoose = require('mongoose');
const Product = db.Product;
const Store = db.Store;

const getProducts = async () => {
	console.log(1);
	try {
		//get all products in the db
		let allProducts =  await Product.find();
    if(!allProducts) {
      throw {msg: 'no products found'}
    }
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const findProduct = (searchParam) => {
  try {
    let regex = new RegExp(searchParam, 'i');
	  return await Product.find({ product_name: regex }).exec(); // we'll prioritize results to be the ones closer to the users
  } catch (error) {
    throw error
  }
}

const getMyProducts = (storeId) => {
	let storeProduct = await Product.find({
		store: mongoose.Types.ObjectId(storeId),
	});
  if(storeProduct.length < 1) {
    throw 'no product found in this store' 
  } else {
    return storeProduct
  }
}

async function getStoreProducts(storeId) {
	return await Product.find({
		store: mongoose.Types.ObjectId(storeId),
	});
}

async function createProduct(productParam, id) {
	const { product_name, category, availability, price, rating } = productParam;

	let store = await Store.findById(id);

	if (!store) {
		throw {
			code: 400,
			msg: 'Login your store to create a product',
		};
	}

	let products = await getProducts();

	products.forEach((element) => {
		if (element.product_name == product_name) {
			throw {
				code: 400,
				msg: 'Product already exists',
			};
		}
	});

	newProduct = new Product({
		product_name: product_name,
		store: store._id,
		category: mongoose.Types.ObjectId(category),
		availability: availability,
		price: price,
		rating: rating,
	});

	await newProduct.save();
	return newProduct;
}

async function updateProduct(productParam, productId, storeId) {
	const { product_name, category, availability, price, rating } = productParam;

	console.log(productId);
	let store = await Store.findById(storeId);
	if (!store) {
		throw {
			code: 400,
			msg: 'Login your store to create a product',
		};
	}

	let product = await Product.findById(productId);

	if (!product) {
		throw {
			code: 400,
			msg: 'Product not found',
		};
	}

	const productUpdate = {};

	if (product_name) productUpdate.product_name = product_name;
	if (category) productUpdate.category = mongoose.Types.ObjectId(category);
	if (availability) productUpdate.availability = availability;
	if (price) productUpdate.price = price;
	if (rating) productUpdate.rating = rating;

	updatedProduct = await Product.findByIdAndUpdate(
		productId,
		{ $set: productUpdate },
		{ new: true, useFindAndModify: true }
	);
	return updatedProduct;
}

async function deleteProduct(productId, storeId) {
	let store = await Store.findById(storeId);

	if (!store) {
		throw {
			code: 400,
			msg: 'Login your store to create a product',
		};
	}

	let product = await Product.findById(productId);

	if (!product) {
		throw {
			code: 400,
			msg: 'Product not found',
		};
	}

	await Product.deleteOne({ _id: productId });

	return { message: 'Product deleted Successfully' };
}

module.exports = {
	getProducts,
	getMyProducts,
	getStoreProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	findProduct,
};
