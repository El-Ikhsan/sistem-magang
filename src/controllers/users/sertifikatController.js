import { db } from '../../../config/database.js'; 


class SertifikatController {
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
