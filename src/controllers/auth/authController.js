import { db } from '../../../config/database.js';
import { generateToken } from '../../../config/jwt.js';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema, updateSchema } from '../../validation/auth/authValidation.js';
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { bucketName } from '../../../config/minio.js';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

class AuthController {
  static async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const { name, email, password, role } = value;

      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user and get the ID
      // Note: .returning('id') is more efficient for PostgreSQL, but this works for all DBs
      const [userId] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        status: 'active'
      });

      // Fetch the created user without the password
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'created_at')
        .where({ id: userId })
        .first();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const { email, password } = value;

      // Find user by email and ensure they are active
      const user = await db('users').where({ email, status: 'active' }).first();
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Prepare user data to return (without password)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'created_at')
        .where({ id: req.user.id })
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const { name, email, phone } = value;
      let avatar_url = null;

      if (email) {
        const existingUserWithEmail = await db('users')
          .where('email', email)
          .andWhereNot('id', req.user.id) 
          .first();
        if (existingUserWithEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another account'
          });
        }
      }
      
      const currentUser = await db('users').where({ id: req.user.id }).first();
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Handle avatar upload to MinIO
      if (req.file) {
        const prefix = 'avatars/';
        const ext = path.extname(req.file.originalname) || '.jpg';
        const objectName = `${prefix}${req.user.id}${ext}`;

        // Delete old avatar if it exists
        if (currentUser.avatar_url) {
          const urlPrefix = `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucketName}/`;
          const oldObjectName = currentUser.avatar_url.replace(urlPrefix, '');
          await deleteFile(oldObjectName);
        }

        await uploadFile(req.file, objectName);
        avatar_url = `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucketName}/${objectName}`;
      }

      // Prepare data for update
      const updateData = { name, email, phone };
      if (avatar_url) {
        updateData.avatar_url = avatar_url;
      }

      // Update user in the database
      await db('users')
        .where({ id: req.user.id })
        .update(updateData);

      // Fetch the fully updated user data to return
      const updatedUser = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'created_at')
        .where({ id: req.user.id })
        .first();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
