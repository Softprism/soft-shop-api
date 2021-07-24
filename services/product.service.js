const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../middlewares/db');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Store = require('../models/store.model');

const getProducts = async () => {
	try {
		//get all products in the db
<<<<<<< HEAD
		let allProducts =  await Product
    .find()
    .sort({createdDate: -1}) // -1 for descending sort
    .limit(1)
    .skip(3)
    .populate('store category');

    if(!allProducts) {
      throw {msg: 'no products found'}
    } else {
      return allProducts
    }
=======
		let allProducts = await Product.find();
		if (!allProducts) {
			throw { msg: 'no products found' };
		}
>>>>>>> 84d7e03ec8551e21d98ab7dbb85592a71b9e0804
	} catch (error) {
		console.log(error);
		throw error;
	}
};

<<<<<<< HEAD
const findProduct = async (searchParam, opts) => {
  try {
    console.log(opts)
    opts.skip = Number(opts.skip)
    opts.limit = Number(opts.limit)
    const {skip, limit} = opts
    console.log(opts)
    if(searchParam.product_name) {
      searchParam.product_name = new RegExp(searchParam.product_name, 'i'); 
      // i for case insensitive
    }

	  const searchedProducts = await Product
    .find(searchParam)
    .sort({createdDate: -1}) // -1 for descending sort
    .limit(limit) //number of records to return
    .skip(skip) //number of records to skip
    .populate('store category')
    // we'll prioritize results to be the ones closer to the users

    if(searchedProducts.length < 1) {
      throw {msg: 'match not found'}
    }

    return searchedProducts
  } catch (error) {
    console.log(error)
    throw error
  }
}
=======
const findProduct = async (searchParam) => {
	try {
		let regex = new RegExp(searchParam, 'i');
		return await Product.find({ product_name: regex }).exec(); // we'll prioritize results to be the ones closer to the users
	} catch (error) {
		throw error;
	}
};
>>>>>>> 84d7e03ec8551e21d98ab7dbb85592a71b9e0804

const getMyProducts = async (storeId) => {
	let storeProduct = await Product.find({
		store: mongoose.Types.ObjectId(storeId),
<<<<<<< HEAD
	})
  .populate('store category')
  if(storeProduct.length < 1) {
    throw 'no product found in this store' 
  } else {
    return storeProduct
  }
}
=======
	});
	if (storeProduct.length < 1) {
		throw 'no product found in this store';
	} else {
		return storeProduct;
	}
};
>>>>>>> 84d7e03ec8551e21d98ab7dbb85592a71b9e0804

async function getStoreProducts(storeId) {
	return await Product.find({
		store: mongoose.Types.ObjectId(storeId),
	});
}

async function createProduct(productParam, id) {
	const { product_name, category, availability, price, rating, product_image } = productParam;

	let store = await Store.findById("601a7ab504b3e62cf65f79df");

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
    product_image
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
