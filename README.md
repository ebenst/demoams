# 🏢 Huta Asset Management (Enterprise Production Version)

Sistem Informasi Manajemen Aset, Penelusuran Kondisi Fisik, Penjadwalan Maintenance, serta Kepatuhan Audit berbasis QR Code terintegrasi dengan pengamanan rute Next.js Middleware.

## 🚀 Fitur Utama Versi Produksi:
1. **Next.js 14 API Routes & Middleware Guard:** Penanganan API backend native dengan interceptor `/login` aman untuk semua request non-sesi.
2. **Prisma ORM & PostgreSQL (Neon/Supabase Support):** Konsistensi relasional data dan migrasi aman.
3. **Seeder Siap Pakai:** Script pengisi database untuk 150 aset nyata siap dijalankan dalam sekali perintah.

---

## 🛠️ Langkah Menjalankan Aplikasi di Lokal

1. **Atur Variabel Lingkungan (.env):**
   Ubah nama berkas `.env.example` menjadi `.env` lalu isi dengan kredensial database Neon PostgreSQL Anda.

2. **Pasang Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Migrasi Database (Prisma):**
   ```bash
   npx prisma migrate dev --name init_Huta_schema
   ```

4. **Jalankan Seeder Database:**
   Memasukkan data kategori default, user demo, dan 150 aset:
   ```bash
   npx prisma db seed
   ```

5. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka **http://localhost:3000** untuk mengakses aplikasi.