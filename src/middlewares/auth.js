import { db } from '../../config/database.js'; 
import { verifyToken, verifyRefreshToken } from '../../config/jwt.js';

const authenticate = async (req, res, next) => {
  let token;

  // 1. Coba ambil token dari header Authorization
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }

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
  
  // 1. Coba ambil token dari header x-refresh-token
  token = req.headers['x-refresh-token'];
  
  // 2. Jika tidak ada di header, coba ambil dari cookie
  if (!token && req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token is missing' });
  }

  try {
    // Langkah 1: Verifikasi apakah token valid secara kriptografis (signature & expiration)
    const decoded = verifyRefreshToken(token, process.env.JWT_REFRESH_SECRET);

    // Langkah 2: Cek apakah token ada di database (paling penting!)
    const storedToken = await db('refresh_tokens').where({ token: token }).first();
    
    if (!storedToken) {
      // Jika token tidak ada di DB, berarti sudah di-logout atau tidak sah
      return res.status(403).json({ success: false, message: 'Invalid refresh token. Please login again.' });
    }

    // Jika semua aman, lampirkan data user ke request
    req.user = { id: decoded.id, email: decoded.email };
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ success: false, message: 'Refresh token has expired or is invalid.' });
    }
    // Untuk error lainnya
    next(error);
  }
};

export { authenticate, refreshTokenMiddleware };
