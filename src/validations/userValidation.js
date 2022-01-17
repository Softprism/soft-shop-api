import Joi from "joi";
import objectId from "./common";

const registerValidation = {
  body: Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    password: Joi.string().min(6).required(),
    token: objectId.required(),
  }).required(),
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }).required(),
};
const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }).required(),
};

export {
  registerValidation, emailValidation, loginValidation
};
