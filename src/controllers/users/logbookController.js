import { db } from '../../../config/database.js'; 
import { logbookSchema } from '../../validation/users/logbookValidation.js';

class LogbookController {
  static async createLogbook(req, res, next) {
    try {
      const { error, value } = logbookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if user has approved internship
      const approvedApplication = await db('pendaftaran')
        .where({ 
          user_id: req.user.id,
          status: 'approved'
        })
        .first();

      if (!approvedApplication) {
        return res.status(403).json({
          success: false,
          message: 'You must have an approved internship application to create logbook entries'
        });
      }

      const { tanggal, kegiatan, deskripsi, jam_mulai, jam_selesai } = value;

      // Check if logbook for this date already exists
      const existingLogbook = await db('logbook')
        .where({ 
          user_id: req.user.id,
          tanggal 
        })
        .first();

      if (existingLogbook) {
        return res.status(400).json({
          success: false,
          message: 'Logbook entry for this date already exists'
        });
      }

      const [logbookId] = await db('logbook').insert({
        user_id: req.user.id,
        tanggal,
        kegiatan,
        deskripsi,
        jam_mulai,
        jam_selesai,
        status: 'pending'
      });

      const logbook = await db('logbook')
        .select('*')
        .where({ id: logbookId })
        .first();

      res.status(201).json({
        success: true,
        message: 'Logbook entry created successfully',
        data: { logbook }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyLogbook(req, res, next) {
    try {
      const { page = 1, limit = 10, status, month, year } = req.query;
      const offset = (page - 1) * limit;

      let query = db('logbook')
        .select('*')
        .where({ user_id: req.user.id })
        .orderBy('tanggal', 'desc');

      if (status) {
        query = query.where('status', status);
      }

      if (month && year) {
        query = query.whereRaw('MONTH(tanggal) = ? AND YEAR(tanggal) = ?', [month, year]);
      } else if (year) {
        query = query.whereRaw('YEAR(tanggal) = ?', [year]);
      }

      const total = await query.clone().count('* as count').first();
      const logbooks = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        message: 'Logbook entries retrieved successfully',
        data: {
          logbooks,
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

  static async updateLogbook(req, res, next) {
    try {
      const { id } = req.params;

      const logbook = await db('logbook')
        .where({ 
          id,
          user_id: req.user.id 
        })
        .first();

      if (!logbook) {
        return res.status(404).json({
          success: false,
          message: 'Logbook entry not found or access denied'
        });
      }

      if (logbook.status === 'validated') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update validated logbook entry'
        });
      }

      const { error, value } = logbookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      await db('logbook')
        .where({ id })
        .update({
          ...value,
          status: 'pending',
          updated_at: new Date()
        });

      const updatedLogbook = await db('logbook')
        .select('*')
        .where({ id })
        .first();

      res.json({
        success: true,
        message: 'Logbook entry updated successfully',
        data: { logbook: updatedLogbook }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LogbookController;