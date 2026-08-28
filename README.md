# Portfolio App with Google Apps Script (GAS) Backend

Aplikasi portofolio responsif berbasis React (Vite) yang menggunakan Google Spreadsheet & Google Apps Script (GAS) sebagai database tanpa biaya (serverless).

## 🚀 Tutorial Deployment (Hosting)

### TAHAP 1: Konfigurasi Database (Google Apps Script & Spreadsheet)
Aplikasi ini menggunakan Google Spreadsheet sebagai *database* tanpa biaya.
1. Buka [Google Sheets](https://docs.google.com/spreadsheets/) dan buat *spreadsheet* baru.
2. Klik menu **Ekstensi > Apps Script**.
3. Buka folder `gas-template` di repositori ini, dan *copy* isi file `Code.gs` ke dalam editor Apps Script.
4. Klik tombol biru **Terapkan (Deploy) > Deployment Baru**.
5. Pilih jenis: **Aplikasi Web (Web App)**.
   * Deskripsi: Terserah Anda (misal: "API Portfolio v1").
   * Jalankan sebagai: **Saya (Email Anda)**.
   * Siapa yang memiliki akses: **Siapa saja (Anyone)**.
6. Klik **Terapkan (Deploy)**, dan berikan izin otorisasi saat diminta.
7. Anda akan mendapatkan **URL Aplikasi Web**. Simpan URL ini baik-baik. (Bentuknya seperti: `https://script.google.com/macros/s/.../exec`).
8. Jika Anda ingin mengubah URL GAS default, masukkan URL tersebut pada pengaturan di halaman Admin aplikasi Anda.

---

### TAHAP 2: Deploy ke Vercel (Gratis & Paling Mudah - Rekomendasi)
Vercel adalah platform terbaik untuk aplikasi berbasis React/Vite. Repositori ini sudah dilengkapi `vercel.json` sehingga *API routing* ke Apps Script otomatis terkonfigurasi.

1. Buka [vercel.com](https://vercel.com/) dan *Login* menggunakan akun GitHub Anda.
2. Di *Dashboard* Vercel, klik tombol **Add New...** lalu pilih **Project**.
3. Di bagian *Import Git Repository*, pilih repositori ini dan klik **Import**.
4. Di bagian **Configure Project**:
   * *Framework Preset*: Biarkan terdeteksi otomatis sebagai **Vite**.
   * *Root Directory*: Biarkan kosong (`./`).
   * *Build and Output Settings*: Tidak perlu diubah (`npm run build` dan folder output `dist`).
5. Klik **Deploy** dan tunggu prosesnya (biasanya kurang dari 1 menit).
6. Selesai! Vercel akan otomatis mengenali konfigurasi `vercel.json` dan menyambungkan *API routing* ke Google Apps Script.

---

### TAHAP 3 (Opsional): Deploy ke Render.com (Alternatif Full-Stack)
Jika Anda ingin menggunakan fitur *server backend* Node.js / Express bawaannya (`server.ts`):

1. Daftar di [Render.com](https://render.com/) menggunakan akun GitHub.
2. Klik **New +** > **Web Service**.
3. Hubungkan repositori GitHub ini.
4. Pengaturan utama:
   * *Runtime*: Node
   * *Build Command*: `npm install && npm run build`
   * *Start Command*: `npm start`
5. Pilih *Free Plan* dan klik **Create Web Service**.

---

### ⚠️ Tips Penting: Update Code di Apps Script
Jika suatu saat Anda memodifikasi kode `.gs` di Google Apps Script (misalnya menambah fitur/kolom database baru), Anda **WAJIB** membuat **Deployment Baru** (jangan hanya menekan tombol *Save/Simpan*). Jika tidak, *website* akan tetap memanggil versi kode yang lama.
