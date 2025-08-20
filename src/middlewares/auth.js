import { db } from '../../config/database.js'; 
import { verifyToken, verifyRefreshToken } from '../../config/jwt.js';

const authenticate = async (req, res, next) => {
  let token;

  token = req.headers.authorization?.split(" ")[1];

  if (!token && req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. No token provided.'
    });
  }

  try {

    const decoded = verifyToken(token);
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const refreshTokenMiddleware = async (req, res, next) => {

  let token;

  token = req.headers['x-refresh-token'];

  if (!token && req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token is missing' });
  }

  try {
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
