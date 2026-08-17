/**
 * @file index.js
 * @description Entry point utama server Express.js PT Selaras Alam Segandu.
 * Bertanggung jawab hanya untuk memanggil modul konfigurasi database, middleware global,
 * registrasi route API modular, serta menjalankan server HTTP.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db');

// Import Route API Modular
const galleryRoutes = require('./routes/galleryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Inisialisasi Aplikasi Express.js & Port
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware Koneksi DB — Dipanggil di setiap request (aman karena sudah di-cache)
// Pola ini wajib untuk environment serverless seperti Vercel agar DB selalu terkoneksi.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Koneksi DB gagal:', err.message);
    res.status(500).json({ error: 'Gagal terhubung ke database. Silakan coba beberapa saat lagi.' });
  }
});

// 2. Registrasi Middleware Global Body Parser & File Statis (HTML/CSS/JS Frontend)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Registrasi Route API Modular Segandu
app.use('/api/gallery', galleryRoutes); // API Katalog 3 Grade Produk Publik
app.use('/api/orders', orderRoutes);   // API Transaksi Pemesanan WhatsApp
app.use('/api/admin', authRoutes);     // API Autentikasi Admin Segandu
app.use('/api/admin', adminRoutes);    // API Dashboard & CRUD Realtime Admin

// 4. Fallback Single Page Application (SPA) Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. Export app untuk Vercel (serverless handler)
module.exports = app;

// 6. Jalankan Server HTTP (hanya untuk development lokal)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Server PT Selaras Alam Segandu Aktif!`);
    console.log(`🌐 Website Publik: http://localhost:${PORT}`);
    console.log(`🔑 Dashboard Admin: http://localhost:${PORT}/admin/login.html`);
    console.log(`=================================================`);
  });
}
