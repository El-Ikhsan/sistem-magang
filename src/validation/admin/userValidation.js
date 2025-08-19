import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'user').required(),
  status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
}).min(1);

export const deleteManySchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
});