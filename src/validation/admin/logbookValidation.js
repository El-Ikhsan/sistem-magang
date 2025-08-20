import Joi from 'joi';

const idArraySchema = Joi.array().items(Joi.string().uuid().required()).min(1).required();

export const validateSchema = Joi.object({
  status: Joi.string().valid('validated', 'rejected').required(),
  admin_feedback: Joi.string().optional().allow('', null),
});

export const bulkValidateSchema = Joi.object({
  ids: idArraySchema,
  status: Joi.string().valid('validated', 'rejected').required(),
  admin_feedback: Joi.string().optional().allow('', null),
});