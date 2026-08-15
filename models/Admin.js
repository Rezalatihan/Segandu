/**
 * @file models/Admin.js
 * @description Skema Mongoose MongoDB untuk menyimpan data akun Admin dashboard.
 */

const mongoose = require('mongoose');

/**
 * AdminSchema mendefinisikan struktur data untuk pengguna tingkat Admin.
 * Field:
 * - username: nama akun unik untuk login admin.
 * - password: kata sandi yang telah di-hash menggunakan bcrypt.
 * - createdAt: waktu pembuatan akun.
 */
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username admin wajib diisi.'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', AdminSchema);
