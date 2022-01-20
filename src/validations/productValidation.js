import Joi from "joi";
import objectId from "./common";

const createProducts = {
  body: Joi.object({
    product_name: Joi.string().min(2).required().messages({
      "string.min": "Sorry Product name cannot be less than 2 letters",
      "string.empty": "Sorry, Product name cannot be an empty field",
    }),
    product_description: Joi.string().min(2).required().messages({
      "string.min": "Sorry Product description cannot be less than 2 letters",
      "string.empty": "Sorry, Product description cannot be an empty field",
    }),
    store: objectId,
    labels: Joi.array().required(),
    variants: Joi.array(),
    product_image: Joi.array().required(),
    category: objectId,
    availability: Joi.boolean(),
    variantOpt: Joi.boolean(),
    price: Joi.number().positive().required(),
  }),
};

export default createProducts;
