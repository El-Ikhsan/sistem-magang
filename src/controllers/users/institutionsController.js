import { db } from '../../../config/database.js';
import { institutionSchema, updateInstitutionSchema } from '../../validation/users/institutionsValidation.js';

class InstitutionsController {
  static async createInstitution(req, res, next) {
      try {
        const user_id = req.user.id;
        const { error, value } = institutionSchema.validate(req.body);
  
        const { type, name, email, address, lecturer_name, whatsapp_supervisor, student_id_number } = value;
        
        if (error) {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            details: error.details.map(detail => detail.message)
          });
        }
  
  
        const institutionData = {
          user_id,
          type,
          name,
          email,
          address,
          lecturer_name,
          whatsapp_supervisor,
          student_id_number,
        };
  
        await db('institutions').insert(institutionData);

        const newInstitution = await db('institutions')
          .where({ user_id })
          .first();
        
          console.log(newInstitution);

        res.status(201).json({
          success: true,
          message: 'Institution created successfully',
          data: newInstitution,
        });
      } catch (error) {
        next(error);
      }
    }

  static async getInstitutionById(req, res, next) {
    try {

      const institution = await db('institutions').where({ user_id: req.user.id }).first();

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
      const institution = await db('institutions').where({ user_id: req.user.id }).first();

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

      await db('institutions').where({ user_id: req.user.id }).update(value);

      const updatedInstitution = await db('institutions').where({ user_id: req.user.id }).first();

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
      const institution = await db('institutions').where({ user_id: req.user.id }).first();

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found or access denied',
        });
      }

      await db('institutions').where({ user_id: req.user.id }).del();

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