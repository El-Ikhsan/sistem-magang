import { db } from '../../../config/database.js'; 
import { uploadFile, deleteFile, getFileUrl } from '../../utils/fileUpload.js';
import { sertifikatSchema } from '../../validation/admin/sertifikatValidation.js';
import { minioClient, bucketName } from '../../../config/minio.js';
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

    // Cek user dengan role 'user'
    const user = await db('users').where({ id: user_id, role: 'user' }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cek apakah punya pendaftaran magang approved
    const approvedApplication = await db('pendaftaran')
      .where({ user_id, status: 'approved' })
      .first();

    if (!approvedApplication) {
      return res.status(400).json({
        success: false,
        message: 'User must have approved internship application'
      });
    }

    // Cek certificate_number unik
    const existingCert = await db('sertifikat')
      .where({ certificate_number })
      .first();

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number already exists'
      });
    }

    let file_url = null;

    try {
      const prefix = 'certificates/';
      const objects = [];
      const stream = minioClient.listObjectsV2(bucketName, prefix, true);

      stream.on('data', obj => objects.push(obj));
      await new Promise(resolve => stream.on('end', resolve));

      if (objects.length === 0) {
        await minioClient.putObject(bucketName, `${prefix}.keep`, '');
      }

      // Upload file sertifikat
      if (req.file) {
        const ext = path.extname(req.file.originalname) || '.pdf';
        const objectName = `${prefix}${user_id}-${Date.now()}${ext}`;

        await uploadFile(req.file, objectName);

        file_url = `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucketName}/${objectName}`;
      }

      const [sertifikatId] = await db('sertifikat').insert({
        user_id,
        certificate_number,
        file_url,
        description,
        issued_date,
        issued_by: req.user.id
      });

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
    } catch (uploadError) {
      if (file_url) await deleteFile(file_url);
      throw uploadError;
    }
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
        .where({ user_id: userId })
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
        .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
        .orderBy('sertifikat.issued_date', 'desc');

      if (search) {
        query = query.where(function() {
          this.where('users.name', 'like', `%${search}%`)
              .orWhere('sertifikat.certificate_number', 'like', `%${search}%`)
              .orWhere('users.university', 'like', `%${search}%`);
        });
      }

      const total = await query.clone().count('* as count').first();
      const sertifikats = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        message: 'All certificates retrieved successfully',
        data: {
          sertifikats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total.count,
            pages: Math.ceil(total.count / limit)
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

      const sertifikat = await db('sertifikat')
        .where({ id })
        .first();

      if (!sertifikat) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      // Delete file from MinIO if exists
      if (sertifikat.file_url) {
        await deleteFile(sertifikat.file_url);
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
