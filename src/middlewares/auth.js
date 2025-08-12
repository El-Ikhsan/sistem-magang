import { db } from '../../config/database.js'; 
import { verifyToken } from '../../config/jwt.js';

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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await db('users')
        .where({ id: decoded.id, status: 'active' })
        .first();
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

export { authenticate, authorize, optionalAuth };
