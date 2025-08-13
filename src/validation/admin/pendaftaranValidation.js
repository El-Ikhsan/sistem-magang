import Joi from 'joi';

export const verifySchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  admin_notes: Joi.string().optional()
});

export const statusSchema = Joi.object({
  status_magang: Joi.string().valid('dalam_magang', 'lulus', 'tidak_lulus').required()
});

const idArraySchema = Joi.array().items(Joi.string().uuid().required()).min(1).required();

export const deleteManySchema = Joi.object({
  ids: idArraySchema,
});

export const bulkVerifySchema = Joi.object({
  ids: idArraySchema,
  status: Joi.string().valid('approved', 'rejected').required(),
  admin_notes: Joi.string().optional().allow(''),
});

export const bulkUpdateStatusMagangSchema = Joi.object({
  ids: idArraySchema,
  status_magang: Joi.string().valid('dalam_magang', 'lulus', 'tidak_lulus').required(),
});