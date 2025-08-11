import { db } from '../../../config/database.js'; 
import { verifySchema, statusSchema } from '../../validation/admin/pendaftaranValidation.js';


class PendaftaranController {
  static async getAllPendaftaran(req, res, next) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      let query = db('pendaftaran')
        .select(
          'pendaftaran.*',
          'users.name as user_name',
          'users.email as user_email',
          'users.university',
          'users.major',
          'users.npm',
          'admin.name as approved_by_name'
        )
        .leftJoin('users', 'pendaftaran.user_id', 'users.id')
        .leftJoin('users as admin', 'pendaftaran.approved_by', 'admin.id')
        .orderBy('pendaftaran.created_at', 'desc');

      if (status) {
        query = query.where('pendaftaran.status', status);
      }

      if (search) {
        query = query.where(function() {
          this.where('users.name', 'like', `%${search}%`)
              .orWhere('users.email', 'like', `%${search}%`)
              .orWhere('users.university', 'like', `%${search}%`);
        });
      }

      const total = await query.clone().count('* as count').first();
      const applications = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        message: 'Applications retrieved successfully',
        data: {
          applications,
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

  static async verifyPendaftaran(req, res, next) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const { error } = verifySchema.validate({ status, admin_notes });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const application = await db('pendaftaran')
        .where({ id })
        .first();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      await db('pendaftaran')
        .where({ id })
        .update({
          status,
          admin_notes,
          approved_by: req.user.id,
          approved_at: new Date(),
          updated_at: new Date()
        });

      const updatedApplication = await db('pendaftaran')
        .select(
          'pendaftaran.*',
          'users.name as user_name',
          'users.email as user_email'
        )
        .leftJoin('users', 'pendaftaran.user_id', 'users.id')
        .where('pendaftaran.id', id)
        .first();

      res.json({
        success: true,
        message: `Application ${status} successfully`,
        data: { application: updatedApplication }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatusMagang(req, res, next) {
    try {
      const { id } = req.params;
      const { status_magang } = req.body;

      const { error } = statusSchema.validate({ status_magang });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const application = await db('pendaftaran')
        .where({ id })
        .first();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      if (application.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Can only update status for approved applications'
        });
      }

      await db('pendaftaran')
        .where({ id })
        .update({
          status_magang,
          updated_at: new Date()
        });

      const updatedApplication = await db('pendaftaran')
        .select(
          'pendaftaran.*',
          'users.name as user_name',
          'users.email as user_email',
          'users.university',
          'users.major'
        )
        .leftJoin('users', 'pendaftaran.user_id', 'users.id')
        .where('pendaftaran.id', id)
        .first();

      res.json({
        success: true,
        message: `Internship status updated to ${status_magang} successfully`,
        data: { application: updatedApplication }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PendaftaranController;