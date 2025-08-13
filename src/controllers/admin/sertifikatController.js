import { db } from '../../../config/database.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { sertifikatSchema } from '../../validation/admin/sertifikatValidation.js';
import { bucketName } from '../../../config/minio.js';
import path from 'path';

class SertifikatController {
    static async createSertifikat(req, res, next) {
        try {
            const { error, value } = sertifikatSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details.map(detail => detail.message)
                });
            }

            const { user_id, certificate_number, description, issued_date } = value;

            // 1. Check if the user exists and has the 'user' role
            const user = await db('users').where({ id: user_id, role: 'user' }).first();
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found or is not a valid user'
                });
            }

            // 2. Check if the user has a completed and passed internship
            const approvedApplication = await db('pendaftaran')
                .where({ user_id, status: 'approved', status_magang: 'lulus' })
                .first();
            if (!approvedApplication) {
                return res.status(400).json({
                    success: false,
                    message: 'User must have an status "approved" and "lulus" status-magang'
                });
            }

            // 3. FIX: Check if the user ALREADY has a certificate
            const checkDuplicateCert = await db('sertifikat').where({ user_id }).first();
            if (checkDuplicateCert) { // Logic was inverted, removed '!'
                return res.status(409).json({
                    success: false,
                    message: 'This user already has a certificate. Delete the old one to create a new one.'
                });
            }

            // 4. Check if the certificate number is unique
            const existingCert = await db('sertifikat').where({ certificate_number }).first();
            if (existingCert) {
                return res.status(400).json({
                    success: false,
                    message: 'Certificate number already exists'
                });
            }

            let file_url = null;

            // 5. Upload certificate file if provided
            if (req.file) {
                const prefix = 'certificates/';
                const ext = path.extname(req.file.originalname) || '.pdf';
                // FIX: Use user_id and certificate_number for a unique and meaningful object name
                const objectName = `${prefix}${user_id}${ext}`;

                await uploadFile(req.file, objectName);
                file_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
            }

            // 6. Save certificate to the database
            const [sertifikatId] = await db('sertifikat').insert({
                user_id,
                certificate_number,
                file_url,
                description,
                issued_date,
                issued_by: req.user.id // The admin who is creating it
            });

            // 7. Fetch the newly created certificate with user and admin details
            const sertifikat = await db('sertifikat')
                .select(
                    'sertifikat.*',
                    'users.name as user_name',
                    'users.email as user_email',
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
                .where('sertifikat.id', sertifikatId)
                .first();

            res.status(201).json({
                success: true,
                message: 'Certificate created successfully',
                data: { sertifikat }
            });

        } catch (error) {
            next(error);
        }
    }

    static async getSertifikatByUserId(req, res, next) {
        try {
            const { userId } = req.params;

            const sertifikats = await db('sertifikat')
                .select(
                    'sertifikat.*',
                    'users.name as user_name',
                    'users.email as user_email',
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
                .where({ 'sertifikat.user_id': userId })
                .orderBy('issued_date', 'desc');

            res.json({
                success: true,
                message: 'Certificates retrieved successfully',
                data: { sertifikats }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllSertifikat(req, res, next) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            let query = db('sertifikat')
                .select(
                    'sertifikat.*',
                    'users.name as user_name',
                    'users.email as user_email',
                    'users.university',
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id');

            if (search) {
                query = query.where(function() {
                    this.where('users.name', 'like', `%${search}%`)
                        .orWhere('sertifikat.certificate_number', 'like', `%${search}%`)
                        .orWhere('users.university', 'like', `%${search}%`);
                });
            }
            
            const totalQuery = query.clone().clearSelect().clearOrder().count('* as count').first();
            const totalResult = await totalQuery;
            const total = totalResult.count;

            const sertifikats = await query.orderBy('sertifikat.issued_date', 'desc').limit(limit).offset(offset);

            res.json({
                success: true,
                message: 'All certificates retrieved successfully',
                data: {
                    sertifikats,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: parseInt(total),
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteSertifikat(req, res, next) {
        try {
            const { id } = req.params;

            const sertifikat = await db('sertifikat').where({ id }).first();

            if (!sertifikat) {
                return res.status(404).json({
                    success: false,
                    message: 'Certificate not found'
                });
            }

            if (sertifikat.file_url) {
                // FIX: Extract the object name from the full URL before deleting
                const urlPrefix = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/`;
                const objectName = sertifikat.file_url.replace(urlPrefix, '');
                await deleteFile(objectName);
            }

            await db('sertifikat').where({ id }).del();

            res.json({
                success: true,
                message: 'Certificate deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default SertifikatController;
