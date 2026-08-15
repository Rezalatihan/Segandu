/**
 * @file controllers/adminController.js
 * @description Controller untuk mengelola operasi CRUD Admin Segandu (Statistik, Kategori Grade, Produk Mesin, & Pesanan).
 */

const Category = require('../models/Category');
const Photo = require('../models/Photo');
const Order = require('../models/Order');
const { checkMongoConnection } = require('../config/db');

/**
 * Mendapatkan ringkasan statistik statistik dashboard (Jumlah Kategori, Produk, dan Pesanan).
 * 
 * @route GET /api/admin/stats
 * @access Private (Admin JWT Required)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const isMongoConnected = checkMongoConnection();

    if (!isMongoConnected) {
      return res.json({ success: true, categoriesCount: 3, photosCount: 9, ordersCount: 0 });
    }

    const categoriesCount = await Category.countDocuments();
    const photosCount = await Photo.countDocuments();
    const ordersCount = await Order.countDocuments();

    return res.json({
      success: true,
      categoriesCount,
      photosCount,
      ordersCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Menambahkan Kategori Katalog Grade Baru ke MongoDB.
 * 
 * @route POST /api/admin/categories
 * @access Private (Admin JWT Required)
 */
exports.createCategory = async (req, res) => {
  try {
    const { folderId, categoryName, description } = req.body;
    if (!folderId || !categoryName) {
      return res.status(400).json({ success: false, error: 'ID Folder dan Nama Kategori wajib diisi!' });
    }

    const isMongoConnected = checkMongoConnection();
    if (isMongoConnected) {
      const newCat = await Category.create({ folderId, categoryName, description });
      return res.json({ success: true, category: newCat });
    }

    return res.json({ success: true, message: 'Kategori berhasil ditambahkan.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Menghapus Kategori Grade beserta seluruh produk yang ada di dalamnya dari MongoDB.
 * 
 * @route DELETE /api/admin/categories/:folderId
 * @access Private (Admin JWT Required)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { folderId } = req.params;
    const isMongoConnected = checkMongoConnection();

    if (isMongoConnected) {
      await Category.deleteOne({ folderId });
      await Photo.deleteMany({ folderId });
    }
    return res.json({ success: true, message: `Folder kategori ${folderId} berhasil dihapus.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Menambahkan Produk Mesin Baru ke Katalog Grade di MongoDB Atlas.
 * Menyimpan gambar, harga, kapasitas mesin, 3 spesifikasi, dan 2 catatan.
 * 
 * @route POST /api/admin/photos
 * @access Private (Admin JWT Required)
 */
exports.createPhoto = async (req, res) => {
  try {
    const {
      folderId,
      title,
      description,
      price,
      capacity,
      materialType,
      panelUsed,
      manualBook,
      otherSpecs,
      ppnNote,
      warranty,
      imageUrl
    } = req.body;

    if (!folderId || !title) {
      return res.status(400).json({ success: false, error: 'Folder Kategori Grade dan Judul Produk wajib diisi!' });
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      uploadedImages = [`/uploads/${req.file.filename}`];
    } else if (imageUrl) {
      uploadedImages = [imageUrl];
    } else {
      uploadedImages = ['/images/pirolisis-g1-a.svg'];
    }

    const finalImagePath = uploadedImages[0];
    const filename = finalImagePath.split('/').pop();

    const isMongoConnected = checkMongoConnection();
    if (isMongoConnected) {
      const newPhoto = await Photo.create({
        folderId,
        title,
        description: description || '',
        price: parseFloat(price) || 15000000,
        capacity: capacity || '100 Kg / Batch',
        imagePath: finalImagePath,
        images: uploadedImages,
        specifications: {
          materialType: materialType || 'Stainless Steel SUS304',
          panelUsed: panelUsed || 'Digital Control Panel',
          manualBook: manualBook || 'Termasuk (Cetak & Softcopy PDF)',
          otherSpecs: otherSpecs || ''
        },
        notes: {
          ppnNote: ppnNote || 'Harga belum termasuk PPN 11%',
          warranty: warranty || 'Garansi Resmi 1 Tahun'
        },
        filename: filename
      });

      return res.json({ success: true, photo: newPhoto });
    }

    return res.json({ success: true, message: 'Produk berhasil ditambahkan.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Memperbarui data produk mesin (Judul, Harga, Kapasitas, Spesifikasi, Catatan, Gambar) di MongoDB.
 * 
 * @route PUT /api/admin/photos/:id
 * @access Private (Admin JWT Required)
 */
exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      capacity,
      folderId,
      materialType,
      panelUsed,
      manualBook,
      otherSpecs,
      ppnNote,
      warranty
    } = req.body;

    const isMongoConnected = checkMongoConnection();
    if (isMongoConnected) {
      const updateData = {
        title,
        description,
        price: parseFloat(price) || 15000000,
        capacity: capacity || '100 Kg / Batch',
        folderId,
        specifications: {
          materialType: materialType || 'Stainless Steel SUS304',
          panelUsed: panelUsed || 'Digital Control Panel',
          manualBook: manualBook || 'Termasuk (Cetak & Softcopy PDF)',
          otherSpecs: otherSpecs || ''
        },
        notes: {
          ppnNote: ppnNote || 'Harga belum termasuk PPN 11%',
          warranty: warranty || 'Garansi Resmi 1 Tahun'
        }
      };

      if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map(f => `/uploads/${f.filename}`);
        updateData.images = uploadedImages;
        updateData.imagePath = uploadedImages[0];
        updateData.filename = uploadedImages[0].split('/').pop();
      }

      const updatedPhoto = await Photo.findByIdAndUpdate(id, updateData, { new: true });

      return res.json({ success: true, photo: updatedPhoto });
    }

    return res.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Menghapus data produk mesin tertentu berdasarkan ID dari MongoDB.
 * 
 * @route DELETE /api/admin/photos/:id
 * @access Private (Admin JWT Required)
 */
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoConnected = checkMongoConnection();

    if (isMongoConnected) {
      await Photo.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Mengambil daftar seluruh transaksi pesanan masuk dari pembeli dari MongoDB.
 * 
 * @route GET /api/admin/orders
 * @access Private (Admin JWT Required)
 */
exports.getOrders = async (req, res) => {
  try {
    const isMongoConnected = checkMongoConnection();

    if (isMongoConnected) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, orders });
    }
    return res.json({ success: true, orders: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
