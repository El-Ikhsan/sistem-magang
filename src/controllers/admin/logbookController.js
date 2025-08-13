import { db } from '../../../config/database.js'; 
import { validateSchema, bulkValidateSchema } from '../../validation/admin/logbookValidation.js';

class LogbookController {
  static async getAllLogbook(req, res, next) {
    try {
      const { page = 1, limit = 10, status, user_id, search } = req.query;
      const offset = (page - 1) * limit;

      let query = db('logbook')
        .select(
          'logbook.*',
          'users.name as user_name',
          'users.email as user_email',
          'institutions.name as institution_name' // Ambil dari tabel institutions
        )
        .leftJoin('users', 'logbook.user_id', 'users.id')
        .leftJoin('institutions', 'users.id', 'institutions.user_id') // Join ke tabel institutions
        .orderBy('logbook.tanggal', 'desc');

      if (status) {
        query = query.where('logbook.status', status);
      }
      if (user_id) {
        query = query.where('logbook.user_id', user_id);
      }
      if (search) {
        query = query.where(function() {
          this.where('users.name', 'like', `%${search}%`)
              .orWhere('logbook.kegiatan', 'like', `%${search}%`)
              .orWhere('institutions.name', 'like', `%${search}%`); // Cari juga di nama institusi
        });
      }

      const totalResult = await query.clone().count('* as count').first();
      const total = totalResult.count;
      const logbooks = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        message: 'All logbook entries retrieved successfully',
        data: {
          logbooks,
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

  static async validateLogbook(req, res, next) {
    try {
      const { id } = req.params;
      const { status, admin_feedback } = req.body;

      const { error } = validateSchema.validate({ status, admin_feedback });
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }

      const logbook = await db('logbook').where({ id }).first();
      if (!logbook) {
        return res.status(404).json({ success: false, message: 'Logbook entry not found' });
      }

      await db('logbook')
        .where({ id })
        .update({
          status,
          admin_feedback,
          validated_by: req.user.id,
          validated_at: new Date(),
          updated_at: new Date()
        });

      const updatedLogbook = await db('logbook')
        .select('logbook.*', 'users.name as user_name')
        .leftJoin('users', 'logbook.user_id', 'users.id')
        .where('logbook.id', id)
        .first();

      res.json({ success: true, message: `Logbook entry ${status} successfully`, data: { logbook: updatedLogbook } });
    } catch (error) {
      next(error);
    }
  }

  static async validateManyLogbook(req, res, next) {
    try {
      const { error, value } = bulkValidateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }
      const { ids, status, admin_feedback } = value;

      // Update semua logbook yang ID-nya ada di dalam array dan statusnya masih 'pending'
      const updatedCount = await db('logbook')
        .whereIn('id', ids)
        .update({
          status,
          admin_feedback,
          validated_by: req.user.id,
          validated_at: new Date(),
          updated_at: new Date()
        });
      
      if (updatedCount === 0) {
        return res.status(404).json({ success: false, message: 'No pending logbook entries found for the given IDs.' });
      }

      res.status(200).json({ success: true, message: `${updatedCount} logbook(s) have been ${status}.` });
    } catch (error) {
      next(error);
    }
  }
}

export default LogbookController;