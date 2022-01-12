import Joi from "joi";
import objectId from "./common";

const registerValidation = {
  body: Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    password: Joi.string().min(5).required(),
    token: objectId.required(),
  }).required(),
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().min(5).required(),
    password: Joi.string().min(5).required(),
  }).required(),
};
const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }).required(),
};

const tokenValidation = {
  body: Joi.object({
    type: Joi.string().valid("rider-signup").required(),
    otp: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
  }).required(),
};

const resetValidation = {
  body: Joi.object({
    token: objectId.required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).required(),
};

export {
  registerValidation, emailValidation, tokenValidation,
  resetValidation, loginValidation
};
