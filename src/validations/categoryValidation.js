import Joi from "joi";

const create_category = {
  body: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Sorry, Category name cannot be an empty field",
    }),
    image: Joi.array(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export default create_category;
