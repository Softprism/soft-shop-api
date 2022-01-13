import Joi from "joi";
import objectId from "./common";

const registerStore = {
  body: Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    password: Joi.string().min(5).required(),
  }).required(),
};

const loginStoreValidation = {
  body: Joi.object({
    email: Joi.string().min(5).required(),
    password: Joi.string().min(5).required(),
  }).required(),
};
const updateStoreValidation = {
  body: Joi.object({
    images: Joi.string().required(),
    openingTime: Joi.date(),
    closingTime: Joi.date(),
    password: Joi.string().required().required(),
    deliveryTime: Joi.number().positive().required(),
    isActive: Joi.boolean(),
    prepTime: Joi.number().positive().r,
  }).required(),
};

export {
  registerStore, updateStoreValidation, loginStoreValidation
};
