import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import Product from '../models/product.model.js';
import Store from '../models/store.model.js';

const getProducts = async () => {
	try {
		//get all products in the db
		let allProducts = await Product.find();
		if (!allProducts) {
			throw { msg: 'no products found' };
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const findProduct = async (searchParam) => {
	try {
		let regex = new RegExp(searchParam, 'i');
		// We'll prioritize results to be the ones closer to the users
		return await Product.find({ product_name: regex }).exec();
	} catch (error) {
		throw error;
	}
};

const getMyProducts = async (storeId) => {
	let storeProduct = await Product.find({
		store: mongoose.Types.ObjectId(storeId),
	});
	if (storeProduct.length < 1) {
		throw 'no product found in this store';
	} else {
		return storeProduct;
	}
};

async function getStoreProducts(storeId) {
	return await Product.find({
		store: mongoose.Types.ObjectId(storeId),
	});
}

async function createProduct(productParam, id) {
	const { product_name, category, availability, price, rating, product_image } =
		productParam;

	let store = await Store.findById('601a7ab504b3e62cf65f79df');

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
		product_image,
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
