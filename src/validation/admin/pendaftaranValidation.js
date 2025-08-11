import Joi from 'joi';

export const verifySchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  admin_notes: Joi.string().optional()
});

export const statusSchema = Joi.object({
  status_magang: Joi.string().valid('dalam_magang', 'lulus', 'tidak_lulus').required()
});