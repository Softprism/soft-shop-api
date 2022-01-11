import Joi from "joi";

const create_category = {
  body: Joi.object({
    name: Joi.string().required(),
  }).required(),
};

export default create_category;
