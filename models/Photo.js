/**
 * @file models/Photo.js
 * @description Skema Mongoose MongoDB untuk menyimpan data Produk Mesin Katalog Segandu.
 * Menyimpan multiple gambar (slider), harga, kapasitas mesin, spesifikasi rinci, dan catatan garansi/PPN.
 */

const mongoose = require('mongoose');

/**
 * PhotoSchema mendefinisikan objek produk mesin dalam katalog.
 * Field:
 * - folderId: ID Kategori Grade ('grade-1', 'grade-2', 'grade-3').
 * - title: Judul / Nama Produk Mesin.
 * - description: Penjelasan / deskripsi umum produk.
 * - price: Harga barang (dalam Rupiah).
 * - capacity: Kapasitas mesin (misal: '100 Kg / Batch').
 * - imagePath: Path URL file gambar utama.
 * - images: Array URL file gambar untuk fitur slide carousel (2-3 foto per produk).
 * - specifications: Objek spesifikasi teknis mesin.
 * - notes: Objek catatan garansi dan PPN.
 * - filename: Nama file gambar.
 * - createdAt: Waktu pembuatan data.
 */
const PhotoSchema = new mongoose.Schema({
  // Relasi ke ID Kategori Folder ('grade-1', 'grade-2', 'grade-3')
  folderId: {
    type: String,
    required: [true, 'Folder ID Kategori wajib diisi.'],
    index: true
  },

  // Nama produk mesin
  title: {
    type: String,
    required: [true, 'Judul produk wajib diisi.'],
    trim: true
  },

  // Deskripsi produk
  description: {
    type: String,
    default: ''
  },

  // Harga produk dalam Rupiah
  price: {
    type: Number,
    default: 15000000
  },

  // Kapasitas mesin
  capacity: {
    type: String,
    default: '100 Kg / Batch'
  },

  // Gambar Utama
  imagePath: {
    type: String,
    required: [true, 'Path gambar wajib diisi.']
  },

  // Array Multi-Gambar untuk Slide Carousel (2-3 foto per produk)
  images: [{
    type: String
  }],

  // Rincian Spesifikasi Mesin
  specifications: {
    materialType: { type: String, default: 'Stainless Steel SUS304' },
    panelUsed: { type: String, default: 'Digital Control Panel' },
    manualBook: { type: String, default: 'Termasuk (Cetak & Softcopy PDF)' },
    otherSpecs: { type: String, default: 'Suhu operasional maks 500°C' }
  },

  // Rincian Catatan Wajib Produk
  notes: {
    ppnNote: { type: String, default: 'Harga belum termasuk PPN 11%' },
    warranty: { type: String, default: 'Garansi Resmi 1 Tahun' }
  },

  // Nama file gambar fisik
  filename: {
    type: String
  },

  // Tanggal pengunggahan
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Photo', PhotoSchema);
