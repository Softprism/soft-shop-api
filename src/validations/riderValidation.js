import Joi from "joi";
import objectId from "./common";

const createRider = {
  body: Joi.object({
    name: Joi.string().min(1).required(),
  }).required(),
};

const getSingleAddon = {
  params: Joi.object({
    addonId: objectId.required(),
  }).required(),
};

const getPhoto = {
  params: Joi.object({
    photoId: objectId.required(),
  }).required(),
};

export { createRider, getSingleAddon, getPhoto };
