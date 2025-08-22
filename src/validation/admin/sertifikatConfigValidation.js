import Joi from 'joi';

// Schema for creating a new certificate template
export const createConfigSchema = Joi.object({
    template_name: Joi.string().max(255).required(),
    company_name: Joi.string().max(255).required(),
    leader_name: Joi.string().max(255).required(),
    description: Joi.string().required(),
    certificate_prefix: Joi.string().max(50).required()
    // Note: URLs for logo and background are handled separately during file upload
});

// Schema for updating an existing certificate template
export const updateConfigSchema = Joi.object({
    template_name: Joi.string().max(255).optional(),
    company_name: Joi.string().max(255).optional(),
    leader_name: Joi.string().max(255).optional(),
    description: Joi.string().optional(),
    certificate_prefix: Joi.string().max(50).optional()
}).min(1); // At least one field must be provided for an update

// Schema for deleting multiple templates by their IDs
export const deleteManyConfigSchema = Joi.object({
    ids: Joi.array().items(Joi.string().uuid().required()).min(1).required()
});
