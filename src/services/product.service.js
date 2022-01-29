import mongoose from "mongoose";
import Product from "../models/product.model";
import Store from "../models/store.model";
import Review from "../models/review.model";
import Variant from "../models/variant.model";
import CustomFee from "../models/customFees.model";
import Category from "../models/category.model";

const getProducts = async (getParam) => {
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
    matchParam.labels = mongoose.Types.ObjectId(getParam.label);
  }

  const pipeline = [
    {
      $unset: [
        "store",
        "category.image",
        "productReview",
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
      averageRating: { $floor: { $avg: "$productReview.star" } },
    })
    .addFields({
      averageRating: { $ifNull: ["$averageRating", 0] },
    })
  // $lookup produces array, $unwind go destructure everything to object
    .unwind("$store")
    .unwind("$category")
  // removing fields we don't need
    .append(pipeline)
  // Sorting and pagination
    .sort("-createdDate")
    .skip(skip)
    .limit(limit);

  return allProducts;
};

const getProductDetails = async (productId) => {
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
};

const createProduct = async (productParam, storeId) => {
  // validate store, we have to make sure we're assigning a product to a store
  const storeChecker = await Store.findById(storeId);
  if (!storeChecker) {
    return { err: "Store not found. Please try.", status: 404 };
  }
  // checl for variant option
  if (!productParam.variantOpt) productParam.variants = undefined;
  // add store ID to productParam
  productParam.store = storeId;
  const {
    product_name,
    product_description,
    product_image,
    labels,
    price,
    category,
    variantOpt,
    variants,
    store,
  } = productParam;

  // check if category exists
  const catChecker = await Category.findById(category);
  if (!catChecker) {
    return {
      err: "Category not found. Please try again.", status: 404
    };
  }

  // create new product
  const newProduct = new Product({
    product_name,
    product_description,
    product_image,
    labels,
    price,
    category,
    variantOpt,
    variants,
    store,
  });
  await newProduct.save(); // save new product

  return newProduct;
};

const updateProduct = async (productParam, productId, storeId) => {
  // check if product exists
  const product = await Product.findOne({
    _id: productId,
    store: storeId
  });
  if (!product) {
    return {
      err: "Product not found.",
      status: 404
    };
  }

  // apply changes to the product
  let updateProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: productParam },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  return updateProduct;
};

const deleteProduct = async (productId, storeId) => {
  // validate store, we have to make sure the product belongs to a store
  const product = await Product.findOne({
    _id: productId,
    store: storeId
  });

  if (!product) {
    return {
      err: "Product not found.",
      status: 404
    };
  }

  // delete the product
  await Product.deleteOne({ _id: productId });

  return { msg: "Successfully Deleted Product." };
};

const reviewProduct = async (review) => {
  const product = await Product.findById(review.product);

  if (!product) throw { err: "Product not found.", status: 404 };

  const newReview = new Review(review);
  await newReview.save();

  return newReview;
};

const createVariant = async (storeId, variantParam) => {
  // create new variant label without items
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found.", status: 404 }; // this ain't working

  const { variantTitle, multiSelect } = variantParam;

  let newVariant = new Variant({ variantTitle, multiSelect, store: storeId });
  await newVariant.save();

  return newVariant;
};

const updateVariant = async (variantId, updateParam) => {
  let variant = await Variant.findById(variantId);
  if (!variant) return { err: "Variant not found.", status: 404 };
  // find a way to validate if variant exists

  let updateVariant = await Variant.findByIdAndUpdate(
    variantId,
    { $set: updateParam },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  return updateVariant;
};

const addVariantItem = async (storeId, variantId, variantParam) => {
  // add items to a variant label
  // find variant
  let variant = await Variant.findOne({ _id: variantId, store: storeId });
  if (!variant) return { err: "Variant not found.", status: 404 };
  // push new variant item and save
  variant.variantItems.push(variantParam);
  await variant.save();

  return variant;
};

const editVariantItem = async (storeId, variantItemId, variantParam) => {
  const {
    itemName, itemThumbnail, itemPrice, required, quantityOpt
  } = variantParam;
  let variantItem = await Variant.findOne({ "variantItems._id": variantItemId, store: storeId });

  if (!variantItem) return { err: "Variant item not found.", status: 400 };
  await Variant.updateOne(
    {
      variantItems: { $elemMatch: { _id: variantItemId }, },
    },
    {
      $set: {
        "variantItems.$.itemName": itemName,
        "variantItems.$.itemThumbnail": itemThumbnail,
        "variantItems.$.itemPrice": itemPrice,
        "variantItems.$.required": required,
        "variantItems.$.quantityOpt": quantityOpt,
      }
    },
    { new: true, }
  );
  const newVariant = await Variant.findOne({
    variantItems: { $elemMatch: { _id: variantItemId }, },
  },).select("variantItems");

  if (!newVariant) return { err: "Store variant not found.", status: 404 };
  return newVariant;
};

const getStoreVariants = async (storeId) => {
  // find store variants
  let storeVariants = await Variant.find({
    store: storeId,
    active: true,
  }).select("variantTitle active multiSelect");
  if (!storeVariants) return { err: "Variants not found.", status: 404 };
  let size = storeVariants.length;

  return { storeVariants, size };
};

const getVariantItem = async (variantId, pagingParam) => {
  // add items to a variant label
  const { limit, skip } = pagingParam;
  // find variant
  let variant = await Variant.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(variantId),
    })
    .unwind("$variantItems")
    .replaceRoot("$variantItems")
    .sort("_id")
    .skip(skip)
    .limit(limit);

  return variant;
};

const addCustomFee = async (storeId, customrFeeParam) => {
  let store = await Store.findById(storeId);
  let product = await Product.findById(customrFeeParam.product);

  if (!store) throw { err: "Store not found." };
  if (!product) throw { err: "Product not found." };

  let newCustomFee = new CustomFee(customrFeeParam);
  await newCustomFee.save();
  if (newCustomFee.save()) {
    product.customFee.availability = true;
    product.customFee.items.push(newCustomFee._id);
    await product.save();
  }

  newCustomFee = await CustomFee.find({ product: newCustomFee.product });
  return newCustomFee;
};

const deleteCustomFee = async (customFeeId) => {
  let customFee = await CustomFee.findByIdAndDelete(customFeeId);
  if (!customFee) return { err: "Custom fee not found." };
  return "fee removed from product";
};

const deleteStoreVariant = async (variantId) => {
  let variant = await Variant.findByIdAndDelete(variantId);
  if (!variant) return { err: "variant not found.", status: 400 };
  return "varaint deleted successfully";
};

const deleteVariantItem = async ({ itemId }) => {
  let item = await Variant.findOneAndUpdate(
    { "variantItems._id": itemId },
    {
      $pull: {
        variantItems: { _id: itemId }
      }
    }
  );
  if (!item) return { err: "Item not found.", status: 400 };
  return item;
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
  editVariantItem,
  addCustomFee,
  deleteCustomFee,
  getStoreVariants,
  deleteStoreVariant,
  deleteVariantItem
};

// UPDATES
// getProducts should provide for getStoreProducts, by adding storeid to the url parameter.
