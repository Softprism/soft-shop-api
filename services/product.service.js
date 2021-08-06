import Product from '../models/product.model.js';
import Store from '../models/store.model.js';
import Review from '../models/review.model.js';

const getProducts = async (getParam) => {
	try {
		// get limit and skip from url parameters
		const limit = Number(getParam.limit);
		const skip = Number(getParam.skip);

		//find all products in the db
		const allProducts = await Product.find()
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
		  .populate(
        { path: 'store', select: 'location name openingTime closingTime'})
      .populate('category')

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
		console.log(searchParam);
		const searchedProducts = await Product.find(searchParam)
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit) //number of records to return
			.skip(skip) //number of records to skip
		  .populate(
        { path: 'store', select: 'location name openingTime closingTime'})
      .populate('category')
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
		console.log(storeId);
		//find store products
		const storeProduct = await Product.find({ store: storeId })
			.sort({ createdDate: -1 }) // -1 for descending sort
			.limit(limit)
			.skip(skip)
			.populate(
        { path: 'store', select: 'location name openingTime closingTime'})
      .populate('category')
		return storeProduct;
	} catch (error) {
		return error;
	}
};

const createProduct = async (productParam, storeId) => {
	console.log(storeId);
	try {
		const { product_name, category, availability, price, product_image } =
			productParam;

		// validate store, we have to make sure we're assigning a product to a store
		const store = await Store.findById(storeId).catch((err) => {
			throw { err: 'store not found' };
		});
		console.log(store);
		if (!store) {
			throw 'unable to add product to this store';
		}

		//create new product
		const newProduct = new Product({
			store: storeId,
			product_name,
			category,
			availability,
			price,
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
		console.log(storeId);
		// validate store, we have to make sure the product belongs to a store
		// const store = await Store.findById(storeId);
		// console.log(store)
		// if (!store) {
		// 	throw {
		// 		err: 'Unable to edit product in this store',
		// 	};
		// }

		//check if product exists
		const product = await Product.findOnea({
			_id: productId,
			store: storeId,
		}).catch((err) => {
			throw { err: 'product not found' };
		});

		// if (!product) {
		// 	throw {
		// 		err: 'Product not found',
		// 	};
		// }

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

const reviewProduct = async (review) => {
  try {
    const product = await Product.findById(review.product);

    if(!product) throw {err: 'product could not be found'}

    const newReview = new Review(review)
    newReview.save()

    return newReview
  } catch (error) {
    console.log(error)
    return error
  }
}
  const countReviews = async () => {
    return Review.aggregate([
      {
        $group: {
          // Each `_id` must be unique, so if there are multiple
          // documents with the same age, MongoDB will increment `count`.
          _id: null,
          count: { $sum: 1 }
        }
      }
    ])
  }

export {
	getProducts,
	getStoreProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	findProduct,
  reviewProduct,
  countReviews
};

//UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.
