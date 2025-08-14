import Joi from 'joi';

export const sertifikatSchema = Joi.object({
  certificate_number: Joi.string().min(5).max(100).required(),
  description: Joi.string().optional(),
  issued_date: Joi.date().iso().required()
});