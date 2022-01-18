import Joi from "joi";
import objectId from "./common";

const registerStore = {
  body: Joi.object({
    name: Joi.string().min(2),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    images: Joi.array(),
    category: objectId.required(),
    location: Joi.required(),
    password: Joi.string().min(5).required(),
    openingTime: Joi.string(),
    closingTime: Joi.string(),
    address: Joi.string().min(2),
  }),
};

const loginStoreValidation = {
  body: Joi.object({
    email: Joi.string().min(5).required(),
    password: Joi.string().min(5).required(),
  }).required(),
};

const updateStoreValidation = {
  body: Joi.object({
    name: Joi.string().min(2),
    address: Joi.string().min(2),
    email: Joi.string().email(),
    phone_number: Joi.string().min(11),
    images: Joi.array(),
    openingTime: Joi.string(),
    closingTime: Joi.string(),
    password: Joi.string(),
    deliveryTime: Joi.number().positive(),
    isActive: Joi.boolean(),
    prepTime: Joi.number().positive(),
  })
};

export {
  registerStore, updateStoreValidation, loginStoreValidation
};
