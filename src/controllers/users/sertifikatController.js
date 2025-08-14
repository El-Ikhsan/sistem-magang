import { db } from '../../../config/database.js'; 
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { bucketName } from '../../../config/minio.js';
import { sertifikatSchema } from '../../validation/users/sertifikatValidation.js';
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
  
          const { certificate_number, description, issued_date } = value;
          const user_id = req.user.id

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

  static async getMySertifikat(req, res, next) {
    try {
      const sertifikats = await db('sertifikat')
        .select(
          'sertifikat.*',
          'admin.name as issued_by_name'
        )
        .leftJoin('users as admin', 'sertifikat.issued_by', 'admin.id')
        .where({ user_id: req.user.id })
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
}

export default SertifikatController;
