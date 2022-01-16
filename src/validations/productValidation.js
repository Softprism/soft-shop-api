import Joi from "joi";
import objectId from "./common";

const createProducts = {
  body: Joi.object({
    product_name: Joi.string().min(2).required(),
    product_description: Joi.string().min(2).required(),
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
