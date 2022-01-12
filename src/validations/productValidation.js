import Joi from "joi";
import objectId from "./common";

const createProducts = {
  body: Joi.object({
    product_name: Joi.string().min(2).required(),
    product_description: Joi.string().min(2).required(),
    store: objectId.required(),
    category: objectId.required(),
    availability: Joi.boolean(),
    price: Joi.number().positive().required(),
  }).required(),
};

export default {
  createProducts
};
