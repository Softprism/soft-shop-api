import Joi from "joi";
import objectId from "./common";

const createProducts = {
  body: Joi.object({
    product_name: Joi.string().min(2).empty().required()
      .messages({
        "string.min": "Sorry Product name cannot be less than 2 letters",
        "string.empty": "Sorry, Product name cannot be an empty field",
        "any.required": "Product name is required.",

      }),
    product_description: Joi.string().empty().min(2).required()
      .messages({
        "string.min": "Sorry Product description cannot be less than 2 letters",
        "string.empty": "Sorry, Product description cannot be an empty field",
        "any.required": "Product description is required.",
      }),
    labels: Joi.array().required().empty().messages({
      "any.required": "Labels is required.",
    }),
    variants: Joi.array(),
    product_image: Joi.array().required().empty().messages({
      "any.required": "Product image is required.",
    }),
    category: objectId.empty().empty().required().messages({
      "string.empty": "Sorry, category id cannot be an empty field",
      "string.length": "Category id must be a valid mongoose id.",
      "any.required": "Category is required."
    }),
    availability: Joi.boolean(),
    variantOpt: Joi.boolean(),
    price: Joi.number().empty().positive().required()
      .messages({
        "number.empty": "Price cannot be an empty field.",
        "number.base": "Please provide a valid number.",
        "any.required": "Price is required.",
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const validateVariant = {
  body: Joi.object({
    variantTitle: Joi.string().empty().required().messages({
      "any.required": "Variant title is required.",
      "string.empty": "Sorry, variantTitle cannot be an empty field",
    }),
    multiSelect: Joi.boolean().empty().required()
      .messages({
        "any.required": "MultiSelect is required.",
      })
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const createFees = {
  body: Joi.object({
    title: Joi.string().empty().required().messages({
      "any.required": "Title is required.",
      "string.empty": "Sorry, title cannot be an empty field",
    }),
    amount: Joi.number().empty().positive().required()
      .messages({
        "any.required": "Amount is required.",
        "number.empty": "Amount cannot be an empty field.",
        "number.base": "Please provide a valid number.",
      }),
    product: objectId.required().empty().messages({
      "any.required": "Product is required.",
      "string.length": "Product id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const validateStoreProduct = {
  body: Joi.object({
    labels: Joi.array().empty().messages({
      "string.empty": "Sorry, Labels cannot be an empty field",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const reviewProductValidation = {
  body: Joi.object({
    text: Joi.string().empty().required().messages({
      "any.required": "Title is required.",
      "string.empty": "Sorry, title cannot be an empty field",
    }),
    star: Joi.number().empty().positive().required()
      .messages({
        "any.required": "Star is required.",
        "number.empty": "Star cannot be an empty field.",
        "number.base": "Please provide a valid number.",
      }),
    user: objectId.required().empty().messages({
      "any.required": "User id is required.",
      "string.length": "User id id must be a valid mongoose id.",
    }),
    store: objectId.required().empty().messages({
      "any.required": "Store id is required.",
      "string.length": "Store id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const addVariantItemValidation = {
  body: Joi.object({
    itemName: Joi.string().empty().messages({
      "string.empty": "Sorry, item name cannot be an empty field",
    }),
    itemThumbnail: Joi.string().empty().messages({
      "string.empty": "Sorry, item thumbnail cannot be an empty field",
    }),
    itemPrice: Joi.number().empty().positive()
      .messages({
        "number.empty": "Item price cannot be an empty field.",
        "number.base": "Please provide a valid number.",
      }),
    required: Joi.boolean().empty(),
    quantityOpt: Joi.boolean().empty()

  })
};

const validateVariantItem = {
  body: Joi.object({
    itemName: Joi.string().empty().messages({
      "string.empty": "Sorry, item name cannot be an empty field",
    }),
    itemThumbnail: Joi.string().empty().messages({
      "string.empty": "Sorry, item thumbnail cannot be an empty field",
    }),
    itemPrice: Joi.number().empty().positive()
      .messages({
        "number.empty": "Item price cannot be an empty field.",
        "number.base": "Please provide a valid number.",
      }),
    variantItemId: objectId.required().empty().messages({
      "any.required": "id is required.",
      "string.empty": "Sorry, item id cannot be an empty field",
      "string.length": "Variant item id must be a valid mongoose id.",
    }),

  })
};

const editVariantValidation = {
  body: Joi.object({
    variantItems: Joi.array().items(
      Joi.object({
        itemName: Joi.string().empty().messages({
          "string.empty": "Sorry, item name cannot be an empty field",
        }),
        itemThumbnail: Joi.string().empty().messages({
          "string.empty": "Sorry, item thumbnail cannot be an empty field",
        }),
        _id: objectId.required().empty().messages({
          "any.required": "id is required.",
          "string.empty": "Sorry, product id cannot be an empty field",
          "string.length": "Product id must be a valid mongoose id.",
        }),
        itemPrice: Joi.number().empty().positive()
          .messages({
            "number.empty": "Item price cannot be an empty field.",
            "number.base": "Please provide a valid number.",
          }),
        required: Joi.boolean().empty(),
        quantityOpt: Joi.boolean().empty()
      })
    ),
  })
};
export {
  createProducts, validateVariant, createFees, validateStoreProduct,
  reviewProductValidation, addVariantItemValidation, editVariantValidation,
  validateVariantItem
};
