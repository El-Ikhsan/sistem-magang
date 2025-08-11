import Joi from 'joi';

export const logbookSchema = Joi.object({
  tanggal: Joi.date().iso().required(),
  kegiatan: Joi.string().min(5).max(500).required(),
  deskripsi: Joi.string().optional(),
  jam_mulai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  jam_selesai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
});