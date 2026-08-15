/**
 * @file routes/galleryRoutes.js
 * @description Pemetaan Route API Galeri / Katalog Publik.
 */

const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

/**
 * @route GET /api/gallery
 * @desc Mendapatkan seluruh daftar kategori dan foto produk
 */
router.get('/', galleryController.getGallery);

module.exports = router;
