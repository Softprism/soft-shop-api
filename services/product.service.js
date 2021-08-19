import Product from '../models/product.model.js';
import Store from '../models/store.model.js';
import Review from '../models/review.model.js';
import Variant from '../models/variant.model.js';

import mongoose from 'mongoose';



const getProducts = async (getParam) => {
	try {
		// get limit and skip from url parameters
		const limit = Number(getParam.limit);
		const skip = Number(getParam.skip);
    let matchParam = {}
    if(getParam.product_name) {
      matchParam.product_name = new RegExp(getParam.product_name,'i')
    }
    if(getParam.category) {
      matchParam.category = mongoose.Types.ObjectId(getParam.category)
    }
    if(getParam.store) {
      matchParam.store = mongoose.Types.ObjectId(getParam.store)
    }
    if(getParam.price) {
      matchParam.price = getParam.price
    }
    if(getParam.availability) {
      getParam.availability =  (getParam.availability === 'true')
      matchParam.availability = getParam.availability
    }
    if(getParam.rating) {
      matchParam.rating = getParam.rating
    }
    if(getParam.status) {
      matchParam.status = getParam.status
    }
    if(getParam.label) {
      matchParam.label = mongoose.Types.ObjectId(getParam.label)
    }

    const pipeline = [{ 
      $unset: ['store.password','store.email','store.labels','store.phone_number','category.image','productReview','store.address', 'variants.data']
    }];
    
      let allProducts = Product.aggregate()
      .match(matchParam)
      // Get data from review collection for each product
      .lookup({
        from: 'reviews',
        localField: '_id', 
        foreignField: 'product', 
        as: 'productReview'
      })
      // Populate store field
      .lookup({
        from: 'stores',
        localField: 'store', 
        foreignField: '_id', 
        as: 'store'
      })
      // populat category field
      .lookup({
        from: 'categories',
        localField: 'category', 
        foreignField: '_id', 
        as: 'category'
      })
      // add the averageRating field for each product
      .addFields({
        "totalRates": {$sum:'$productReview.star' },
        "ratingAmount": {$size: "$productReview"},
        "averageRating": {$ceil: {$avg: '$productReview.star'}},
      })
      // $lookup produces array, $unwind go destructure everything to object
      .unwind('$store')
      .unwind("$category")
      // removing fields we don't need
      .append(pipeline)
      // Sorting and pagination
      .sort('-createdDate')
      .limit(limit)
      .skip(skip)
      

		return allProducts;
	} catch (error) {
    console.log(error)
		return error;
	}
};

const getProductDetails = async (productId) => {
  console.log(productId)
  try {

    let product = await Product.findById(productId)
    .populate(
      { path: 'store', select: 'location name openingTime closingTime'}
    )
    .populate('category')

    if(!product) throw {err: 'error finding product'};

    return product;

  } catch (error) {
    console.log(error)
    return error
  }
}

const createProduct = async (productParam, storeId) => {
	console.log(storeId);
	try {
		const { product_name,product_description, category, label, price, product_image } =
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
      product_description,
			category,
			label,
			price,
			product_image
		});
		await newProduct.save(); // save new product

		return newProduct;
	} catch (error) {
		return error;
	}
};

const updateProduct = async (productParam, productId, storeId) => {
	try {
		//check if product exists
		const product = await Product.findById(productId)
		if (!product) {
			throw {
				err: 'Product not found',
			};
		}

		//apply changes to the product
		let updateProduct =  await Product.findByIdAndUpdate(
			productId,
			{ $set: productParam },
			{ omitUndefined: true, new: true, useFindAndModify: false }
		);

    return updateProduct;
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
    await newReview.save()

    return newReview
  } catch (error) {
    return error
  }
}

const addVariant = async (storeId, variantParam) => {
  try {
  let store = await Store.findById(storeId);
  let product = await Product.findById(variantParam.product)

  if (!store._id) throw { err: 'Store not found' }; // this ain't working
  if (!product._id) throw {err: 'product not found'}; // this ain't working

  let newVariant = new Variant(variantParam)
  await newVariant.save()

  if(newVariant.save()) {
    product.variant.availability = true
    product.variant.items.push(newVariant._id)
    
    await product.save()
    console.log('updated products')
  }

  return await Variant.find({product: newVariant.product});
  } catch (error) {
    console.log(error)
    return error
  }
}

export {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
  getProductDetails,
  reviewProduct,
  addVariant
};

//UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.
