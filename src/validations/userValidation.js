import Joi from "joi";
import objectId from "./common";

const registerValidation = {
  body: Joi.object({
    first_name: Joi.string().min(2).required().messages({
      "string.min": "Sorry First name cannot be less than 2 letters",
      "string.empty": "Sorry, First name cannot be an empty field",
    }),
    last_name: Joi.string().min(2).required().messages({
      "string.min": "Sorry Last name cannot be less than 2 letters",
      "string.empty": "Sorry, Last name cannot be an empty field",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).required().messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
    token: objectId.required(),
  }).required(),
};

const loginValidation = {
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
const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
  }).required(),
};

export {
  registerValidation, emailValidation, loginValidation
};
