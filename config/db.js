/**
 * @file config/db.js
 * @description Modul penanganan koneksi ke database MongoDB Atlas dan penanaman data awal (Seeding Data).
 * Menyediakan auto-seeding untuk akun Admin Segandu, 3 Kategori Grade, dan 9 Pilihan Produk ber-spesifikasi dengan multi-gambar slider.
 * Menggunakan connection caching agar kompatibel dengan environment serverless (Vercel).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Model MongoDB
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Photo = require('../models/Photo');

// Cache koneksi untuk environment serverless (Vercel)
// Mencegah pembuatan koneksi baru di setiap request (cold start)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Membuka koneksi ke database MongoDB Atlas.
 * Menggunakan connection caching untuk kompatibilitas serverless Vercel.
 */
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('❌ MONGO_URI environment variable tidak ditemukan! Pastikan sudah diset di Vercel Environment Variables.');
  }

  // Jika koneksi sudah ada (cached), gunakan langsung
  if (cached.conn) {
    return cached.conn;
  }

  // Jika belum ada promise koneksi, buat baru
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Nonaktifkan buffering untuk serverless
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log('✅ Terhubung ke database MongoDB Atlas Segandu!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // Reset promise agar bisa retry
    console.error('⚠️ Gagal terhubung ke MongoDB:', err.message);
    throw err;
  }

  // Jalankan seeding data otomatis saat DB berhasil terhubung
  await seedInitialData();

  return cached.conn;
}

/**
 * Menanam data awal (Seeding Data) ke database MongoDB.
 */
