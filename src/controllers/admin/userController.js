import { db } from '../../../config/database.js'; // Sesuaikan path ke config database Anda
import bcrypt from 'bcryptjs';
import { createUserSchema, updateUserSchema, deleteManySchema } from '../../validation/admin/userValidation.js';

class UserAdminController {
  static async createNewUser(req, res, next) {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }

      const { name, email, password, role, status } = value;

      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Langkah 1: Insert data dan dapatkan ID dari baris yang baru dibuat.
      const [newUserId] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role,
        status,
      });

      // Langkah 2: Fetch data lengkap user yang baru dibuat menggunakan ID tersebut.
      const newUser = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'created_at')
        .where({ id: newUserId })
        .first();

      res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const query = db('users').select('id', 'name', 'email', 'role', 'status', 'created_at');

      if (search) {
        query.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`);
      }

      const users = await query.limit(limit).offset(offset).orderBy('created_at', 'desc');
      const [{ total }] = await db('users').count('id as total');

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
          total: parseInt(total, 10),
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await db('users').select('id', 'name', 'email', 'role', 'status', 'created_at', 'updated_at').where({ id }).first();

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'User retrieved successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }

      if (value.email) {
        const existingUser = await db('users').where('email', value.email).andWhereNot('id', id).first();
        if (existingUser) {
          return res.status(409).json({ success: false, message: 'Email is already in use by another account' });
        }
      }
      
      const updateData = { ...value };
      if (value.password && value.password.length > 0) {
        updateData.password = await bcrypt.hash(value.password, 12);
      } else {
        delete updateData.password;
      }

      const updatedCount = await db('users').where({ id }).update(updateData);
      if (updatedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updatedUser = await db('users').select('id', 'name', 'email', 'role', 'status').where({ id }).first();
      res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const deletedCount = await db('users').where({ id }).del();
      
      if (deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteManyUsers(req, res, next) {
    try {
      const { error, value } = deleteManySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d => d.message) });
      }

      const { ids } = value;
      const deletedCount = await db('users').whereIn('id', ids).del();
      
      res.status(200).json({ success: true, message: `${deletedCount} users deleted successfully` });
    } catch (error) {
      next(error);
    }
  }
}

export default UserAdminController;