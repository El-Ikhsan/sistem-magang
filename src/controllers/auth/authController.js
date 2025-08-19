import { db } from '../../../config/database.js';
import { generateToken, generateRefreshToken } from '../../../config/jwt.js';
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

      const { name, email, password} = value;

      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [id] = await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'inactive'
      });

      const user = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'avatar_url', 'created_at')
        .where({ id })
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
            return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(detail => detail.message) });
        }

        const { email, password } = value;
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
        const refreshToken = generateRefreshToken({ id: user.id });
        
        const REFRESH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_LIFETIME_SECONDS * 1000);
        
        // 1. Cek apakah token untuk user ini sudah ada
        const existingToken = await db('refresh_tokens').where({ user_id: user.id }).first();

        if (existingToken) {
            // 2. Jika ada, UPDATE token yang ada
            await db('refresh_tokens')
                .where({ user_id: user.id })
                .update({
                    token: refreshToken,
                    expires_at: expiresAt,
                    updated_at: new Date()
                });
        } else {
            // 3. Jika tidak ada, INSERT token baru
            await db('refresh_tokens').insert({
                user_id: user.id,
                token: refreshToken,
                expires_at: expiresAt
            });
        }
        
        
        if (user.status === 'inactive') {
            await db('users').where({ id: user.id }).update({ status: 'active' });
            user.status = 'active';
        }

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
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
}

   static async refreshToken(req, res, next) {
    try {
      // Data user sudah divalidasi dan dilampirkan oleh middleware
      const { id } = req.user;

      const user = await db('users').select('id', 'name', 'email', 'role', 'status', 'avatar_url').where({ id }).first();
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Langsung buat access token baru
      const newAccessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Access token renewed successfully',
        data: {
          user,
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

static async logout(req, res, next) {
    try {
      // Ambil user ID dari request yang sudah diproses oleh middleware autentikasi
      const userId = req.user.id;

      if (!userId) {
        // Seharusnya tidak terjadi jika middleware berjalan dengan benar
        return res.status(401).json({ success: false, message: 'Authentication error: User ID not found.' });
      }

      await db('users').where({ email: req.user.email }).update({ status: 'inactive' })

      // Hapus semua refresh token dari database yang cocok dengan user_id
      await db('refresh_tokens').where({ user_id: userId }).del();
      
      res.status(200).json({ success: true, message: 'Successfully logged out from all devices' });
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
      
      if (req.file) {
        const prefix = 'avatars/';
        const ext = path.extname(req.file.originalname) || '.jpg';
        const objectName = `${prefix}${req.user.id}${ext}`;

        if (currentUser.avatar_url) {
          const urlPrefix = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/`;
          const oldObjectName = currentUser.avatar_url.replace(urlPrefix, '');
          await deleteFile(oldObjectName);
        }

        await uploadFile(req.file, objectName);
        avatar_url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
      }
      
      const updateData = { name, email, phone };
      if (avatar_url) {
        updateData.avatar_url = avatar_url;
      }
      
      await db('users')
        .where({ id: req.user.id })
        .update(updateData);
      
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