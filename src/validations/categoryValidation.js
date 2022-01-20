import Joi from "joi";

const create_category = {
  body: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Sorry, Category name cannot be an empty field",
    }),
    image: Joi.array(),
  }).required(),
};

export default create_category;
