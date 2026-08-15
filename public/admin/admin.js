/**
 * @file public/admin/admin.js
 * @description Script penanganan Dashboard Admin Segandu.
 * Menangani operasi CRUD (Create, Read, Update, Delete) secara realtime terhubung ke database MongoDB Atlas.
 */

// Mengambil Token Autentikasi dan Nama User dari LocalStorage
const token = localStorage.getItem('segandu_admin_token');
const adminUser = localStorage.getItem('segandu_admin_user');

// Jika tidak ada token, alihkan pengguna ke halaman login
if (!token) {
  window.location.href = '/admin/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Tampilkan nama admin di header
  document.getElementById('adminUsernameDisplay').innerText = adminUser || 'Segandu';

  // Memuat data awal dashboard
  fetchStats();
  populateCategorySelect();
  loadPhotosTable();
  loadCategoriesTable();
  loadOrdersTable();

  // Memuat pilihan kategori secara dinamis di form Tambah Produk
  async function populateCategorySelect() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      const select = document.getElementById('photoFolderId');
      if (!select || !data.categories) return;

      select.innerHTML = data.categories.map(cat =>
        `<option value="${cat.id}">${cat.categoryName} (${cat.id})</option>`
      ).join('');
    } catch (e) {
      console.error('Error populating category select:', e);
    }
  }

  // Tab switching
  window.showTab = function (tabId, element) {
    document.getElementById('photosTab').style.display = 'none';
    document.getElementById('categoriesTab').style.display = 'none';
    document.getElementById('ordersTab').style.display = 'none';
    document.getElementById('profileTab').style.display = 'none';

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    element.classList.add('active');

    document.getElementById(tabId).style.display = 'block';
  };

  // Logout Admin Segandu
  window.logoutAdmin = function () {
    localStorage.removeItem('segandu_admin_token');
    localStorage.removeItem('segandu_admin_user');
    window.location.href = '/admin/login.html';
  };

  // ==========================================
  // 1. MEMBACA STATISTIK DASHBOARD
  // ==========================================
  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('statCategories').innerText = data.categoriesCount || 3;
        document.getElementById('statPhotos').innerText = data.photosCount || 9;
        document.getElementById('statOrders').innerText = data.ordersCount || 0;
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }

  // ==========================================
  // 2. FORM TAMBAH / UPDATE PRODUK MESIN (CREATE & UPDATE)
  // ==========================================
  document.getElementById('uploadPhotoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('editPhotoId').value;
    const folderId = document.getElementById('photoFolderId').value;
    const title = document.getElementById('photoTitle').value.trim();
    const price = document.getElementById('photoPrice').value;
    const capacity = document.getElementById('photoCapacity').value.trim();
    const materialType = document.getElementById('photoMatType').value.trim();
    const panelUsed = document.getElementById('photoPanelUsed').value.trim();
    const manualBook = document.getElementById('photoManualBook').value.trim();
    const warranty = document.getElementById('photoWarranty').value.trim();
    const ppnNote = document.getElementById('photoPpnNote').value.trim();
    const description = document.getElementById('photoDesc').value.trim();
    const fileInput = document.getElementById('photoFile');

    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('title', title);
    formData.append('price', price);
    formData.append('capacity', capacity);
    formData.append('materialType', materialType);
    formData.append('panelUsed', panelUsed);
    formData.append('manualBook', manualBook);
    formData.append('warranty', warranty);
    formData.append('ppnNote', ppnNote);
    formData.append('description', description);

    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < Math.min(fileInput.files.length, 5); i++) {
        formData.append('images', fileInput.files[i]);
      }
    }

    if (editId) {
      // PROSES UPDATE PRODUK
      try {
        const res = await fetch(`/api/admin/photos/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          alert('✅ Data produk mesin berhasil diperbarui di katalog!');
          cancelEditMode();
          fetchStats();
          loadPhotosTable();
        } else {
          alert('Gagal memperbarui: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Error saat mengedit data produk');
      }
    } else {
      // PROSES SIMPAN PRODUK BARU
      try {
        const res = await fetch('/api/admin/photos', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          alert('✅ Produk mesin baru berhasil disimpan ke ketalog!');
          document.getElementById('uploadPhotoForm').reset();
          fetchStats();
          loadPhotosTable();
        } else {
          alert('Gagal: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Error saat mengunggah produk mesin');
      }
    }
  });

  // Batal Edit Mode
  window.cancelEditMode = function () {
    document.getElementById('editPhotoId').value = '';
    document.getElementById('uploadPhotoForm').reset();
    document.getElementById('formCardTitle').innerHTML = '<i class="fas fa-plus-circle" style="color: var(--primary);"></i> Tambah Produk Mesin Baru ke Katalog';
    document.getElementById('submitPhotoBtn').innerHTML = '<i class="fas fa-save"></i> Simpan Produk Ke Katalogs';
    document.getElementById('cancelEditBtn').style.display = 'none';
  };

  // Set Form ke Mode Edit
  window.editPhoto = function (productJsonStr) {
    const p = JSON.parse(decodeURIComponent(productJsonStr));
    document.getElementById('editPhotoId').value = p._id;
    document.getElementById('photoFolderId').value = p.folderId || 'grade-1';
    document.getElementById('photoTitle').value = p.title || '';
    document.getElementById('photoPrice').value = p.price || 45000000;
    document.getElementById('photoCapacity').value = p.capacity || '';

    const specs = p.specifications || {};
    document.getElementById('photoMatType').value = specs.materialType || '';
    document.getElementById('photoPanelUsed').value = specs.panelUsed || '';
    document.getElementById('photoManualBook').value = specs.manualBook || '';

    const notes = p.notes || {};
    document.getElementById('photoWarranty').value = notes.warranty || '';
    document.getElementById('photoPpnNote').value = notes.ppnNote || 'Harga belum termasuk PPN 11%';
    document.getElementById('photoDesc').value = p.description || '';

    document.getElementById('formCardTitle').innerHTML = '<i class="fas fa-edit" style="color: var(--primary);"></i> Edit Data Produk Mesin';
    document.getElementById('submitPhotoBtn').innerHTML = '<i class="fas fa-check-circle"></i> Perbarui Data Produk';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    document.getElementById('photosTab').scrollIntoView({ behavior: 'smooth' });
  };

  // ==========================================
  // 3. TABEL DAFTAR PRODUK (READ & DELETE)
  // ==========================================
  async function loadPhotosTable() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();

      const tbody = document.getElementById('photosTableBody');
      if (!data.categories) return;

      let allPhotos = [];
      data.categories.forEach(cat => {
        cat.images.forEach(img => {
          allPhotos.push({
            ...img,
            categoryName: cat.categoryName,
            folderId: cat.id
          });
        });
      });

      if (allPhotos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Belum ada produk mesin dalam kategori.</td></tr>';
        return;
      }

      tbody.innerHTML = allPhotos.map(item => {
        const specs = item.specifications || {};
        const notes = item.notes || {};
        const jsonStr = encodeURIComponent(JSON.stringify(item));

        return `
          <tr>
            <td><img src="${item.imagePath}" class="table-img" /></td>
            <td><strong>${item.title}</strong><br><small style="color: var(--text-muted);">${item.description}</small></td>
            <td><span class="card-badge">${item.categoryName}</span></td>
            <td>
              <strong>Rp ${(item.price || 0).toLocaleString('id-ID')}</strong><br>
              <small style="color: var(--primary);"><i class="fas fa-tachometer-alt"></i> ${item.capacity}</small>
            </td>
            <td>
              <small>
                • <b>Material:</b> ${specs.materialType || '-'}<br>
                • <b>Panel:</b> ${specs.panelUsed || '-'}<br>
                • <b>Manual:</b> ${specs.manualBook || '-'}
              </small>
            </td>
            <td>
              <small style="color: #b45309;">
                • ${notes.ppnNote || 'Harga belum termasuk PPN 11%'}<br>
                • <b>Garansi:</b> ${notes.warranty || '-'}
              </small>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="editPhoto('${jsonStr}')">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deletePhoto('${item._id}')">
                  <i class="fas fa-trash"></i> Hapus
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error loading photos table:', e);
    }
  }

  // Hapus Produk (DELETE)
  window.deletePhoto = async function (id) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk mesin ini dari Katalog?')) return;
    try {
      const res = await fetch(`/api/admin/photos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Produk berhasil dihapus.');
        fetchStats();
        loadPhotosTable();
      }
    } catch (err) {
      alert('Gagal menghapus produk.');
    }
  };

  // ==========================================
  // 4. KELOLA KATALOG GRADE (CREATE & READ & DELETE)
  // ==========================================
  document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const folderId = document.getElementById('catFolderId').value.trim();
    const categoryName = document.getElementById('catName').value.trim();
    const description = document.getElementById('catDesc').value.trim();

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderId, categoryName, description })
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Katalog Grade berhasil ditambahkan!');
        document.getElementById('addCategoryForm').reset();
        fetchStats();
        populateCategorySelect();
        loadCategoriesTable();
      } else {
        alert('Gagal: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      alert('Error saat menambah grade');
    }
  });

  async function loadCategoriesTable() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();

      const tbody = document.getElementById('categoriesTableBody');
      if (!data.categories) return;

      tbody.innerHTML = data.categories.map(cat => `
        <tr>
          <td><code>${cat.id}</code></td>
          <td><strong>${cat.categoryName}</strong></td>
          <td>${cat.description}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.id}')">
              <i class="fas fa-trash"></i> Hapus Grade
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  window.deleteCategory = async function (folderId) {
    if (!confirm(`Hapus katalog ${folderId}? Seluruh produk di dalamnya akan ikut terhapus.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${folderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Katalog Grade berhasil dihapus.');
        fetchStats();
        populateCategorySelect();
        loadCategoriesTable();
        loadPhotosTable();
      }
    } catch (e) {
      alert('Gagal menghapus katalog.');
    }
  };

  // ==========================================
  // 5. RIWAYAT PESANAN WHATSAPP (READ)
  // ==========================================
  async function loadOrdersTable() {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      const tbody = document.getElementById('ordersTableBody');
      if (!data.orders || data.orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Belum ada riwayat pesanan WhatsApp.</td></tr>';
        return;
      }

      tbody.innerHTML = data.orders.map(o => `
        <tr>
          <td>${new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
          <td><strong>${o.customerName}</strong></td>
          <td><a href="https://wa.me/${o.customerPhone}" target="_blank" style="color: var(--primary);"><i class="fab fa-whatsapp"></i> ${o.customerPhone}</a></td>
          <td>${o.productTitle}</td>
          <td>${o.quantity}</td>
          <td>Rp ${(o.totalPrice || 0).toLocaleString('id-ID')}</td>
          <td>${o.notes || '-'}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  }

  // ==========================================
  // 6. PENGATURAN AKUN ADMIN (UPDATE USERNAME & PASSWORD)
  // ==========================================
  const updateProfileForm = document.getElementById('updateProfileForm');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newUsername = document.getElementById('newUsername').value.trim();
      const newPassword = document.getElementById('newPassword').value.trim();
      const currentPassword = document.getElementById('currentPassword').value.trim();

      if (!currentPassword) {
        alert('Mohon masukkan password saat ini untuk keamanan.');
        return;
      }

      try {
        const res = await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword,
            newUsername,
            newPassword
          })
        });

        const data = await res.json();

        if (data.success) {
          alert('✅ ' + (data.message || 'Profil Admin berhasil diperbarui!'));
          if (data.token) {
            localStorage.setItem('segandu_admin_token', data.token);
          }
          if (data.username) {
            localStorage.setItem('segandu_admin_user', data.username);
            document.getElementById('adminUsernameDisplay').innerText = data.username;
          }
          updateProfileForm.reset();
        } else {
          alert('Gagal: ' + (data.error || 'Terjadi kesalahan saat memperbarui akun.'));
        }
      } catch (err) {
        alert('Error saat menghubungi server.');
      }
    });
  }
});
