/**
 * @file public/js/main.js
 * @description Script antarmuka publik Segandu.
 * Menangani perlewatan tema, perenderan 3 Katalog Grade (dengan 3 pilihan produk per grade),
 * Lightbox detail spesifikasi teknis (Kapasitas, Material, Panel, Manualbook, Catatan PPN/Garansi),
 * dan pemrosesan formulir pemesanan WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Variabel state lokal
  let allGalleryData = [];
  let selectedFolderId = null;

  // Elemen-elemen DOM
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const sectionTitle = document.getElementById('gallerySectionTitle');
  const sectionDesc = document.getElementById('gallerySectionDesc');
  const folderAlbumContainer = document.getElementById('folderAlbumContainer');
  const singleFolderContainer = document.getElementById('singleFolderContainer');
  const backToFoldersBtn = document.getElementById('backToFoldersBtn');
  const currentFolderName = document.getElementById('currentFolderName');
  const currentFolderDesc = document.getElementById('currentFolderDesc');
  const singleFolderGrid = document.getElementById('singleFolderGrid');

  // Elemen Modal Lightbox Detail Produk
  const lightboxModal = document.getElementById('lightboxModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalSliderImage = document.getElementById('modalSliderImage');
  const sliderPrevBtn = document.getElementById('sliderPrevBtn');
  const sliderNextBtn = document.getElementById('sliderNextBtn');
  const modalSliderBadge = document.getElementById('modalSliderBadge');
  const modalSliderDots = document.getElementById('modalSliderDots');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalCapacity = document.getElementById('modalCapacity');
  const modalMatType = document.getElementById('modalMatType');
  const modalPanelUsed = document.getElementById('modalPanelUsed');
  const modalManualBook = document.getElementById('modalManualBook');
  const modalNotePpn = document.getElementById('modalNotePpn');
  const modalNoteWarranty = document.getElementById('modalNoteWarranty');
  const modalPrice = document.getElementById('modalPrice');
  const modalBuyBtn = document.getElementById('modalBuyBtn');

  const specsToggleBtn = document.getElementById('specsToggleBtn');
  const collapsibleSpecs = document.getElementById('collapsibleSpecs');
  const specsToggleIcon = document.getElementById('specsToggleIcon');

  // State Slider Multi-Gambar Produk (1 s/d 5 Foto)
  let currentImages = [];
  let currentImageIndex = 0;

  function updateSliderDisplay() {
    if (!currentImages || currentImages.length === 0) return;

    if (modalSliderImage) {
      modalSliderImage.style.opacity = '0.3';
      setTimeout(() => {
        modalSliderImage.src = currentImages[currentImageIndex];
        modalSliderImage.style.opacity = '1';
      }, 100);
    }

    if (modalSliderBadge) {
      modalSliderBadge.innerHTML = `<i class="fas fa-images"></i> ${currentImageIndex + 1} / ${currentImages.length} Foto`;
    }

    // Render Indicator Dots & Tombol Navigasi Panah
    if (modalSliderDots) {
      if (currentImages.length <= 1) {
        modalSliderDots.style.display = 'none';
        if (sliderPrevBtn) sliderPrevBtn.style.display = 'none';
        if (sliderNextBtn) sliderNextBtn.style.display = 'none';
      } else {
        modalSliderDots.style.display = 'flex';
        if (sliderPrevBtn) sliderPrevBtn.style.display = 'flex';
        if (sliderNextBtn) sliderNextBtn.style.display = 'flex';

        modalSliderDots.innerHTML = currentImages.map((_, idx) => `
          <span class="slider-dot ${idx === currentImageIndex ? 'active' : ''}" onclick="goToSlide(${idx})"></span>
        `).join('');
      }
    }
  }

  window.goToSlide = function (index) {
    if (index >= 0 && index < currentImages.length) {
      currentImageIndex = index;
      updateSliderDisplay();
    }
  };

  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      updateSliderDisplay();
    });
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % currentImages.length;
      updateSliderDisplay();
    });
  }

  // Touch Swipe Gesture (Geser Layar) untuk HP / Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const sliderWrapper = document.querySelector('.modal-slider-wrapper');
  if (sliderWrapper) {
    sliderWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40 && currentImages.length > 1) {
        // Usap Ke Kiri -> Slide Selanjutnya
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateSliderDisplay();
      } else if (touchEndX - touchStartX > 40 && currentImages.length > 1) {
        // Usap Ke Kanan -> Slide Sebelumnya
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateSliderDisplay();
      }
    }, { passive: true });
  }

  // Toggle Accordion Buka-Tutup Spesifikasi Rinci
  if (specsToggleBtn && collapsibleSpecs) {
    specsToggleBtn.addEventListener('click', () => {
      collapsibleSpecs.classList.toggle('open');
      if (specsToggleIcon) {
        if (collapsibleSpecs.classList.contains('open')) {
          specsToggleIcon.className = 'fas fa-chevron-up';
        } else {
          specsToggleIcon.className = 'fas fa-chevron-down';
        }
      }
    });
  }

  // Close modal ketika mengklik area gelap di luar modal (backdrop click)
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Close modal dengan menekan tombol ESC di keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeOrderModal();
    }
  });

  // Elemen Modal Form Pemesanan WA
  const orderModal = document.getElementById('orderModal');
  const orderModalCloseBtn = document.getElementById('orderModalCloseBtn');
  const orderForm = document.getElementById('orderForm');
  const orderProductTitle = document.getElementById('orderProductTitle');
  const orderProductPrice = document.getElementById('orderProductPrice');
  const orderProductTitleInput = document.getElementById('orderProductTitleInput');
  const orderProductPriceInput = document.getElementById('orderProductPriceInput');
  const orderFolderIdInput = document.getElementById('orderFolderIdInput');

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  // Navigasi Responsif Mobile (Hamburger Menu)
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelector('.nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      const icon = hamburgerBtn.querySelector('i');
      if (navLinks.classList.contains('mobile-active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        const icon = hamburgerBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // ==========================================
  // 1. DUKUNGAN TEMA GELAP / TERANG (DARK/LIGHT)
  // ==========================================
  const savedTheme = localStorage.getItem('segandu_theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('segandu_theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // ==========================================
  // 2. MENGAMBIL DATA KATALOG DARI API (/api/gallery)
  // ==========================================
  async function fetchGalleryData() {
    try {
      folderAlbumContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
          <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary); margin-bottom: 12px;"></i>
          <p>Membaca database MongoDB Segandu Atlas...</p>
        </div>
      `;

      const response = await fetch('/api/gallery', { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.categories) {
        allGalleryData = result.categories;
        renderFolderAlbumGrid();
      } else {
        throw new Error(result.error || 'Gagal memuat katalog grade');
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      folderAlbumContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: var(--radius-md);">
          <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent); margin-bottom: 12px;"></i>
          <p>Gagal membaca katalog database: ${error.message}</p>
        </div>
      `;
    }
  }

  // ==========================================
  // 3. MERENDER 3 KARTU KATALOG GRADE
  // ==========================================
  function renderFolderAlbumGrid() {
    selectedFolderId = null;
    folderAlbumContainer.style.display = 'grid';
    singleFolderContainer.style.display = 'none';

    sectionTitle.innerText = 'Katalog Grade Mesin Pirolisis';
    sectionDesc.innerText = 'Pilih salah satu Grade di bawah ini untuk melihat 3 pilihan mesin pirolisis ber-spesifikasi tinggi.';

    if (allGalleryData.length === 0) {
      folderAlbumContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
          <i class="far fa-folder-open fa-3x" style="margin-bottom: 12px; opacity: 0.5;"></i>
          <p>Belum ada katalog grade mesin tersedia.</p>
        </div>
      `;
      return;
    }

    folderAlbumContainer.innerHTML = allGalleryData.map((cat) => {
      const coverImg = (cat.images && cat.images.length > 0) ? cat.images[0].imagePath : '/images/gpm-16.jpeg';

      return `
        <div class="folder-card" onclick="openFolder('${cat.id}')">
          <span class="folder-tab-badge"><i class="fas fa-layer-group"></i> ${cat.categoryName.toUpperCase()}</span>
          
          <div class="folder-cover-wrapper">
            <img src="${coverImg}" alt="${cat.categoryName}" loading="lazy" />
            <span class="folder-photo-badge">
              <i class="fas fa-cogs"></i> ${cat.totalPhotos} Pilihan Mesin
            </span>
          </div>

          <h3 class="folder-title">
            <i class="fas fa-cubes"></i> ${cat.categoryName}
          </h3>

          <p class="folder-desc">${cat.description}</p>

          <div class="folder-action-btn">
            <span>Lihat ${cat.totalPhotos} Pilihan Mesin</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 4. MEMBUKA 3 PILIHAN MESIN DI DALAM GRADE
  // ==========================================
  window.openFolder = function (folderId) {
    const selectedCat = allGalleryData.find(cat => cat.id === folderId);
    if (!selectedCat) return;

    selectedFolderId = folderId;

    folderAlbumContainer.style.display = 'none';
    singleFolderContainer.style.display = 'block';

    sectionTitle.innerText = `Katalog: ${selectedCat.categoryName}`;
    sectionDesc.innerText = `Menampilkan ${selectedCat.images ? selectedCat.images.length : 0} pilihan produk mesin di dalam ${selectedCat.categoryName}.`;

    currentFolderName.innerHTML = `<i class="fas fa-layer-group" style="color: var(--primary);"></i> ${selectedCat.categoryName}`;
    currentFolderDesc.innerText = selectedCat.description;

    if (!selectedCat.images || selectedCat.images.length === 0) {
      singleFolderGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
          <i class="far fa-images fa-3x" style="margin-bottom: 12px; opacity: 0.5;"></i>
          <p>Katalog ini belum memiliki daftar produk.</p>
        </div>
      `;
      return;
    }

    singleFolderGrid.innerHTML = selectedCat.images.map((item) => {
      const price = item.price || 15000000;
      const capacity = item.capacity || '100 Kg / Batch';
      const specs = item.specifications || {};
      const notes = item.notes || {};

      const productObj = {
        ...item,
        categoryName: selectedCat.categoryName,
        folderId: selectedCat.id,
        price,
        capacity,
        specifications: specs,
        notes: notes
      };

      const productJson = JSON.stringify(productObj).replace(/"/g, '&quot;');

      return `
        <div class="gallery-card">
          <div class="card-img-wrapper" onclick="openLightbox(${productJson})">
            <img src="${item.imagePath}" alt="${item.title}" loading="lazy" />
            <span class="card-badge"><i class="fas fa-tachometer-alt"></i> ${capacity}</span>
            <div class="card-overlay-btn">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
          <div class="card-content">
            <div>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-description">${item.description}</p>
              
              <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                <i class="fas fa-microchip" style="color: var(--primary);"></i> <strong>Panel:</strong> ${specs.panelUsed || 'Digital Panel'}
              </div>
              
              <div style="font-weight: 800; font-size: 19px; color: var(--primary); margin-bottom: 12px;">
                Rp ${price.toLocaleString('id-ID')}
              </div>
            </div>
            <div class="card-footer" style="flex-direction: column; gap: 10px; align-items: stretch;">
              <button class="btn btn-secondary" onclick="openLightbox(${productJson})" style="width: 100%; justify-content: center;">
                <i class="fas fa-info-circle"></i> Lihat Spesifikasi Lengkap
              </button>
              <button class="btn btn-primary" onclick="openOrderModal(${productJson})" style="background: #22c55e; width: 100%; justify-content: center; padding: 10px;">
                <i class="fab fa-whatsapp"></i> Beli via WA
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('toko').scrollIntoView({ behavior: 'smooth' });
  };

  if (backToFoldersBtn) {
    backToFoldersBtn.addEventListener('click', () => {
      renderFolderAlbumGrid();
      document.getElementById('toko').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ==========================================
  // 5. LIGHTBOX MODAL DETAIL SPESIFIKASI
  // ==========================================
  window.openLightbox = function (item) {
    // Media gambar multi-slide (1 s/d 5 gambar)
    let imgs = (item.images && item.images.length > 0) ? item.images : [item.imagePath || '/images/gpm-16.jpeg'];
    currentImages = imgs;
    currentImageIndex = 0;

    updateSliderDisplay();

    if (modalCategory) modalCategory.innerText = item.categoryName || 'GRADE KATALOG';
    if (modalTitle) modalTitle.innerText = item.title;
    if (modalDesc) modalDesc.innerText = item.description;

    // Spesifikasi & Kapasitas
    if (modalCapacity) modalCapacity.innerText = item.capacity || '100 Kg / Batch';

    const specs = item.specifications || {};
    if (modalMatType) modalMatType.innerText = specs.materialType || 'Stainless Steel SUS304';
    if (modalPanelUsed) modalPanelUsed.innerText = specs.panelUsed || 'Digital Control Panel';
    if (modalManualBook) modalManualBook.innerText = specs.manualBook || 'Termasuk (Cetak & Digital PDF)';

    // Catatan PPN & Garansi
    const notes = item.notes || {};
    if (modalNotePpn) modalNotePpn.innerText = notes.ppnNote || 'Harga belum termasuk PPN 11%';
    if (modalNoteWarranty) modalNoteWarranty.innerText = notes.warranty || 'Garansi Resmi 1 Tahun';

    const price = item.price || 15000000;
    if (modalPrice) modalPrice.innerText = `Rp ${price.toLocaleString('id-ID')}`;

    if (modalBuyBtn) {
      modalBuyBtn.onclick = () => {
        closeLightbox();
        openOrderModal(item);
      };
    }

    // Status awal accordion: terbuka (open)
    if (collapsibleSpecs) collapsibleSpecs.classList.add('open');
    if (specsToggleIcon) specsToggleIcon.className = 'fas fa-chevron-up';

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeLightbox);

  // ==========================================
  // 6. WHATSAPP ORDER FORM MODAL
  // ==========================================
  window.openOrderModal = function (product) {
    const price = product.price || 15000000;

    orderProductTitle.innerText = product.title;
    orderProductPrice.innerText = `Harga: Rp ${price.toLocaleString('id-ID')} (${product.capacity || ''})`;

    orderProductTitleInput.value = product.title;
    orderProductPriceInput.value = price;
    orderFolderIdInput.value = product.categoryName || product.folderId || 'Grade Katalog';

    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeOrderModal() {
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (orderModalCloseBtn) orderModalCloseBtn.addEventListener('click', closeOrderModal);

  // Mengirim Form Pemesanan ke WhatsApp & MongoDB Order History
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const customerName = document.getElementById('custName').value.trim();
      const customerPhone = document.getElementById('custPhone').value.trim();
      const quantity = document.getElementById('custQty').value;
      const notes = document.getElementById('custNotes').value.trim();

      const productTitle = orderProductTitleInput.value;
      const price = orderProductPriceInput.value;
      const folderId = orderFolderIdInput.value;

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            customerPhone,
            productTitle,
            folderId,
            quantity,
            price,
            notes
          })
        });

        const data = await response.json();

        if (data.success && data.waUrl) {
          closeOrderModal();
          orderForm.reset();
          // Pengalihan langsung ke WhatsApp Segandu
          window.open(data.waUrl, '_blank');
        } else {
          alert(data.error || 'Gagal mengirim pemesanan.');
        }
      } catch (err) {
        alert('Terjadi kesalahan saat memproses pesanan ke WhatsApp.');
      }
    });
  }

  // Panggilan Inisialisasi Utama
  fetchGalleryData();
});
