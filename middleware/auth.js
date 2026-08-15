/**
 * @file middleware/auth.js
 * @description Middleware Keamanan Autentikasi JWT (JSON Web Token) untuk melindungi route-route khusus Admin.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi apakah request yang masuk menyertakan Token JWT Admin yang valid.
 */
module.exports = function authMiddleware(req, res, next) {
  // Ambil header 'Authorization' dari HTTP Request
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Akses Ditolak: Token autentikasi Admin tidak ditemukan.'
    });
  }

  // Mendapatkan token murni jika formatnya 'Bearer <token>'
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'segandu_secret_key_2026';
    // Verifikasi enkripsi token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // Lampirkan data payload admin ke objek request
    next(); // Lanjutkan ke controller berikutnya
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali.'
    });
  }
};
