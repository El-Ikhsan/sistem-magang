import Joi from 'joi';

export const pendaftaranSchema = Joi.object({
  motivation_letter: Joi.string().min(50).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
});