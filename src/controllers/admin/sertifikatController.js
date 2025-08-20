import { db } from '../../../config/database.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { sertifikatSchema, deleteManySertifikatSchema } from '../../validation/admin/sertifikatValidation.js';
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

        // Langkah 1 & 2 tetap sama
        const user = await db('users').where({ id: user_id, role: 'user' }).first();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or is not a valid user' });
        }
        const approvedApplication = await db('pendaftaran')
            .where({ user_id, status: 'approved', status_magang: 'lulus' })
            .first();
        if (!approvedApplication) {
            return res.status(400).json({ success: false, message: 'User must have an "approved" and "lulus" status-magang' });
        }

        // Langkah 3: Cek dan hapus otomatis sertifikat lama
        const existingCertificate = await db('sertifikat').where({ user_id }).first();
        if (existingCertificate) {
            // Jika ada file lama, hapus dari MinIO
            if (existingCertificate.file_url) {
                const urlPrefix = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/`;
                const objectName = existingCertificate.file_url.replace(urlPrefix, '');
                await deleteFile(objectName);
            }
            // Hapus record lama dari database
            await db('sertifikat').where({ id: existingCertificate.id }).del();
        }

        // Langkah 4: Cek keunikan nomor sertifikat BARU
        const certWithSameNumber = await db('sertifikat').where({ certificate_number }).first();
        if (certWithSameNumber) {
            return res.status(400).json({ success: false, message: 'New certificate number already exists' });
        }

        let file_url = null;
        // Langkah 5: Upload file baru (jika ada)
        if (req.file) {
            const prefix = 'certificates/';
            const ext = path.extname(req.file.originalname) || '.pdf';
            const objectName = `${prefix}${user_id}-${certificate_number}${ext}`; // Nama file lebih unik
            await uploadFile(req.file, objectName);
            file_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
        }

        // Langkah 6: Simpan sertifikat BARU ke database
        await db('sertifikat').insert({
            user_id,
            certificate_number,
            file_url,
            description,
            issued_date,
            issued_by: req.user.id
        });

        // Langkah 7: Ambil kembali data yang baru dibuat untuk respons
        const newCertificate = await db('sertifikat')
            .select(
                'sertifikat.*',
                'users.name as user_name',
                'institutions.name as institution_name',
                'admin.name as issued_by_name'
            )
            .leftJoin('users', 'sertifikat.user_id', 'users.id')
            .leftJoin('institutions', 'sertifikat.user_id', 'institutions.user_id')
            .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
            .where('sertifikat.certificate_number', certificate_number)
            .first();

        res.status(201).json({
            success: true,
            message: 'Certificate created successfully. Old certificate (if any) has been replaced.',
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
