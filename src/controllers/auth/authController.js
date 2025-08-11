import { db } from '../../../config/database.js'; 
import { generateToken } from '../../../config/jwt.js'; 
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema, updateSchema } from '../../validation/auth/authValidation.js'; // Assuming you have these schemas defined in a separate file
import { uploadFile, deleteFile } from '../../utils/fileUpload.js';
import { minioClient, bucketName } from '../../../config/minio.js';
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

      // Create user
      const [userId] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        status: 'active'
      });

      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'created_at')
        .where({ id: userId })
        .first();

      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
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

      // Find user
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

      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

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

    let avatar_url = null;
    const prefix = 'avatar/';

    try {
      // Pastikan prefix folder ada di MinIO
      const objects = [];
      const stream = minioClient.listObjectsV2(bucketName, prefix, true);

      stream.on('data', obj => objects.push(obj));
      await new Promise(resolve => stream.on('end', resolve));

      if (objects.length === 0) {
        await minioClient.putObject(bucketName, `${prefix}.keep`, '');
      }

      // Upload avatar baru jika ada file
      if (req.file) {
        const ext = path.extname(req.file.originalname) || '.jpg';
        const objectName = `${prefix}${req.user.id}${ext}`; // Nama file unik per user

        // Pastikan uploadFile tidak menambah prefix lagi
        const uploadedUrl = await uploadFile(req.file, objectName);

        // Simpan URL penuh dari MinIO
        avatar_url = `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucketName}/${uploadedUrl}`;
        value.avatar_url = avatar_url;
      }

      // Update profil user
      await db('users')
        .where({ id: req.user.id })
        .update(value);

      const updatedUser = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'updated_at')
        .where({ id: req.user.id })
        .first();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (uploadError) {
      if (avatar_url) {
        await deleteFile(avatar_url.replace(minioBaseUrl + '/', '')); 
      }
      throw uploadError;
    }
  } catch (error) {
    next(error);
  }
}

}

export default AuthController;
