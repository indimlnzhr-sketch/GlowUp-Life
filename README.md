# GlowUp Life ✨
**Grow, Heal, Glow**

GlowUp Life adalah asisten digital pintar yang dirancang untuk membantu Anda mencapai versi terbaik diri Anda setiap hari.

## Fitur Utama
- 🤖 **GlowUp AI Assistant**: Chatbot pintar (Gemini API) untuk curhat, motivasi, dan tanya jawab.
- 👁️ **Vision AI**: Unggah foto atau screenshot untuk dianalisis oleh AI.
- 💖 **Mood Tracker**: Catat suasana hati harian dan dapatkan insight.
- 🧘 **Habit Tracker**: Bangun kebiasaan baik dengan sistem checklist dan statistik.
- 💰 **Savings Tracker**: Kelola target tabungan dan pantau progress keuangan Anda.
- 🏃 **Health Dashboard**: Pantau jam tidur, konsumsi air, dan aktivitas fisik.
- 🚨 **SOS Darurat**: Akses cepat ke kontak darurat dan tombol panik untuk keamanan.
- 🌍 **Multi-Language**: Tersedia dalam Bahasa Indonesia (Default) dan English.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Express.js (proxy for Gemini API).
- **Database & Auth**: Supabase.
- **AI**: Google Gemini Pro & Vision.

## Cara Setup (PENTING)

### 1. Supabase Setup
1. Buat proyek baru di [Supabase](https://supabase.com).
2. Pergi ke **SQL Editor** dan salin konten dari file `supabase_schema.sql` lalu jalankan (`Run`).
3. Dapatkan **URL** dan **Anon Key** dari menu Settings > API.
4. Masukkan ke dalam **Secrets** di AI Studio:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Google AI Studio Setup
1. Pastikan Anda memiliki `GEMINI_API_KEY` di panel **Secrets** AI Studio.

### 3. Jalankan Aplikasi
1. Setelah Secrets diatur, aplikasi akan otomatis memuat data.
2. Gunakan Register/Login untuk masuk ke dashboard utama.

## Deploy ke Vercel
Aplikasi ini siap di-deploy ke Vercel. Pastikan Anda mengatur Environment Variables yang sama di dashboard Vercel Anda.

---
Dibuat dengan ❤️ untuk perjalanan Glow-Up Anda.
