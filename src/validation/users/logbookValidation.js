import Joi from 'joi';

export const logbookSchema = Joi.object({
  //Validasi untuk status kehadiran
  kehadiran: Joi.string().valid('wfo', 'wfh', 'izin', 'sakit').required(),
  tanggal: Joi.date().iso().required(),
  // Buat 'kegiatan' hanya wajib jika kehadiran adalah 'wfo' atau 'wfh'
  kegiatan: Joi.string().min(5).max(500).when('kehadiran', {
    is: Joi.string().valid('wfo', 'wfh'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  deskripsi: Joi.string().optional().allow(''), 
  jam_mulai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  jam_selesai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null)
});

export const updateLogbookSchema = Joi.object({
  kehadiran: Joi.string().valid('wfo', 'wfh', 'izin', 'sakit').optional(),
  tanggal: Joi.date().iso().optional(),
  kegiatan: Joi.string().min(5).max(500).optional().allow('', null),
  deskripsi: Joi.string().optional().allow(''),
  jam_mulai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  jam_selesai: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null)
}).min(1);

export const deleteManySchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
}); 