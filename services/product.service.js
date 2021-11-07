import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import Review from "../models/review.model.js";
import Variant from "../models/variant.model.js";
import CustomFee from "../models/customFees.model.js";

import mongoose from "mongoose";

const getProducts = async (getParam) => {
  try {
    // get limit and skip from url parameters
    const limit = Number(getParam.limit);
    const skip = Number(getParam.skip);
    let matchParam = {};
    if (getParam.product_name) {
      matchParam.product_name = new RegExp(getParam.product_name, "i");
    }
    if (getParam.category) {
      matchParam.category = mongoose.Types.ObjectId(getParam.category);
    }
    if (getParam.store) {
      matchParam.store = mongoose.Types.ObjectId(getParam.store);
    }
    if (getParam.price) {
      matchParam.price = getParam.price;
    }
    if (getParam.availability) {
      getParam.availability = getParam.availability === "true";
      matchParam.availability = getParam.availability;
    }
    if (getParam.rating) {
      matchParam.rating = getParam.rating;
    }
    if (getParam.status) {
      matchParam.status = getParam.status;
    }
    if (getParam.label) {
      matchParam.label = mongoose.Types.ObjectId(getParam.label);
    }

    const pipeline = [
      {
        $unset: [
          "store.password",
          "store.email",
          "store.labels",
          "store.phone_number",
          "category.image",
          "productReview",
          "store.address",
          "variants.data",
          "variant.items",
          "customFee.items",
        ],
      },
    ];

    let allProducts = Product.aggregate()
      .match(matchParam)
      // Get data from review collection for each product
      .lookup({
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "productReview",
      })
      // Populate store field
      .lookup({
        from: "stores",
        localField: "store",
        foreignField: "_id",
        as: "store",
      })
      // populat category field
      .lookup({
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      })
      // add the averageRating field for each product
      .addFields({
        totalRates: { $sum: "$productReview.star" },
        ratingAmount: { $size: "$productReview" },
        averageRating: { $ceil: { $avg: "$productReview.star" } },
      })
      // $lookup produces array, $unwind go destructure everything to object
      .unwind("$store")
      .unwind("$category")
      // removing fields we don't need
      .append(pipeline)
      // Sorting and pagination
      .sort("-createdDate")
      .limit(limit)
      .skip(skip);

    return allProducts;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getProductDetails = async (productId) => {
  console.log(1, productId);
  try {
    const pipeline = [
      {
        $unset: [
          "store.password",
          "store.email",
          "store.labels",
          "store.phone_number",
          "category.image",
          "productReview",
          "store.address",
          "variants.data",
        ],
      },
    ];

    let productDetails = Product.aggregate()
      .match({
        _id: mongoose.Types.ObjectId(productId),
      })
      // // Populate store field
      .lookup({
        from: "stores",
        localField: "store",
        foreignField: "_id",
        as: "store",
      })
      // populat category field
      .lookup({
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      })
      .lookup({
        from: "variants",
        localField: "variant",
        foreignField: "_id",
        as: "variant",
      })
      // // $lookup produces array, $unwind go destructure everything to object
      .unwind("$store")
      .unwind("$category")
      // removing fields we don't need
      .append(pipeline);

    return productDetails;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const createProduct = async (productParam, storeId) => {
  try {
    // validate store, we have to make sure we're assigning a product to a store
    const store = await Store.findById(storeId).catch((err) => {
      throw { err: "store not found" };
    });
    if (!store) {
      throw "unable to add product to this store";
    }

    // add store ID to productParam
    productParam.store = storeId;

    //create new product
    const newProduct = new Product(productParam);
    await newProduct.save(); // save new product

    return newProduct;
  } catch (error) {
    return error;
  }
};

const updateProduct = async (productParam, productId, storeId) => {
  try {
    //check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw {
        err: "Product not found",
      };
    }

    //apply changes to the product
    let updateProduct = await Product.findByIdAndUpdate(
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
        err: "Unable to delete products from this store",
      };
    }
    // check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      throw {
        err: "Product not found",
      };
    }

    //delete the product
    await Product.deleteOne({ _id: productId });

    return { msg: "Successfully Deleted Product" };
  } catch (error) {
    return error;
  }
};

const reviewProduct = async (review) => {
  try {
    const product = await Product.findById(review.product);

    if (!product) throw { err: "product could not be found" };

    const newReview = new Review(review);
    await newReview.save();

    return newReview;
  } catch (error) {
    return error;
  }
};

const createVariant = async (storeId, variantParam) => {
  // create new variant label without items
  try {
    let store = await Store.findById(storeId);

    if (!store) throw { err: "Store not found" }; // this ain't working

    let newVariant = new Variant(variantParam);
    await newVariant.save();

    return newVariant;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateVariant = async (variantId, updateParam) => {
  try {
    let variant = await Variant.findById(variantId);
    if (!variant) throw { err: "variant not found" };
    // find a way to validate if variant exists

    let updateVariant = await Variant.findByIdAndUpdate(
      variantId,
      { $set: updateParam },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    return updateVariant;
  } catch (error) {
    return error;
  }
};

const addVariantItem = async (variantId, variantParam) => {
  // add items to a variant label
  try {
    // find variant
    let variant = await Variant.findById(variantId);
    if (!variant) throw { err: "variant not found" };

    // push new variant item and save
    variant.variantItems.push(variantParam);
    variant.save();

    return variant;
  } catch (error) {
    return error;
  }
};

const getVariantItem = async (variantId) => {
  // add items to a variant label
  try {
    // find variant
    let variant = await Variant.findById(variantId);
    if (!variant) throw { err: "variant not found" };

    return variant.variantItems;
  } catch (error) {
    return error;
  }
};

const addCustomFee = async (storeId, customrFeeParam) => {
  try {
    let store = await Store.findById(storeId);
    let product = await Product.findById(customrFeeParam.product);

    if (!store) throw { err: "Store not found" };
    if (!product) throw { err: "product not found" };

    let newCustomFee = new CustomFee(customrFeeParam);
    await newCustomFee.save();

    if (newCustomFee.save()) {
      product.customFee.availability = true;
      product.customFee.items.push(newCustomFee._id);
      await product.save();
    }

    return await CustomFee.find({ product: newCustomFee.product });
  } catch (error) {
    return error;
  }
};

const deleteCustomFee = async (customFeeId) => {
  try {
    console.log(customFeeId);
    let customFee = await CustomFee.findByIdAndDelete(customFeeId);
    console.log(customFee);
    if (!customFee) throw { err: "custom fee not found" };
    return "fee removed from product";
  } catch (error) {
    return error;
  }
};

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  reviewProduct,
  createVariant,
  updateVariant,
  addVariantItem,
  getVariantItem,
  addCustomFee,
  deleteCustomFee,
};

//UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.
