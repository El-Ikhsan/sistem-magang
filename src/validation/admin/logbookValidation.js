import Joi from 'joi';

export const validateSchema = Joi.object({
  status: Joi.string().valid('validated', 'rejected').required(),
  admin_feedback: Joi.string().optional()
});