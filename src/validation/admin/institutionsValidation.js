import Joi from 'joi';

export const updateInstitutionSchema = Joi.object({
  type: Joi.string().valid("universitas", "SMA", "Politeknik", "SMK", "lainnya").optional(),
  name: Joi.string().max(255).optional(),
  email: Joi.string().email().max(255).optional(),
  address: Joi.string().optional(),
  lecturer_name: Joi.string().max(255).optional().allow(null, ''),
  whatsapp_supervisor: Joi.string().max(20).optional().allow(null, ''),
  student_id_number: Joi.string().max(50).optional().allow(null, '')
}).min(1);