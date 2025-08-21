import { db } from '../../../config/database.js';
import { updateInstitutionSchema } from '../../validation/admin/institutionsValidation.js';

class InstitutionsController {
  static async getInstitutions(req, res, next) {
    try {
      const institutions = await db('institutions');

      res.json({
        success: true,
        message: 'Institutions retrieved successfully',
        data: institutions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutionById(req, res, next) {
    try {
      const { id } = req.params;

      const institution = await db('institutions').where({ id }).first();

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found or access denied',
        });
      }

      res.json({
        success: true,
        message: 'Institution retrieved successfully',
        data: institution,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInstitution(req, res, next) {
    try {
      const { id } = req.params;
      const institution = await db('institutions').where({ id }).first();

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found or access denied',
        });
      }

      const { error, value } = updateInstitutionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      await db('institutions').where({ id }).update(value);

      const updatedInstitution = await db('institutions').where({ id }).first();

      res.json({
        success: true,
        message: 'Institution updated successfully',
        data: updatedInstitution,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteInstitution(req, res, next) {
    try {
      const { id } = req.params;

      const institution = await db('institutions').where({ id }).first();

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found or access denied',
        });
      }

      await db('institutions').where({ id }).del();

      res.status(200).json({
        success: true,
        message: 'Institution deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InstitutionsController;