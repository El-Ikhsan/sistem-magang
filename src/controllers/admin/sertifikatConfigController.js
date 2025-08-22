import { db } from '../../../config/database.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { createConfigSchema, updateConfigSchema, deleteManyConfigSchema } from '../../validation/admin/sertifikatConfigValidation.js';
import { bucketName } from '../../../config/minio.js';
import { v4 as uuidv4 } from 'uuid'; // Diperlukan untuk membuat ID secara manual

class CertificateConfigController {

    // GET all templates owned by the logged-in admin
    static async getAll(req, res, next) {
        try {
            const configs = await db('sertifikat_configs')
                .where({ admin_id: req.user.id })
                .orderBy('created_at', 'desc');

            res.status(200).json({
                success: true,
                message: 'Certificate templates retrieved successfully.',
                data: configs
            });
        } catch (error) {
            next(error);
        }
    }

    // CREATE a new certificate template
    static async create(req, res, next) {
        try {
            const { error, value } = createConfigSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details.map(detail => detail.message)
                });
            }
            
            if (!req.files || !req.files.company_logo || !req.files.background_image) {
                return res.status(400).json({ success: false, message: 'Company logo and background image are required.' });
            }

            const logoFile = req.files.company_logo[0];
            const bgFile = req.files.background_image[0];

            const logoObjectName = `templates/logos/${Date.now()}-${req.user.id}`;
            const bgObjectName = `templates/backgrounds/${Date.now()}-${req.user.id}`;

            await uploadFile(logoFile, logoObjectName);
            await uploadFile(bgFile, bgObjectName);

            const company_logo_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${logoObjectName}`;
            const background_image_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${bgObjectName}`;

            // --- PERBAIKAN DI SINI ---
            // 1. Buat ID baru secara manual di aplikasi
            const newId = uuidv4();

            // 2. Masukkan data ke database menggunakan ID yang baru dibuat
            await db('sertifikat_configs').insert({
                id: newId,
                ...value,
                company_logo_url,
                background_image_url,
                admin_id: req.user.id,
            });

            // 3. Ambil kembali data yang baru saja dimasukkan untuk respons
            const newConfig = await db('sertifikat_configs').where({ id: newId }).first();

            res.status(201).json({
                success: true,
                message: 'Certificate template created successfully.',
                data: newConfig
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;

            const { error, value } = updateConfigSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details.map(detail => detail.message)
                });
            }
            const updateData = value;

            const existingConfig = await db('sertifikat_configs').where({ id, admin_id: req.user.id }).first();
            if (!existingConfig) {
                return res.status(404).json({ success: false, message: 'Template not found or you do not have permission to edit it.' });
            }

            if (req.files) {
                if (req.files.company_logo) {
                    // Delete old logo from MinIO
                    if (existingConfig.company_logo_url) {
                        const oldLogoObjectName = existingConfig.company_logo_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                        await deleteFile(oldLogoObjectName);
                    }
                    
                    const logoFile = req.files.company_logo[0];
                    const logoObjectName = `templates/logos/${Date.now()}-${req.user.id}`;
                    await uploadFile(logoFile, logoObjectName);
                    updateData.company_logo_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${logoObjectName}`;
                }

                if (req.files.background_image) {
                    // Delete old background from MinIO
                    if (existingConfig.background_image_url) {
                        const oldBgObjectName = existingConfig.background_image_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                        await deleteFile(oldBgObjectName);
                    }
                    
                    const bgFile = req.files.background_image[0];
                    const bgObjectName = `templates/backgrounds/${Date.now()}-${req.user.id}`;
                    await uploadFile(bgFile, bgObjectName);
                    updateData.background_image_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${bgObjectName}`;
                }
            }
        
            // --- PERBAIKAN DI SINI ---
            // 1. Lakukan update
            await db('sertifikat_configs')
                .where({ id })
                .update(updateData);
        
            // 2. Ambil kembali data yang sudah diupdate untuk respons
            const updatedConfig = await db('sertifikat_configs').where({ id }).first();

            res.status(200).json({
                success: true,
                message: 'Certificate template updated successfully.',
                data: updatedConfig
            });
        } catch (error) {
            next(error);
        }
    }
    
    // SET a template as the active one for the entire system
    static async setActive(req, res, next) {
        try {
            const { id } = req.params;

            await db.transaction(async trx => {
                await trx('sertifikat_configs').update({ is_active: false });
                const result = await trx('sertifikat_configs').where({ id }).update({ is_active: true });
                if (result === 0) {
                    throw new Error('Template not found.');
                }
            });

            res.status(200).json({
                success: true,
                message: `Template ${id} has been set as active.`
            });
        } catch (error) {
            if (error.message === 'Template not found.') {
                return res.status(404).json({ success: false, message: 'Template not found.' });
            }
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const configToDelete = await db('sertifikat_configs').where({ id, admin_id: req.user.id }).first();

            if (!configToDelete) {
                return res.status(404).json({ success: false, message: 'Template not found or you do not have permission to delete it.' });
            }
            
            if (configToDelete.is_active) {
                return res.status(400).json({ success: false, message: 'Cannot delete the active template. Please set another template as active first.' });
            }

            // Delete associated files from storage
            if (configToDelete.company_logo_url) {
                const logoObjectName = configToDelete.company_logo_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                await deleteFile(logoObjectName);
            }
            if (configToDelete.background_image_url) {
                const bgObjectName = configToDelete.background_image_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                await deleteFile(bgObjectName);
            }

            await db('sertifikat_configs').where({ id }).del();

            res.status(200).json({
                success: true,
                message: 'Certificate template deleted successfully.'
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE multiple templates
    static async deleteMany(req, res, next) {
        try {
            const { error, value } = deleteManyConfigSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details.map(detail => detail.message)
                });
            }
            const { ids } = value;

            const configsToDelete = await db('sertifikat_configs')
                .whereIn('id', ids)
                .andWhere({ admin_id: req.user.id });

            if (configsToDelete.length === 0) {
                return res.status(404).json({ success: false, message: 'No valid templates found to delete.' });
            }

            const isActiveTemplateSelected = configsToDelete.some(c => c.is_active);
            if (isActiveTemplateSelected) {
                return res.status(400).json({ success: false, message: 'Cannot delete the active template. Please unselect it and try again.' });
            }

            for (const config of configsToDelete) {
                if (config.company_logo_url) {
                    const logoObjectName = config.company_logo_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                    await deleteFile(logoObjectName);
                }
                if (config.background_image_url) {
                    const bgObjectName = config.background_image_url.replace(`${process.env.MINIO_PUBLIC_URL}/${bucketName}/`, '');
                    await deleteFile(bgObjectName);
                }
            }

            const deletedCount = await db('sertifikat_configs')
                .whereIn('id', configsToDelete.map(c => c.id))
                .del();

            res.status(200).json({
                success: true,
                message: `${deletedCount} certificate templates deleted successfully.`
            });
        } catch (error) {
            next(error);
        }
    }
}

export default CertificateConfigController;
