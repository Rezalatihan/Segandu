/**
 * @file controllers/authController.js
 * @description Controller untuk menangani autentikasi login Admin Segandu dan pembuatan JWT Token.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { checkMongoConnection } = require('../config/db');

/**
 * Memproses autentikasi Admin Segandu dan mengembalikan JWT Token jika kredensial cocok.
 * Kredensial default: Username = Segandu | Password = Getthefest
 * 
 * @route POST /api/admin/login
 * @access Public
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET || 'segandu_secret_key_2026';

    // 1. Validasi kelengkapan input
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username dan Password wajib diisi!' });
    }

    let adminUser = null;
    const isMongoConnected = checkMongoConnection();

    // 2. Pencarian akun Admin di database MongoDB Atlas
    if (isMongoConnected) {
      adminUser = await Admin.findOne({ username });
    } else {
      // Mode fallback jika database offline
      if (username === 'Segandu' && password === 'Getthefest') {
        adminUser = { username: 'Segandu' };
      }
    }

    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Username atau Password Admin salah!' });
    }

    // 3. Verifikasi enkripsi password menggunakan bcrypt
    if (isMongoConnected && adminUser.password) {
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Username atau Password Admin salah!' });
      }
    }

    // 4. Buat JWT Token berdurasi 24 jam
    const token = jwt.sign(
      { username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: token,
      username: adminUser.username,
      message: 'Login Admin Segandu berhasil!'
    });
  } catch (err) {
    console.error('❌ Error saat login admin Segandu:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Memperbarui Username dan Password Admin di MongoDB Atlas.
 * 
 * @route PUT /api/admin/profile
 * @access Private (Admin JWT Required)
 */
exports.updateAdminProfile = async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    const currentAdminUsername = req.admin ? req.admin.username : 'Segandu';
    const JWT_SECRET = process.env.JWT_SECRET || 'segandu_secret_key_2026';

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Password saat ini wajib diisi untuk verifikasi keamanan!' });
    }

    const isMongoConnected = checkMongoConnection();
    if (!isMongoConnected) {
      return res.status(500).json({ success: false, error: 'Database MongoDB offline. Gagal memperbarui profil admin.' });
    }

    // Cari admin saat ini
    const adminUser = await Admin.findOne({ username: currentAdminUsername }) || await Admin.findOne();

    if (!adminUser) {
      return res.status(404).json({ success: false, error: 'Akun Admin tidak ditemukan di database.' });
    }

    // Verifikasi password saat ini
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Password saat ini tidak cocok!' });
    }

    // Jika username baru diisi dan berbeda, cek ketersediaan
    if (newUsername && newUsername.trim() !== '' && newUsername !== adminUser.username) {
      const existingUser = await Admin.findOne({ username: newUsername.trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, error: `Username "${newUsername}" sudah digunakan admin lain.` });
      }
      adminUser.username = newUsername.trim();
    }

    // Jika password baru diisi, hash dan perbarui
    if (newPassword && newPassword.trim() !== '') {
      adminUser.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    await adminUser.save();

    // Buat JWT Token baru dengan username baru
    const token = jwt.sign(
      { username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: token,
      username: adminUser.username,
      message: '✅ Username & Password Admin berhasil diperbarui di MongoDB Atlas!'
    });
  } catch (err) {
    console.error('❌ Error saat update profil admin:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
