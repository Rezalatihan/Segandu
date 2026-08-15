/**
 * @file controllers/orderController.js
 * @description Controller untuk menangani pemrosesan transaksi pesanan pembeli dan pengalihan ke WhatsApp.
 */

const Order = require('../models/Order');
const { checkMongoConnection } = require('../config/db');

/**
 * Membuat pesanan baru, menyimpan histori transaksi ke MongoDB, 
 * dan menghasilkan tautan resmi API WhatsApp Admin.
 * 
 * @route POST /api/orders
 * @access Public
 */
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, productTitle, folderId, quantity = 1, price = 0, notes = '' } = req.body;
    const WA_NUMBER = process.env.ADMIN_WA_NUMBER || '6281234567890';

    // Validasi input pemesan
    if (!customerName || !customerPhone || !productTitle) {
      return res.status(400).json({ success: false, error: 'Mohon lengkapi Nama, No WhatsApp, dan Produk!' });
    }

    const qty = parseInt(quantity) || 1;
    const unitPrice = parseFloat(price) || 0;
    const totalPrice = qty * unitPrice;

    // Simpan data pesanan ke MongoDB jika terhubung
    const isMongoConnected = checkMongoConnection();
    if (isMongoConnected) {
      await Order.create({
        customerName,
        customerPhone,
        productTitle,
        folderId,
        quantity: qty,
        price: unitPrice,
        totalPrice,
        notes
      });
    }

    // Format Pesan Teks untuk WhatsApp
    const waText =
      `*HALO ADMIN NOVACRAFT!* 🛍️
Saya ingin memesan produk berikut:

📌 *Detail Produk:*
• Nama Produk: ${productTitle}
• Kategori: ${folderId || 'Katalog'}
• Jumlah: ${qty} pcs
• Harga Satuan: Rp ${unitPrice.toLocaleString('id-ID')}
• *Total Pembayaran:* Rp ${totalPrice.toLocaleString('id-ID')}

👤 *Data Pemesan:*
• Nama: ${customerName}
• No. WhatsApp: ${customerPhone}
• Catatan Tambahan: ${notes || '-'}

Mohon konfirmasi ketersediaan stok dan instruksi pembayarannya. Terima kasih!`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedText}`;

    return res.json({
      success: true,
      message: 'Pesanan berhasil dibuat, mengalihkan ke WhatsApp...',
      waUrl: waUrl
    });
  } catch (error) {
    console.error('Error saat membuat order:', error);
    return res.status(500).json({ success: false, error: 'Gagal memproses pesanan.' });
  }
};
