# Website Profil Perusahaan + Infografis Kepatuhan K3

Scaffold berbasis Google Apps Script, HTML/CSS/JavaScript, dan Google Spreadsheet.

## Konsep
Website company profile sebagai fokus utama, dengan satu bagian khusus Infografis Kepatuhan K3. Admin mengelola konten melalui dashboard. Pengunjung umum tidak perlu login.

## Fitur Interaktif Baru & Dedicated Admin Portal

1. **Website Interaktif & Responsif (Landing Page)**:
   - **Navbar Modern & Proporsional**: Nama perusahaan tampil memanjang horizontal dalam satu baris tanpa terpecah (`white-space: nowrap`), logo proporsional, dan menu navigasi responsif yang otomatis beralih ke menu hamburger pada layar tablet/smartphone.
   - **Modern Design & Typography (Tema Hijau K3)**: Mengusung tema keselamatan kerja modern, profesional, dan elegan dengan palet warna resmi K3: Hijau tua (`#14532D`), Hijau utama (`#15803D`), Emerald (`#059669`), Putih (`#FFFFFF`), dan Abu-abu muda (`#F8FAFC`).
   - **Fitur Struktur Organisasi Berbasis Gambar**: Menampilkan bagan struktur organisasi berbasis gambar dengan `object-fit: contain` untuk menjaga rasio asli gambar, fitur zoom pratinjau penuh, serta pesan fallback *"Struktur organisasi belum tersedia"* jika gambar belum diunggah.
   - **Hero Interaktif & Animated Stats Strip**: Menampilkan counter statistik tahun berdiri, jumlah tenaga kerja, klasifikasi bahaya kerja, serta persentase kepatuhan K3 terkini.
   - **Gauge Kepatuhan K3 Dinamis**: Visualisasi lingkaran persentase kepatuhan dengan predikat status (Sangat Baik / Memenuhi / Perlu Evaluasi).
   - **Filter & Live Search Indikator K3**: Pengunjung dapat mencari indikator spesifik atau memfilter berdasarkan status (*Semua*, *Memenuhi Standar*, *Perlu Evaluasi*).
   - **Modal Pop-up Detail Indikator & Layanan**: Klik pada kartu untuk melihat rincian standar, realisasi, dan konsultasi via WhatsApp.
   - **Tab Profil Interaktif**: Navigasi tab untuk Sejarah & Profil, Visi & Misi K3, Data Teknis & Legalitas, serta Identifikasi Bahaya (HIRADC).
   - **Galeri Lightbox & Aksi Kontak Cepat**: Galeri dokumentasi dengan pratinjau penuh dan tombol salin kontak satu-klik.

2. **Dedicated Admin Portal (Tempat Khusus Admin)**:
   - **Kelola Gambar Struktur Organisasi**: Admin dapat mengunggah gambar bagan struktur organisasi (format JPG, JPEG, PNG, WEBP hingga 5 MB), melihat pratinjau sebelum disimpan, mengganti gambar, atau menghapus gambar yang tersimpan di Google Spreadsheet.
   - **Terpisah dari Tampilan Publik**: Setelah login, antarmuka beralih ke layout aplikasi dashboard manajemen admin penuh dengan sidebar navigasi mandiri.
   - **Ikon & Tombol "Kembali ke Website"**:
     - Terletak menonjol di bagian atas sidebar (`btn-return-web`) dengan ikon panah kembali.
     - Terdapat juga shortcut tombol di topbar admin (`topbar-return-web`) untuk akses instan kembali ke landing page kapan saja.
   - **Floating Switcher di Landing Page**: Saat admin sedang login dan mengunjungi landing page publik, banner atas menampilkan status aktif dan tautan cepat untuk kembali ke Dashboard Admin tanpa perlu login ulang.
   - **Halaman Login Standalone**: Halaman login mandiri yang dilengkapi tombol kembali ke website dan pengisi akun demo otomatis untuk kemudahan pengujian.

- Kelola profil: nama, tagline, logo, banner, sejarah, visi, misi, bidang usaha, tahun berdiri, alamat, kota, telepon, email, website, jumlah pekerja, klasifikasi bahaya, dan ringkasan potensi bahaya.
- Kelola layanan/fasilitas.
- Kelola struktur organisasi.
- Kelola galeri.
- Kelola kontak dan tautan media sosial.
- Kelola master indikator K3.
- Kelola standar minimum K3.
- Input data aktual K3.
- Jalankan perhitungan otomatis.
- Lihat dan cetak laporan.
- Ganti password.

### Pengguna umum
- Beranda.
- Profil perusahaan.
- Layanan dan fasilitas.
- Infografis K3.
- Galeri.
- Struktur organisasi.
- Kontak perusahaan.
- Tidak memiliki akses mengubah data.

## Instalasi
1. Buat Google Spreadsheet baru.
2. Buka Extensions > Apps Script.
3. Tempel `Code.gs`.
4. Tambahkan file HTML bernama `Index`, tempel `Index.html`.
5. Simpan, lalu jalankan fungsi `setup()` satu kali dan setujui permintaan izin.
6. Deploy > New deployment > Web app.
7. Execute as: Me.
8. Who has access: Anyone (agar website company profile dapat diakses publik).
9. Buka URL deployment.

## Login awal
Username: `admin`
Password: `GantiAdminK3!2026`

Segera ubah password dari menu Admin > Password. Jangan membagikan spreadsheet database kepada publik; hanya bagikan URL web app.

## Struktur Spreadsheet
- Users
- ProfilPerusahaan
- Layanan
- StrukturOrganisasi
- Galeri
- Kontak
- IndikatorK3
- StandarK3
- DataAktualK3
- HasilPerhitungan
- RiwayatUpdate

## Catatan penting tentang perhitungan K3
- Nilai awal pada sheet `StandarK3` adalah placeholder 0, bukan ketentuan hukum.
- Metode perhitungan scaffold: nilai aktual dibandingkan nilai minimum (aktual >= minimum); indikator bersatuan `status` dinilai memenuhi jika aktual >= 1.
- Rumus kebutuhan APAR, hidran, sprinkler, personel kebakaran, simulasi, dan inspeksi harus diverifikasi dan dikembangkan sesuai regulasi K3 yang berlaku serta karakteristik tempat kerja sebelum digunakan untuk menyatakan kepatuhan resmi.
- Sistem ini menampilkan satu profil perusahaan. Untuk multi-perusahaan perlu pengembangan pemilihan profil dan pemisahan hasil per perusahaan.
- URL gambar/logo/banner harus berupa URL gambar yang dapat diakses publik. Untuk produksi, pertimbangkan penyimpanan aset pada layanan file yang sesuai dan validasi URL.
- Google Apps Script dan Spreadsheet memiliki batas kuota serta bukan pengganti database transaksional untuk beban besar.
- Akun login awal hanya satu admin. Jika dibutuhkan banyak admin dengan role berbeda, kembangkan manajemen pengguna dan hak akses terperinci.
