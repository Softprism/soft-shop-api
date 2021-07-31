import Product from '../models/product.model.js';
import Store from '../models/store.model.js';

const getProducts = async (getParam) => {
	try {
		// get limit and skip from url parameters
		const limit = Number(getParam.limit);
		const skip = Number(getParam.skip);

		//find all products in the db
		const allProducts = await Product.find()
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip);
		// .populate('store category');

		return allProducts;
	} catch (error) {
		return error;
	}
};

const findProduct = async (searchParam, opts) => {
	try {
		opts.skip = Number(opts.skip);
		opts.limit = Number(opts.limit);
		const { skip, limit } = opts;
		if (searchParam.product_name)
			searchParam.product_name = new RegExp(searchParam.product_name, 'i');
		// i for case insensitive

		const searchedProducts = await Product.find(searchParam)
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit) //number of records to return
			.skip(skip); //number of records to skip
		// .populate('store category')
		// we'll prioritize results to be the ones closer to the users

		if (searchedProducts.length < 1) {
			throw { msg: 'match not found' };
		}

		return searchedProducts;
	} catch (error) {
		return error;
	}
};


const getStoreProducts = async (storeId, getParam) => {
	try {
		// get limit and skip from url parameters
		let limit = Number(getParam.limit);
		let skip = Number(getParam.skip);

		//find store products
		const storeProduct = await Product.find({ store: storeId })
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
			.populate('store category');

		return storeProduct;
	} catch (error) {
		return error;
	}
};

const createProduct = async (productParam, storeId) => {
	try {
		const {
			product_name,
			category,
			availability,
			price,
			rating,
			product_image,
		} = productParam;

		// validate store, we have to make sure we're assigning a product to a store
		const store = await Store.findById(storeId);
		if (store == null) {
			throw { err: 'unable to add product to this store' };
		}

		//create new product
		const newProduct = new Product({
			store: storeId,
			product_name,
			category,
			availability,
			price,
			rating,
			product_image,
		});

		await newProduct.save(); // save new product

		return newProduct;
	} catch (error) {
		return error;
	}
};

const updateProduct = async (productParam, productId, storeId) => {
	try {
		// validate store, we have to make sure the product belongs to a store
		const store = await Store.findById(storeId);
    console.log(store,storeId)
		if (!store) {
			throw {
				err: 'Unable to edit product in this store',
			};
		}

		//check if product exists
		const product = await Product.findById(productId);

		if (!product) {
			throw {
				err: 'Product not found',
			};
		}

		//apply changes to the product
		return await Product.findByIdAndUpdate(
			productId,
			{ $set: productParam },
			{ new: true, useFindAndModify: true }
		);
	} catch (error) {
		return error;
	}
};

const deleteProduct = async (productId, storeId) => {
	try {
		// validate store, we have to make sure the product belongs to a store
		const store = await Store.findById(storeId);

		if (!store) {
			throw {
				err: 'Unable to delete products from this store',
			};
		}
		// check if product exists
		const product = await Product.findById(productId);

		if (!product) {
			throw {
				err: 'Product not found',
			};
		}

		//delete the product
		await Product.deleteOne({ _id: productId });

		return { msg: 'Successfully Deleted Product' };
	} catch (error) {
		return error;
	}
};

export {
	getProducts,
	getStoreProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	findProduct,
};

//UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.

