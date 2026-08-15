/**
 * @file models/Order.js
 * @description Skema Mongoose MongoDB untuk menyimpan riwayat pesanan barang dari pembeli via WhatsApp.
 */

const mongoose = require('mongoose');

/**
 * OrderSchema mendefinisikan transaksi pesanan pelanggan.
 * Field:
 * - customerName: Nama lengkap pembeli.
 * - customerPhone: Nomor WhatsApp pembeli.
 * - productTitle: Judul barang yang dipesan.
 * - folderId: Kategori produk.
 * - quantity: Jumlah barang yang dibeli (pcs).
 * - price: Harga satuan saat dipesan.
 * - totalPrice: Total pembayaran (quantity * price).
 * - notes: Catatan khusus pembeli.
 * - status: Status transaksi (default: 'Diproses').
 * - createdAt: Waktu transaksi dibuat.
 */
const OrderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Nama pemesan wajib diisi.'],
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'Nomor WhatsApp pemesan wajib diisi.'],
    trim: true
  },
  productTitle: {
    type: String,
    required: [true, 'Nama produk wajib diisi.']
  },
  folderId: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Diproses'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
