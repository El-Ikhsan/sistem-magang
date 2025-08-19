import { db } from '../../config/database.js'; 
import { verifyToken, verifyRefreshToken } from '../../config/jwt.js';
import jwt from 'jsonwebtoken';

const authenticate = async (req, res, next) => {
  let token;

  // 1. Coba ambil token dari header Authorization
  token = req.headers.authorization?.split(" ")[1];

  // 2. Jika tidak ada di header, coba ambil dari cookie
  if (!token && req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  // 3. Jika token tidak ditemukan sama sekali
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. No token provided.'
    });
  }

  try {
    // 4. Verifikasi token
    const decoded = verifyToken(token);

    // 5. Cari pengguna yang aktif di database
    const user = await db('users')
      .select('id', 'name', 'email', 'role', 'status')
      .where({ id: decoded.id, status: 'active' })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found or inactive.'
      });
    }

    // 6. Lampirkan pengguna ke request dan lanjutkan
    req.user = user;
    next();
  } catch (error) {
    // Tangani error jika token tidak valid atau kadaluarsa
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const refreshTokenMiddleware = async (req, res, next) => {
  let token;
  
  // 1. Coba ambil token dari header Authorization
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // 2. Jika tidak ada di header Authorization, coba ambil dari header x-refresh-token
  if (!token) {
    token = req.headers['x-refresh-token'];
  }
  
  // 3. Jika tidak ada di header, coba ambil dari cookie
  if (!token && req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token is missing' });
  }

  try {
    // Langkah 1: Verifikasi apakah token valid secara kriptografis (signature & expiration)
    const decoded = verifyRefreshToken(token);

    // Langkah 2: Cek apakah token ada di database (paling penting!)
    const storedToken = await db('refresh_tokens').where({ token: token }).first();
    
    if (!storedToken) {
      // Jika token tidak ada di DB, berarti sudah di-logout atau tidak sah
      return res.status(403).json({ success: false, message: 'Invalid refresh token. Please login again.' });
    }

    // Jika semua aman, lampirkan data user ke request
    req.user = { id: decoded.id };
    next();

  } catch (error) {
    console.error('Refresh token verification error:', error);
    return res.status(403).json({ success: false, message: 'Refresh token has expired or is invalid.' });
  }
};

export { authenticate, refreshTokenMiddleware };
