import Joi from "joi";

const register = {
  body: Joi.object({
    username: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
  }).required(),
};

const login = {
  body: Joi.object({
    username: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
  }).required(),
};

export {
  register, login
};