async function seedInitialData() {
  try {
    // 1. SEED AKUN ADMIN SEGANDU
    const existingAdmin = await Admin.findOne({ username: 'Segandu' });
    if (!existingAdmin) {
      await Admin.deleteMany({});
      const hashedPassword = await bcrypt.hash('Getthefest', 10);
      await Admin.create({
        username: 'Segandu',
        password: hashedPassword
      });
      console.log('👤 Akun Admin Utama Berhasil Dibuat -> Username: Segandu | Password: [Getthefest]');
    }

    // 2. SEED KATEGORI GRADE & 9 PRODUK BER-SLIDER (JIKA DATABASE KOSONG)
    const categoryCount = await Category.countDocuments();

    if (categoryCount === 0) {
      console.log('🌱 Menyiapkan 3 Katalog Grade Initial & 9 Pilihan Produk dengan Multi-Gambar Slider ke MongoDB...');

      await Category.deleteMany({});
      await Photo.deleteMany({});

      const defaultCategories = [
        {
          folderId: 'grade-1',
          categoryName: 'High Quality',
          description: 'Katalog Mesin Pirolisis High Quality Spesifikasi High-End / Premium Level',
          order: 1
        },
        {
          folderId: 'grade-2',
          categoryName: 'Medium',
          description: 'Katalog Mesin Pirolisis Medium Spesifikasi Commercial / Medium Duty',
          order: 2
        },
        {
          folderId: 'grade-3',
          categoryName: 'Standart',
          description: 'Katalog Mesin Pirolisis Standart Spesifikasi Standard / Entry Level',
          order: 3
        }
      ];

      await Category.insertMany(defaultCategories);
    } else {
      // Auto-update nama kategori lama di MongoDB Atlas jika masih menggunakan tulisan 'Grade 1', 'Grade 2', 'Grade 3'
      await Category.updateOne({ folderId: 'grade-1', categoryName: 'Grade 1' }, { $set: { categoryName: 'High Quality' } });
      await Category.updateOne({ folderId: 'grade-2', categoryName: 'Grade 2' }, { $set: { categoryName: 'Medium' } });
      await Category.updateOne({ folderId: 'grade-3', categoryName: 'Grade 3' }, { $set: { categoryName: 'Standart' } });
    }

    // Data 9 Produk Pilihan (Masing-masing memiliki 3 gambar slide) — hanya di-seed jika DB kosong
    if (categoryCount === 0) {
      const defaultProducts = [
        // ==================== GRADE 1 (3 PILIHAN) ====================
        {
          folderId: 'grade-1',
          title: 'Mesin Pirolisis Segandu G1-A',
          description: 'Mesin pirolisis.',
          price: 45000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/pirolisis-g1-a.svg',
          images: [
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Mild Steel 6mm Heavy Plate',
            panelUsed: 'Analog Temperature Control Panel',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 450°C, Daya Listrik 5 kW'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 1 Tahun Sparepart & Service'
          },
          filename: 'gpm-16.jpeg'
        },
        {
          folderId: 'grade-1',
          title: 'Mesin Pirolisis Segandu G1-B',
          description: 'Mesin pirolisis.',
          price: 65000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/gpm-16.jpeg',
          images: [
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Carbon Steel Heavy Duty',
            panelUsed: 'Digital Temperature Controller Panel',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 500°C, Daya Listrik 7.5 kW'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 1 Tahun Sparepart & Service'
          },
          filename: 'gpm-16.jpeg'
        },
        {
          folderId: 'grade-1',
          title: 'Mesin Pirolisis Segandu G1-C',
          description: 'Mesin pirolisis.',
          price: 85000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/gpm-16.jpeg',
          images: [
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Carbon Steel + High Heat Thermal Coating',
            panelUsed: 'Dual Digital Monitor & Controller',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 550°C, Dual Safety Valve'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 1 Tahun Sparepart & Service'
          },
          filename: 'gpm-16.jpeg'
        },

        // ==================== GRADE 2 (3 PILIHAN) ====================
        {
          folderId: 'grade-2',
          title: 'Mesin Pirolisis Segandu G2-A',
          description: 'Mesin pirolisis komersial per batch dengan reaktor Stainless Steel SUS304 berkualitas tinggi.',
          price: 120000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/gpm-16.jpeg',
          images: [
            '/images/gpm-16.jpeg',
            '/images/pirolisis-g2-b.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Stainless Steel SUS304 + Mild Steel Frame',
            panelUsed: 'Semi-Automatic Touchscreen Panel',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 600°C, Automatic Pressure Sensor'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 2 Tahun Sparepart & Service'
          },
          filename: 'pirolisis-g2-a.svg'
        },
        {
          folderId: 'grade-2',
          title: 'Mesin Pirolisis Segandu G2-B',
          description: 'Mesin pirolisis .',
          price: 160000000,
          capacity: '400 Kg / Batch',
          imagePath: '/images/pirolisis-g2-b.svg',
          images: [
            '/images/pirolisis-g2-b.svg',
            '/images/pirolisis-g2-c.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Full Stainless Steel SUS304 High Grade',
            panelUsed: 'Smart PLC Controller + Emergency Auto Stop',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 650°C, Kondensor Ganda'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 2 Tahun Sparepart & Service'
          },
          filename: 'pirolisis-g2-b.svg'
        },
        {
          folderId: 'grade-2',
          title: 'Mesin Pirolisis Segandu G2-C',
          description: 'Mesin pirolisis .',
          price: 210000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/pirolisis-g2-c.svg',
          images: [
            '/images/pirolisis-g2-c.svg',
            '/images/pirolisis-g2-a.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Heavy Duty Stainless Steel SUS304',
            panelUsed: 'Advanced Touch Panel PLC + Remote Monitoring',
            manualBook: 'Termasuk (Cetak & Digital PDF)',
            otherSpecs: 'Suhu maks 700°C, System Auto-Cleaner'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 2 Tahun Sparepart & Service'
          },
          filename: 'pirolisis-g2-c.svg'
        },

        // ==================== GRADE 3 (3 PILIHAN) ====================
        {
          folderId: 'grade-3',
          title: 'Mesin Pirolisis Segandu G3-A',
          description: 'Mesin pirolisis.',
          price: 320000000,
          capacity: '5,10,20 Kg',
          imagePath: '/images/pirolisis-g3-a.svg',
          images: [
            '/images/pirolisis-g3-a.svg',
            '/images/pirolisis-g3-b.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Special Alloy Stainless Steel SUS316',
            panelUsed: 'Full Automatic Industrial PLC + HMI Touchscreen',
            manualBook: 'Termasuk (Cetak Hardcover & Digital PDF)',
            otherSpecs: 'Suhu maks 800°C, Distilasi Bertingkat'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 3 Tahun + Gratis Maintenance 1 Tahun'
          },
          filename: 'pirolisis-g3-a.svg'
        },
        {
          folderId: 'grade-3',
          title: 'Mesin Pirolisis Segandu G3-B',
          description: 'Mesin pirolisis.',
          price: 450000000,
          capacity: '2.000 Kg / Batch',
          imagePath: '/images/pirolisis-g3-b.svg',
          images: [
            '/images/pirolisis-g3-b.svg',
            '/images/pirolisis-g3-c.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Heat Resistant Alloy SUS316L Extra Heavy',
            panelUsed: 'Integrated SCADA System + Smart Sensor Array',
            manualBook: 'Termasuk (Cetak Hardcover & Digital PDF)',
            otherSpecs: 'Suhu maks 850°C, Multi-Fuel Furnace'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 3 Tahun + Gratis Maintenance 1 Tahun'
          },
          filename: 'pirolisis-g3-b.svg'
        },
        {
          folderId: 'grade-3',
          title: 'Mesin Pirolisis Segandu G3-C',
          description: 'Mesin pirolisis.',
          price: 680000000,
          capacity: '5.000 Kg / Batch',
          imagePath: '/images/pirolisis-g3-c.svg',
          images: [
            '/images/pirolisis-g3-c.svg',
            '/images/pirolisis-g3-a.svg',
            '/images/gpm-16.jpeg'
          ],
          specifications: {
            materialType: 'Custom High-Temp Alloy Steel Special Grade',
            panelUsed: 'Multi-Stage Automated Command Center',
            manualBook: 'Termasuk (Cetak Hardcover & Digital PDF)',
            otherSpecs: 'Suhu maks 900°C, Continuous Feed System'
          },
          notes: {
            ppnNote: 'Harga belum termasuk PPN 11%',
            warranty: 'Garansi Resmi 3 Tahun + Onsite Technical Support'
          },
          filename: 'pirolisis-g3-c.svg'
        }
      ];

      await Photo.insertMany(defaultProducts);
      console.log('✅ Data 3 Grade & 9 Produk Pilihan dengan 3 Gambar Slider per Produk berhasil diperbarui!');
    } // end if (categoryCount === 0) for products
  } catch (err) {
    console.error('❌ Error saat seeding data MongoDB:', err.message);
  }
}

function checkMongoConnection() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  checkMongoConnection
};
