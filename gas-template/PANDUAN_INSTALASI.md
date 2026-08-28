# 📚 Panduan Instalasi Portofolio & CMS (Google Apps Script)

Panduan ini akan membantu Anda atau pembeli *template* ini untuk menghubungkan aplikasi web Frontend dengan backend **Google Sheets** (Database) dan **Google Drive** (Penyimpanan Gambar).

## 🛠️ Langkah 1: Siapkan Folder Google Drive (Untuk Gambar)
1. Buka [Google Drive](https://drive.google.com).
2. Buat folder baru, beri nama sesuai keinginan (misal: `Gambar Portofolio Web`).
3. **SANGAT PENTING**: Klik kanan pada folder tersebut > **Bagikan (Share)**. 
4. Ubah **Akses Umum** dari "Dibatasi" menjadi **"Siapa saja yang memiliki link" (Anyone with the link)**. Peran atur sebagai **Pelihat (Viewer)**.
5. Buka folder tersebut, lalu salin **ID Folder** dari URL browser Anda. 
   *(Contoh: Jika URL-nya `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoP`, maka ID-nya adalah `1aBcDeFgHiJkLmNoP`).* Simpan ID ini.

## 📊 Langkah 2: Buat Database di Google Sheets
1. Buka [Google Sheets](https://sheets.google.com) dan buat *Spreadsheet* kosong baru. Beri nama (misal: `Database Portofolio`).
2. Pada menu di bagian atas, klik **Ekstensi (Extensions) > Apps Script**. Tab baru berisi editor kode akan terbuka.

## 💻 Langkah 3: Masukkan Kode API Google Apps Script
1. Di editor Apps Script, Anda akan melihat file bernama `Code.gs`. Hapus semua kode bawaan yang ada di sana.
2. Buka file `gas-template/Code.gs` dari folder instalasi ini, lalu salin (copy) semua isinya, dan tempelkan (paste) ke editor Apps Script.
3. **PENTING: Ganti ID Folder Drive Anda.** Cari baris kode `const folderId = 'ISI_DENGAN_ID_FOLDER_DRIVE_ANDA_DI_SINI';` di dalam `Code.gs`, dan ganti teks tersebut dengan ID Folder yang Anda dapatkan di Langkah 1.
4. **OTORISASI (PENTING SEKALI):** Di menu bagian atas (di samping tombol Run/Jalankan), pastikan fungsinya disetel ke **`setup`**. Lalu klik **Jalankan (Run)**.
   * Akan muncul kotak *Authorization Required* (Otorisasi Diperlukan).
   * Klik *Review Permissions* -> Pilih akun Google Anda.
   * Jika muncul peringatan "Google belum memverifikasi aplikasi ini", klik **Lanjutan (Advanced)** -> lalu klik **Buka [Nama Proyek] (tidak aman)**.
   * Klik **Izinkan (Allow)**. Langkah ini wajib agar script memiliki izin ke Google Drive Anda.
5. *(Opsional - Jika Anda ingin menggunakan UI Google Apps Script standar)*: Tambahkan dua file HTML baru dengan nama `Index` dan `Admin` (perhatikan huruf besar di awal), lalu copy-paste isi file `gas-template/Index.html` dan `gas-template/Admin.html`.
6. Simpan proyek dengan mengklik ikon Disket (Save).

## 🚀 Langkah 4: Terapkan (Deploy) Aplikasi Web
1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan (Deploy)** > **Deployment baru (New deployment)**.
2. Klik ikon roda gigi ⚙️ di sebelah tulisan "Pilih jenis", lalu pilih **Aplikasi Web (Web app)**.
3. Isi formulir pengaturan dengan kriteria berikut:
   * **Deskripsi:** Versi 1.0 (atau bebas)
   * **Jalankan sebagai (Execute as):** Pilih **Saya (Me)**. *(Wajib, agar script berhak menulis ke Google Sheet Anda).*
   * **Siapa yang memiliki akses (Who has access):** Pilih **Siapa saja (Anyone)**. *(Wajib, agar website Frontend bisa membaca API ini).*
4. Klik **Terapkan (Deploy)**.
5. Anda mungkin akan diminta memberikan otorisasi akses. 
   * Klik *Review Permissions* -> Pilih akun Google Anda.
   * Jika muncul peringatan keamanan, klik **Lanjutan (Advanced)** di bagian bawah -> klik **Buka [Nama Proyek] (tidak aman)**.
   * Klik **Izinkan (Allow)**.
6. Anda akan mendapatkan **URL Aplikasi Web (Web App URL)**. Salin URL ini (biasanya berakhiran `/exec`).

## 🔗 Langkah 5: Hubungkan ke Panel Admin Website Anda
1. Buka alamat website portofolio utama Anda.
2. Akses halaman Admin dengan mengklik menu "Admin" di bagian bawah, atau tambahkan `/admin` di URL Anda.
3. Masukkan password admin standar: `M@r11091995`
4. Gulir halaman ke bawah menuju blok **API Configuration (Integration Settings)**.
5. Tempelkan (paste) URL Aplikasi Web (dari Langkah 4) ke dalam kotak input yang disediakan.
6. Klik **SIMPAN PENGATURAN**.

🎉 **SELESAI!** Website Anda kini telah sepenuhnya menjadi sistem Full-Stack CMS. Semua data portofolio baru akan masuk secara otomatis ke dalam baris Google Sheets Anda, dan gambarnya tersimpan aman di Google Drive Anda.

---
### ⚠️ CATATAN PENTING
Jika di masa depan Anda melakukan pembaruan atau modifikasi pada skrip `Code.gs` di Google Apps Script, Anda tidak bisa hanya menekan tombol Save. Anda **WAJIB** mendeploy versi baru agar perubahannya aktif:
1. Klik **Terapkan (Deploy)** > **Kelola deployment (Manage deployments)**.
2. Klik ikon pensil ✏️ (Edit) di pojok kanan atas pop-up.
3. Pada dropdown **Versi (Version)**, pilih **Versi baru (New version)**.
4. Klik **Terapkan (Deploy)**.
