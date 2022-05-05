import Joi from "joi";
import objectId from "./common";

const order_validation = {
  body: Joi.object({
    store: objectId.required().empty().messages({
      "any.required": "Store id is required.",
      "string.length": "Store id must be a valid mongoose id.",
      "string.empty": "Sorry, store id cannot be an empty field",
    }),
    user: objectId.empty().messages({
      "any.required": "User id is required.",
      "string.length": "User id must be a valid mongoose id.",
      "string.empty": "Sorry, store id cannot be an empty field",
    }),
    paymentMethod: Joi.string().required().empty().messages({
      "any.required": "Payment method is required.",
      "string.empty": "Sorry, payment method cannot be an empty field",
    }),
    deliveryAddress: Joi.string().required().empty().messages({
      "any.required": "Delivery address is required.",
      "string.empty": "Sorry, Delivery address cannot be an empty field",
    }),
    customerNote: Joi.string(),
    deliveryPrice: Joi.number().required().empty()
      .messages({
        "number.empty": "Delivery Price cannot be an empty field.",
        "number.base": "Please provide a valid number.",
        "any.required": "Delivery Price is required.",
      }),
    card: Joi.string().empty().messages({
      "string.empty": "Sorry, user card token is empty",
    }),
    bankCode: Joi.string().empty().messages({
      "string.empty": "Sorry, bank code token is empty",
    }),
    orderItems: Joi.array().items(
      Joi.object({
        productName: Joi.string().empty().required().messages({
          "any.required": "Product name is required.",
          "string.empty": "Sorry, Product name cannot be an empty field",
        }),
        productImage: Joi.string().empty().required().messages({
          "any.required": "Product image is required.",
          "string.empty": "Sorry, Product image cannot be an empty field",
        }),
        product: objectId.required().empty().messages({
          "any.required": "Product id is required.",
          "string.empty": "Sorry, product id cannot be an empty field",
          "string.length": "Product id must be a valid mongoose id.",
        }),
        price: Joi.number().empty().positive().required()
          .messages({
            "any.required": "Price is required.",
            "number.empty": "Price cannot be an empty field.",
            "number.base": "Please provide a valid number.",
          }),
        qty: Joi.number().empty().positive().required()
          .messages({
            "any.required": "Quantity is required.",
            "number.empty": "Quantity cannot be an empty field.",
            "number.base": "Please provide a valid number.",
          }),
        selectedVariants: Joi.array().items(
          Joi.object({
            itemName: Joi.string().empty().required().messages({
              "any.required": "Variant item name is required.",
              "string.empty": "Sorry, Variant item name cannot be an empty field",
            }),
            variantTitle: Joi.string().empty().required().messages({
              "any.required": "Variant title is required.",
              "string.empty": "Sorry, Variant title cannot be an empty field",
            }),
            itemPrice: Joi.number().empty().required()
              .messages({
                "any.required": "Variant item price is required.",
                "number.empty": "Variant item price cannot be an empty field.",
                "number.base": "Please provide a valid number.",
              }),
            quantity: Joi.number().empty().positive().required()
              .messages({
                "any.required": "Variant item quantity is required.",
                "number.empty": "Variant item quantity cannot be an empty field.",
                "number.base": "Please provide a valid number.",
              }),
            variantId: objectId.required().empty().messages({
              "any.required": "Variant id is required.",
              "string.empty": "Sorry, Variant id cannot be an empty field",
              "string.length": "Variant id must be a valid mongoose id.",
            }),
          }),
        ),
      }),
    ),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const reviewValidation = {
  body: Joi.object({
    star: Joi.number().empty().positive()
      .messages({
        "number.empty": "Star cannot be an empty field.",
        "number.base": "Please provide a valid number.",
      }),
    text: Joi.string().empty().messages({
      "any.required": "Delivery address is required.",
      "string.empty": "Sorry, Delivery address cannot be an empty field",
    }),

  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export { order_validation, reviewValidation };
