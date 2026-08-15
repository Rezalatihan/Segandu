/**
 * @file routes/orderRoutes.js
 * @description Pemetaan Route API Transaksi Pesanan Publik via WhatsApp.
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * @route POST /api/orders
 * @desc Membuat transaksi order baru dan mendapatkan URL WhatsApp
 */
router.post('/', orderController.createOrder);

module.exports = router;
