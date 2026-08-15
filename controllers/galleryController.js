/**
 * @file controllers/galleryController.js
 * @description Controller untuk mengelola pengambilan data Katalog Grade Produk dan spesifikasi yang diakses publik.
 */

const Category = require('../models/Category');
const Photo = require('../models/Photo');
const { checkMongoConnection } = require('../config/db');

/**
 * Mendapatkan daftar seluruh Katalog Grade (Grade 1, 2, 3) beserta pilihan produk di dalamnya.
 * Setiap produk memiliki array gambar slider (2-3 foto), harga, kapasitas mesin, spesifikasi (material, panel, manualbook), serta catatan.
 * 
 * @route GET /api/gallery
 * @access Public
 */
exports.getGallery = async (req, res) => {
  try {
    const isMongoConnected = checkMongoConnection();

    if (isMongoConnected) {
      // Ambil seluruh kategori berurutan (Grade 1, Grade 2, Grade 3)
      const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();

      const result = await Promise.all(categories.map(async (cat) => {
        // Ambil produk dalam kategori ini
        const photos = await Photo.find({ folderId: cat.folderId }).sort({ createdAt: 1 }).lean();

        return {
          id: cat.folderId,
          categoryName: cat.categoryName,
          description: cat.description,
          totalPhotos: photos.length,
          images: photos.map(p => {
            const fallbackImgs = p.imagePath ? [p.imagePath] : ['/images/gpm-16.jpeg'];
            const multiImages = (p.images && p.images.length > 0) ? p.images : fallbackImgs;

            return {
              _id: p._id,
              folderId: p.folderId,
              title: p.title,
              description: p.description,
              price: p.price || 15000000,
              capacity: p.capacity || '100 Kg / Batch',
              imagePath: p.imagePath,
              images: multiImages,
              specifications: {
                materialType: p.specifications?.materialType || 'Stainless Steel SUS304',
                panelUsed: p.specifications?.panelUsed || 'Digital Control Panel',
                manualBook: p.specifications?.manualBook || 'Termasuk (Cetak & Digital PDF)',
                otherSpecs: p.specifications?.otherSpecs || ''
              },
              notes: {
                ppnNote: p.notes?.ppnNote || 'Harga belum termasuk PPN 11%',
                warranty: p.notes?.warranty || 'Garansi Resmi 1 Tahun'
              },
              filename: p.filename
            };
          })
        };
      }));

      return res.json({ success: true, totalCategories: result.length, categories: result });
    }

    return res.json({ success: true, totalCategories: 0, categories: [] });
  } catch (error) {
    console.error('❌ Error saat mengambil katalog gallery:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
