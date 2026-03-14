# BJurnal — Intelligent Learning Journal

BJurnal adalah aplikasi jurnal pembelajaran digital yang dirancang untuk membantu murid mencatat materi pelajaran secara cerdas dan memungkinkan guru untuk memantau perkembangan belajar murid secara real-time.

## 🚀 Fitur Utama

### 🎓 Untuk Murid
- **Smart Note Editor**: Editor teks kaya (Rich Text) dengan fitur auto-save setiap 60 detik.
- **Refleksi Pembelajaran**: Bagian khusus untuk mencatat pemikiran dan pemahaman murid terhadap materi.
- **Arsip Catatan**: Riwayat lengkap seluruh catatan yang pernah dibuat selama masa sekolah.
- **Kelas Dinamis**: Pengajuan perpindahan kelas yang terintegrasi dengan persetujuan guru.

### 📚 Untuk Guru
- **Session Manager**: Membuat dan mengelola sesi pembelajaran aktif dengan durasi tertentu.
- **Submission Tracker**: Memantau status pengerjaan murid (Belum Masuk, Draft, Terkirim) secara instan.
- **Review Panel**: Membaca dan meninjau catatan serta refleksi murid setelah sesi berakhir.
- **Persetujuan Kelas**: Memvalidasi permintaan pindah kelas dari murid.

### 🔑 Untuk Admin
- **Manajemen Akun**: Vetting dan persetujuan akun baru (Guru/Murid) untuk menjaga keamanan sistem.
- **Oversight**: Akses ke seluruh sistem manajemen data.

## 🛠️ Tech Stack

- **Frontend**: Vite + React.js, Vanilla CSS, Lucide React (Icons).
- **Backend**: Node.js + Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT Authentication, Bcrypt Password Hashing.

## ⚙️ Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd BJurnal
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Buat file `.env` di dalam folder `backend` dan isi:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Setup Frontend
```bash
cd ..
npm install
```

## 🏃 Menjalankan Aplikasi

### Jalankan Backend
```bash
cd backend
npm run dev
```

### Jalankan Frontend
```bash
# Dari root directory
npm run dev
```

## 🔒 Akun Default (Admin)

Untuk akses awal dan manajemen akun pertama kali, gunakan kredensial berikut:
- **Nomor Induk:** `admin001`
- **Password:** `admin123`

> [!IMPORTANT]
> Segera ganti password admin setelah login pertama kali di halaman Profil.

## 🛡️ Kebijakan Keamanan
Seluruh pendaftaran akun baru akan berstatus **Pending** secara default dan memerlukan persetujuan dari Admin melalui menu "Manajemen Akun" sebelum bisa digunakan untuk login.
