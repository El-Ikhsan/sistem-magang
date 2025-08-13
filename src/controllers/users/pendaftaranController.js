import { db } from '../../../config/database.js'; 
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { pendaftaranSchema } from '../../validation/users/pendaftaranValidation.js';

class PendaftaranController {
  static async submitPendaftaran(req, res, next) {
    try {
      const { error, value } = pendaftaranSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const { motivation_letter, start_date, end_date } = value;

      // Check if user already has pending or approved application
      const existingApplication = await db('pendaftaran')
        .where('user_id', req.user.id) 
        .whereIn('status', ['pending', 'approved']) 
        .first();

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active application'
        });
      }

      let ktp_file_path = null;
      let cv_file_path = null;
      let certificate_file_path = null;

      try {
        // Upload files if provided
        if (req.files?.ktp) {
          ktp_file_path = await uploadFile(req.files.ktp[0], 'documents');
        }
        if (req.files?.cv) {
          cv_file_path = await uploadFile(req.files.cv[0], 'documents');
        }
        if (req.files?.certificate) {
          certificate_file_path = await uploadFile(req.files.certificate[0], 'documents');
        }

        // Create application
        const [id] = await db('pendaftaran').insert({
          user_id: req.user.id,
          motivation_letter,
          start_date,
          end_date,
          ktp_file_path,
          cv_file_path,
          certificate_file_path,
          status: 'pending'
        });

        const application = await db('pendaftaran')
          .select('*')
          .where({ id })
          .first();

        res.status(201).json({
          success: true,
          message: 'Application submitted successfully',
          data: { application }
        });
      } catch (uploadError) {
        // Clean up uploaded files if database insert fails
        if (ktp_file_path) await deleteFile(ktp_file_path);
        if (cv_file_path) await deleteFile(cv_file_path);
        if (certificate_file_path) await deleteFile(certificate_file_path);
        throw uploadError;
      }
    } catch (error) {
      next(error);
    }
  }

  static async getMyPendaftaran(req, res, next) {
    try {
      const application = await db('pendaftaran')
        .select('*')
        .where({ user_id: req.user.id })
        .first();

      res.json({
        success: true,
        message: 'Application retrieved successfully',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PendaftaranController;