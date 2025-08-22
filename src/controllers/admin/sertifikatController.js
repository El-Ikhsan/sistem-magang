import { db } from '../../../config/database.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { sertifikatSchema, deleteManySertifikatSchema } from '../../validation/admin/sertifikatValidation.js';
import { bucketName } from '../../../config/minio.js';

class SertifikatController {
    static async createSertifikat(req, res, next) {
        try {
            // 1. Input Validation: Ensure user_id is in the body
            const { error, value } = sertifikatSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error: user_id is required.',
                    details: error.details.map(detail => detail.message)
                });
            }
            const { user_id } = value;

            // 2. File Validation: Ensure PDF file has been uploaded
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Certificate file (PDF) must be uploaded.' });
            }

            // 3. Verify User Graduation (This logic remains the same)
            const user = await db('users').where({ id: user_id, role: 'user' }).first();
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }
            const approvedApplication = await db('pendaftaran')
                .where({ user_id, status: 'approved', status_magang: 'lulus' })
                .first();
            if (!approvedApplication) {
                return res.status(400).json({ success: false, message: 'User has not been declared as having passed the internship.' });
            }

            // 4. Delete Old Certificate (if any) (This logic remains the same)
            const existingCertificate = await db('sertifikat').where({ user_id }).first();
            if (existingCertificate) {
                if (existingCertificate.file_url) {
                    const urlPrefix = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/`;
                    const objectName = existingCertificate.file_url.replace(urlPrefix, '');
                    await deleteFile(objectName);
                }
                await db('sertifikat').where({ id: existingCertificate.id }).del();
            }

            // 5. Get Active Template to get Prefix and Description
            const activeTemplate = await db('sertifikat_configs').where({ is_active: true }).first();
            if (!activeTemplate) {
                return res.status(404).json({ success: false, message: 'No active certificate template found.' });
            }

            // 6. Create New Certificate Serial Number
            const prefix = activeTemplate.certificate_prefix;
            const lastCertificate = await db('sertifikat')
                .where({ certificate_prefix: prefix })
                .orderBy('certificate_sequence', 'desc')
                .first();
            
            const newSequence = lastCertificate ? lastCertificate.certificate_sequence + 1 : 1;

            // 7. Upload File Received from Frontend
            const objectName = `certificates/${user_id}.pdf`;
            await uploadFile(req.file, objectName);
            const file_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;

            // 8. Save New Certificate Record to Database
            await db('sertifikat').insert({
                user_id,
                certificate_prefix: prefix,
                certificate_sequence: newSequence,
                file_url,
                description: activeTemplate.description, // Description taken from template
                issued_date: new Date(),
                issued_by: req.user.id // ID of the currently logged-in admin
            });

            // 9. Get Complete Data for Response
            const newCertificate = await db('sertifikat')
                .select(
                    'sertifikat.*',
                    'users.name as user_name',
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
                .where("sertifikat.user_id", user_id)
                .first();

            res.status(201).json({
                success: true,
                message: 'Certificate successfully uploaded and saved.',
                data: { sertifikat: newCertificate }
            });

        } catch (error) {
            next(error);
        }
    }
    static async getSertifikatByUserId(req, res, next) {
        try {
            const { id } = req.params;

            const sertifikats = await db('sertifikat')
                .select(
                    'sertifikat.*',
                    'users.name as user_name',
                    'users.email as user_email',
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
                .where({ 'sertifikat.user_id': id })
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
                    'institutions.name as institution_name', // TAMBAHKAN: Ambil nama institusi
                    'admin.name as issued_by_name'
                )
                .leftJoin('users', 'sertifikat.user_id', 'users.id')
                .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
                .leftJoin('institutions', 'users.id', 'institutions.user_id'); // TAMBAHKAN: Join ke tabel institutions

            if (search) {
                query = query.where(function() {
                    this.where('users.name', 'like', `%${search}%`)
                        .orWhere('sertifikat.certificate_number', 'like', `%${search}%`)
                        .orWhere('institutions.name', 'like', `%${search}%`); // TAMBAHKAN: Cari juga di nama institusi
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

    static async deleteManySertifikat(req, res, next) {
        try {
            // 1. Validasi input
            const { error, value } = deleteManySertifikatSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details.map(d => d.message)
                });
            }
            const { ids } = value;

            // 2. Ambil data sertifikat yang akan dihapus untuk mendapatkan file_url
            const sertifikatsToDelete = await db('sertifikat')
                .whereIn('id', ids)
                .select('id', 'file_url');

            if (sertifikatsToDelete.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No matching certificates found to delete.'
                });
            }

            // 3. Hapus file-file terkait dari MinIO
            const deleteFilePromises = sertifikatsToDelete.map(sertifikat => {
                if (sertifikat.file_url) {
                    const urlPrefix = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/`;
                    const objectName = sertifikat.file_url.replace(urlPrefix, '');
                    return deleteFile(objectName);
                }
                return Promise.resolve(); // Kembalikan promise yang langsung selesai jika tidak ada file
            });

            // Jalankan semua promise penghapusan file secara paralel
            await Promise.all(deleteFilePromises);

            // 4. Hapus record sertifikat dari database
            const deletedCount = await db('sertifikat').whereIn('id', ids).del();

            res.status(200).json({
                success: true,
                message: `${deletedCount} certificate(s) deleted successfully.`
            });

        } catch (error) {
            next(error);
        }
    }
}

export default SertifikatController;
