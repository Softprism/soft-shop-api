import Joi from "joi";

const create_category = {
  body: Joi.object({
    name: Joi.string().required(),
    image: Joi.array(),
  }).required(),
};

export default create_category;
