/**
 * @file middleware/upload.js
 * @description Middleware Multer untuk menangani pengunggahan file gambar produk ke direktori 'public/uploads'.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan direktori penampung upload file 'public/uploads' ada
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi penyimpanan lokal Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Memberikan nama file unik berbasis timestamp & acak untuk menghindari duplikasi nama
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'prod-' + uniqueSuffix + ext);
  }
});

// Inisialisasi Multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
});

module.exports = upload;
