import { db } from '../../../config/database.js'; 
import { logbookSchema, updateLogbookSchema, deleteManySchema } from '../../validation/users/logbookValidation.js';

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

      const approvedApplication = await db('pendaftaran')
        .where('user_id', req.user.id)
        .whereIn('status', ['approved'])
        .first();

      if (!approvedApplication) {
        return res.status(403).json({
          success: false,
          message: 'You must have an approved internship application to create logbook entries'
        });
      }

      // TAMBAHKAN: Ambil 'kehadiran' dari value yang sudah divalidasi
      const { tanggal, kehadiran, kegiatan, deskripsi, jam_mulai, jam_selesai } = value;
      const formattedDate = new Date(tanggal).toISOString().split('T')[0];

       const existingActiveLogbook = await db('logbook')
          .where({
              user_id: req.user.id,
              tanggal: formattedDate 
          })
          .whereIn('status', ['pending', 'validated']) 
          .first();

      if (existingActiveLogbook) {
          return res.status(409).json({ // 409 Conflict lebih cocok
              success: false,
              message: 'You already have an active (pending or validated) logbook entry for this date.'
          });
      }

      // Buat objek untuk dimasukkan ke database
      const logbookData = {
        user_id: req.user.id,
        tanggal,
        kehadiran, // TAMBAHKAN: Sertakan 'kehadiran'
        // Jika izin/sakit, pastikan field lain bernilai null atau default
        kegiatan: ['izin', 'sakit'].includes(kehadiran) ? `Keterangan: ${kehadiran.charAt(0).toUpperCase() + kehadiran.slice(1)}` : kegiatan,
        deskripsi: ['izin', 'sakit'].includes(kehadiran) ? null : deskripsi,
        jam_mulai: ['izin', 'sakit'].includes(kehadiran) ? null : jam_mulai,
        jam_selesai: ['izin', 'sakit'].includes(kehadiran) ? null : jam_selesai,
        status: 'pending'
      };

      await db('logbook').insert(logbookData);

      
      const logbook = await db('logbook')
        .select('*')
        .where({
          user_id: req.user.id,
          tanggal: formattedDate
        })
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
        .select('*') // 'kehadiran' akan otomatis ikut terseleksi
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

      const totalResult = await query.clone().count('* as count').first();
      const total = totalResult.count;
      const logbooks = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        message: 'Logbook entries retrieved successfully',
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

      const { error, value } = updateLogbookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // UPDATE: Logika update yang lebih cerdas
      const { kehadiran } = value;
      const updateData = {
        ...value,
        // Jika status diubah menjadi izin/sakit, kosongkan field terkait
        kegiatan: ['izin', 'sakit'].includes(kehadiran) ? `Keterangan: ${kehadiran.charAt(0).toUpperCase() + kehadiran.slice(1)}` : value.kegiatan,
        deskripsi: ['izin', 'sakit'].includes(kehadiran) ? null : value.deskripsi,
        jam_mulai: ['izin', 'sakit'].includes(kehadiran) ? null : value.jam_mulai,
        jam_selesai: ['izin', 'sakit'].includes(kehadiran) ? null : value.jam_selesai,
        status: 'pending', // Setel ulang status menjadi pending setelah update
        updated_at: new Date()
      };

      await db('logbook')
        .where({ id })
        .update(updateData);

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

  static async deleteLogbook(req, res, next) {
    try {
      const { id } = req.params;

      // Cari logbook berdasarkan ID dan pastikan milik user yang sedang login
      const logbook = await db('logbook')
        .where({ id, user_id: req.user.id })
        .first();

      if (!logbook) {
        return res.status(404).json({ success: false, message: 'Logbook entry not found or access denied.' });
      }

      // Syarat: Hanya bisa hapus jika status 'pending'
      if (logbook.status !== 'pending') {
        return res.status(403).json({ success: false, message: 'Only logbook entries with "pending" status can be deleted.' });
      }

      await db('logbook').where({ id }).del();

      res.status(200).json({ success: true, message: 'Logbook entry deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteManyLogbook(req, res, next) {
    try {
      const { error, value } = deleteManySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }
      const { ids } = value;

      // Ambil semua logbook yang akan dihapus untuk validasi status dan kepemilikan
      const logbooksToDelete = await db('logbook')
        .whereIn('id', ids)
        .andWhere('user_id', req.user.id) // Pastikan hanya milik user ini
        .select('id', 'status');

      // Filter hanya ID yang boleh dihapus (status 'pending')
      const deletableIds = logbooksToDelete
        .filter(logbook => logbook.status === 'pending')
        .map(logbook => logbook.id);

      if (deletableIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No deletable logbook entries found (must be your own and have "pending" status).' });
      }

      const deletedCount = await db('logbook').whereIn('id', deletableIds).del();

      res.status(200).json({ success: true, message: `${deletedCount} logbook entry(s) deleted successfully.` });
    } catch (error) {
      next(error);
    }
  }
}

export default LogbookController;