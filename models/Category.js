/**
 * @file models/Category.js
 * @description Skema Mongoose MongoDB untuk menyimpan data Katalog Grade Produk Segandu.
 * Digunakan untuk mengelompokkan produk ke dalam katalog Grade 1, Grade 2, dan Grade 3.
 */

const mongoose = require('mongoose');

/**
 * CategorySchema mendefinisikan struktur data kategori grade katalog produk.
 * Field:
 * - folderId: ID unik kategori (misal: 'grade-1', 'grade-2', 'grade-3').
 * - categoryName: Nama kategori katalog (misal: 'Grade 1', 'Grade 2', 'Grade 3').
 * - description: Penjelasan singkat cakupan spesifikasi grade.
 * - order: Urutan tampilan dalam aplikasi.
 * - createdAt: Waktu pembuatan data kategori.
 */
const CategorySchema = new mongoose.Schema({
  // ID Folder Unik Kategori Grade ('grade-1', 'grade-2', 'grade-3')
  folderId: {
    type: String,
    required: [true, 'Folder ID wajib diisi.'],
    unique: true,
    trim: true
  },

  // Nama Tampilan Katalog ('Grade 1', 'Grade 2', 'Grade 3')
  categoryName: {
    type: String,
    required: [true, 'Nama kategori wajib diisi.'],
    trim: true
  },

  // Deskripsi Kategori Katalog
  description: {
    type: String,
    default: ''
  },

  // Urutan Posisi Tampilan (1, 2, 3)
  order: {
    type: Number,
    default: 0
  },

  // Waktu Pembuatan
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);
