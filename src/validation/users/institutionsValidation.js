import Joi from 'joi';

export const institutionSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  type: Joi.string().valid("universitas", "SMA", "Politeknik", "SMK", "lainnya").required(),
  name: Joi.string().max(255).required(),
  email: Joi.string().email().max(255).required(),
  address: Joi.string().required(),
  lecturer_name: Joi.string().max(255).optional().allow(null, ''),
  whatsapp_supervisor: Joi.string().max(20).optional().allow(null, ''),
  student_id_number: Joi.string().max(50).optional().allow(null, '')
});