import Joi from "joi";
import objectId from "./common";

const registerStore = {
  body: Joi.object({
    name: Joi.string().min(2).messages({
      "string.empty": "Sorry, name cannot be an empty field",
      "string.min": "Name should be two characters or more"
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).required().messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    images: Joi.array(),
    category: objectId.required(),
    location: Joi.required(),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
    openingTime: Joi.string().messages({
      "string.empty": "Sorry, Opening Time cannot be an empty field"
    }),
    closingTime: Joi.string().messages({
      "string.empty": "Sorry, Closing Time cannot be an empty field",
    }),
    address: Joi.string().min(2).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
  }),
};

const loginStoreValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
  }).required(),
};

const updateStoreValidation = {
  body: Joi.object({
    name: Joi.string().min(2).messages({
      "string.empty": "Sorry, name cannot be an empty field",
      "string.min": "Name should be two characters or more"
    }),
    address: Joi.string().min(2).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
    email: Joi.string().email().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    images: Joi.array(),
    openingTime: Joi.string(),
    closingTime: Joi.string(),
    password: Joi.string().min(6).messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
    deliveryTime: Joi.number().positive(),
    isActive: Joi.boolean(),
    prepTime: Joi.number().positive(),
  })
};

export {
  registerStore, updateStoreValidation, loginStoreValidation
};
