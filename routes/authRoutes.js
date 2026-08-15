/**
 * @file routes/authRoutes.js
 * @description Pemetaan Route API Autentikasi Login Admin.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/admin/login
 * @desc Login akun Admin & mendapatkan JWT token
 */
router.post('/login', authController.loginAdmin);

module.exports = router;
