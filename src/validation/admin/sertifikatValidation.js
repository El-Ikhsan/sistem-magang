import Joi from 'joi';

export const sertifikatSchema = Joi.object({
  user_id: Joi.string().required(),
});

export const deleteManySertifikatSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
});