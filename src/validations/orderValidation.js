import Joi from "joi";
import objectId from "./common";

const order_validation = {
  body: Joi.object({
    // user: objectId.required(),
    store: objectId.required(),
    paymentMethod: Joi.string().required(),
    deliveryAddress: Joi.string().required(),
    deliveryPrice: Joi.number().positive().required(),
    orderItems: Joi.array().items(
      Joi.object({
        productName: Joi.string().required().messages({
          "string.empty": "Sorry, Product name cannot be an empty field",
        }),
        productImage: Joi.string().required().messages({
          "string.empty": "Sorry, Product name cannot be an empty field",
        }),
        product: objectId.required(),
        price: Joi.number().positive().required(),
        qty: Joi.number().positive().required(),
      })
    ),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export default order_validation;
