import Joi from "joi";

const order_validation = {
  body: Joi.object({
    user: objectId.required(),
    store: objectId.required(),
    paymentMethod: Joi.string().required(),
    deliveryAddress: Joi.string().required(),
    deliveryPrice: Joi.number().positive().required(),
    orderItems: Joi.array().items(
      Joi.object({
        productName: Joi.string().required(),
        productImage: Joi.string().required(),
        product: objectId.required(),
        price: Joi.number().positive().required(),
        qty: Joi.number().positive().required(),
      })
    ),
  }).required(),
};

export default order_validation;
