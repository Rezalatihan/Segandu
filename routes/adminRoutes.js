/**
 * @file routes/adminRoutes.js
 * @description Pemetaan Route API Dashboard & CRUD Management Admin (Dilindungi JWT Auth Middleware).
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Seluruh rute di bawah wajib melewati autentikasi authMiddleware
router.use(authMiddleware);

/**
 * @route PUT /api/admin/profile
 * @desc Memperbarui username dan password akun admin
 */
router.put('/profile', authController.updateAdminProfile);

/**
 * @route GET /api/admin/stats
 * @desc Mendapatkan ringkasan statistik dashboard admin
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @route POST /api/admin/categories
 * @desc Membuat kategori folder produk baru
 */
router.post('/categories', adminController.createCategory);

/**
 * @route DELETE /api/admin/categories/:folderId
 * @desc Menghapus kategori beserta foto didalamnya
 */
router.delete('/categories/:folderId', adminController.deleteCategory);

/**
 * @route POST /api/admin/photos
 * @desc Upload foto produk baru dengan dukungan hingga 5 file gambar (Multi-Gambar Slider)
 */
router.post('/photos', upload.array('images', 5), adminController.createPhoto);

/**
 * @route PUT /api/admin/photos/:id
 * @desc Memperbarui detail informasi produk dan opsi upload multi-gambar
 */
router.put('/photos/:id', upload.array('images', 5), adminController.updatePhoto);

/**
 * @route DELETE /api/admin/photos/:id
 * @desc Menghapus foto produk berdasarkan ID
 */
router.delete('/photos/:id', adminController.deletePhoto);

/**
 * @route GET /api/admin/orders
 * @desc Mengambil daftar seluruh transaksi pesanan masuk
 */
router.get('/orders', adminController.getOrders);

module.exports = router;
