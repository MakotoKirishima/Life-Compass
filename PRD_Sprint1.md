# Life Compass — PRD Sprint 1 (Final)
## Versi Build: Sendiri, Rp0, 10 Hari, Langsung Publik

| Metadata | Detail |
|----------|--------|
| **Versi** | Sprint 1.2 (final) |
| **Tanggal** | 2026-06-27 |
| **Tim** | 1 orang (founder tunggal) |
| **Budget** | Rp0 (domain sudah punya) |
| **Target Rilis** | 10 hari |
| **Model** | B2C gratis + bayar (Mayar.id @ Rp25.000) |

---

## 1. Perubahan dari PRD v4.1

| Aspek | v4.1 (Asli) | Sprint 1.2 |
|-------|-------------|------------|
| Riset validasi | 15-25 wawancara + fake-door | Dilewati |
| Persona | 2 prioritas + 2 sekunder | Semua 4 didukung, **Bagus prioritas utama** |
| Database karir | 80+ bertahap | 80+ langsung — 10 kategori, diisi AI + review manual |
| Harga | Rp29-49rb | **Rp25.000** (sekali bayar, akses seumur hidup) |
| Admin | Tidak dibahas detail | **Super Admin**: kelola karir, landing page, user, payment |
| Discovery | 8-12 menit | Tetap 8-12 menit, **format centang dari daftar** |
| Database engine | PostgreSQL | **SQLite** (ringan, backup tiap jam ke Cloudflare R2) |
| Scoring engine | Structured 80% + AI 20% | **AI (Gemini) full scoring** + cache untuk konsistensi |
| PDF | Server-side wkhtmltopdf | **HTML → PDF di browser** (client-side JS) |
| Customer support | Tidak dibahas | **FAQ + AI Chatbot** (khusus life-compass) |
| Legal | Disclaimer | **Disclaimer + Privacy Policy + Terms of Service** |
| Timeline | 3-5 bulan | **10 hari** |

---

## 2. Target Pengguna (4 Persona)

**Bagus (pekerja awal 22-29) prioritas utama.** Tiga lainnya tetap dapat hasil relevan dari sistem yang sama.

| Persona | Usia | Masalah Utama | Janji |
|---------|------|---------------|-------|
| **Rina** — Mahasiswa | 17-22 | Bingung jurusan, tekanan ortu | *"Temukan jurusan/karir yang cocok"* |
| **Bagus** — Pekerja awal | 22-29 | Bingung arah, khawatir AI | *"Ubah kebingungan jadi rencana 7 hari"* |
| **Dian** — Pindah karir | 30-40 | Takut kehilangan yang sudah dibangun | *"Petakan jalur transisi pakai skill yang ada"* |
| **Sari** — Naik jabatan | 25-35 | Butuh skill gap & arah selanjutnya | *"Tahu skill yang harus dibangun"* |

---

## 3. Fitur MVP (10 Hari)

### 3.1 Landing Page
- User baru WAJIB lewat landing page sebelum masuk
- User yang sudah login langsung ke dashboard
- Admin bisa ubah konten (teks, gambar, testimoni, harga) dari dashboard
- Mobile-first
- **Non-login bisa lihat 1 contoh hasil (sample report)** — strategi: orang lihat contoh, tertarik, baru daftar
- **Testimoni**: Diisi dengan testimoni fiktif dari admin (sebelum ada user nyata)
- Semua konten landing page + FAQ + blog SEO + skrip keluarga + trivia karir di-**generate AI** (Gemini), di-review admin sebelum publikasi
- **Value Proposition** (kenapa bukan ChatGPT):
  1. **Discovery terstruktur** — 7 bagian, hasil lebih akurat daripada nanya random ke AI
  2. **Data karir Indonesia** — gaji PNS, prospek Driver Online, jalur masuk BUMN — yang AI umum tidak tahu detailnya
  3. **Langsung action** — gratis dapat rencana 7 hari konkret, bukan cuma saran teks
  → Landing page harus sampaikan 3 ini dengan jelas

### 3.2 Autentikasi
- Google OAuth (prioritas) + Email opsional
- JWT access + refresh token
- User bisa hapus akun & export data

### 3.3 Fast Discovery Journey (8-12 menit)
7 bagian, **format centang/pilih dari daftar**:

| Bagian | Contoh Isi | Wajib? |
|--------|-----------|--------|
| 1. Situasi | Pelajar/Mahasiswa/Lulus/Kerja/Pindah karir | Ya |
| 2. Minat | Pilih aktivitas yang disukai (dari 15-20 pilihan) | Ya |
| 3. Nilai kerja | Pilih 3-5 nilai terpenting (gaji, kreativitas, dll) | Ya |
| 4. Keahlian | Centang skill yang dimiliki dari daftar | Ya |
| 5. Kendala | Pilih kendala yang relevan (lokasi, biaya, dll) | Ya |
| 6. Preferensi kerja | Sendiri/tim, rutin/variasi, kantor/remote | Tidak |
| 7. Refleksi | *"Apa yang bikin kamu stuck?"* — isian teks (dienkripsi) | Tidak |

Progress bar, back/forward, bisa disimpan dan dilanjutkan.

**Loading saat AI memproses**: Setelah user klik "Lihat Hasil", AI butuh 10-30 detik. Tampilkan:
1. **Animasi loading** — ikon compass berputar
2. **Progress stage** — teks berganti tiap ~5 detik: "Mencocokkan minat...", "Menganalisa skill...", "Membandingkan dengan 80 karir...", "Menyusun rekomendasi..."
3. **Trivia karir** — fakta singkat muncul di bawah progress (contoh: *"Tahukah kamu? UI/UX Designer masuk 10 besar karir dengan pertumbuhan tercepat di Indonesia."*)

**Riwayat hasil**: Jika user isi discovery ulang, hasil LAMA tetap disimpan. User bisa lihat riwayat di dashboard — bandingkan hasil dulu vs sekarang.

### 3.4 Free Direction Snapshot (Output Gratis)
- Ringkasan profil pribadi (dibantu AI)
- **1 rekomendasi karir utama** + penjelasan AI "kenapa cocok"
- 1 karir eksplorasi alternatif
- 1 risiko peringatan
- 1 rencana eksperimen 7 hari (tugas konkret)
- Tombol: Simpan / Bagikan (privasi terjaga) / Buka Laporan Lengkap

### 3.5 Full Compass Report (Berbayar — Rp25.000)
Akses seumur hidup setelah bayar:
- **3 kartu karir teratas** dengan detail lengkap
- Analisis skill gap (yang sudah vs yang kurang)
- Peta jalan 30 hari (langkah per minggu)
- **Skrip diskusi keluarga** — poin-poin argumen yang bisa dipakai user untuk menjelaskan pilihan karir ke orang tua/keluarga. Contoh: *"Ibu, setelah tes ini, saya cocok jadi X karena keahlian saya di Y dan prospeknya di Indonesia adalah Z."* AI generate berdasarkan profil user.
- Lihat di web + **download PDF (client-side)**
- Catatan bukti karir yang lebih dalam

### 3.6 Dashboard User (setelah login)
Halaman pertama yang dilihat user setelah login — **dashboard mix**:
- **Pertama kali (belum pernah isi)**: "Mulai Perjalanan Karirmu" — tombol besar + penjelasan singkat + contoh hasil
- **Pernah isi (punya hasil)**: Ringkasan snapshot terakhir + tombol "Lihat Detail" + tombol "Buat Ulang Discovery"
- **Riwayat**: Link ke halaman riwayat hasil (semua hasil discovery yang pernah dibuat)
- **CTA upgrade**: Jika belum bayar, tampilkan "Buka Laporan Lengkap Rp25.000" dengan subtle styling

### 3.7 Rencana Eksperimen 7 Hari (halaman khusus)
- 7 tugas harian, centang selesai
- Progress bar
- Tugas tambahan jika semua selesai

### 3.8 Super Admin Dashboard
| Halaman | Fungsi |
|---------|--------|
| Dashboard | Ringkasan: total user, user aktif, selesai discovery, total payment |
| Daftar User | Tabel + pencarian, lihat detail & riwayat rekomendasi |
| Kelola Karir | Tambah/edit/hapus 80+ karir, filter per kategori, **tombol Bantu AI** |
| Atur Landing Page | Edit teks, upload gambar, testimoni, harga |
| Lihat Payment | Tabel: user, produk, jumlah, status, tanggal |
| Pengaturan | API key Gemini, backup, pengumuman |

### 3.9 FAQ + AI Chatbot (FITUR BARU)
**FAQ**: Halaman tanya-jawab umum tentang Life Compass
- Cara pakai, cara bayar, apa itu Direction Snapshot, dll
- Bisa dicari (search)

**AI Chatbot**: Support langsung dari AI (Gemini)
- Hanya bisa jawab pertanyaan seputar Life Compass
- Tidak bisa membahas topik lain
- Muncul sebagai ikon chat di pojok kanan bawah
- Sistem prompt: berisi semua informasi produk, fitur, harga, cara pakai
- Fallback: jika AI tidak bisa jawab, arahkan ke FAQ

---

## 4. Database Karir — 80+ Jalur, 10 Kategori

### 4.1 Struktur Setiap Karir
| Field | Contoh | Sumber |
|-------|--------|--------|
| Nama | UI/UX Designer | Admin |
| Kategori | Teknologi | Admin |
| Deskripsi | Merancang tampilan & pengalaman pengguna | AI generate |
| Tugas umum | Wireframe, prototype, user research | AI generate |
| Skill wajib | Figma, Design Thinking | AI generate |
| Skill opsional | HTML/CSS, Motion Design | AI generate |
| Jalur pendidikan | DKV, Sistem Informasi, Bootcamp | AI generate |
| Gaji (junior-senior) | Rp5-20 juta | **Dari sumber publik** (Jobstreet, Glints, BPS) + AI bantu rangkum |
| Prospek pasar | Tinggi/Sedang/Rendah | **Dari sumber publik** |
| Risiko AI | Rendah/Sedang/Tinggi | AI generate + review |
| Sumber data | [link job portal / artikel] | Admin input |
| Tanggal review | 2026-06-27 | Otomatis |

### 4.2 10 Kategori (80 Karir)

**🖥️ Teknologi (12)**: Frontend, Backend, Full Stack, Mobile Developer, UI/UX, Data Analyst, Data Scientist, DevOps, IT Support, Cyber Security, Database Admin, QA Engineer

**🏥 Kesehatan (8)**: Dokter Umum, Dokter Spesialis, Perawat, Bidan, Apoteker, Ahli Gizi, Analis Kesehatan, Fisioterapis

**📚 Pendidikan (6)**: Guru SD, Guru SMP/SMA, Dosen, Tutor, Instruktur Kursus, Tenaga Kependidikan

**🏛️ Pemerintahan & BUMN (10)**: PNS Admin, PNS Teknis, TNI AD/AL/AU, Polri, Diplomat, BUMN Bank, BUMN Non-Bank, Pemda

**🎨 Kreatif & Media (8)**: Content Creator, Graphic Designer, Video Editor, Fotografer, Penulis, Social Media Specialist, Animator, Copywriter

**💼 Bisnis & Marketing (8)**: Sales, Digital Marketing, BD, HR, Wirausaha, Project Manager, Konsultan Bisnis, Customer Service

**🔧 Teknik non-IT (8)**: Sipil, Arsitek, Elektro, Mesin, Industri, Kimia, Lingkungan, Surveyor

**💰 Keuangan & Hukum (8)**: Akuntan, Auditor, Pengacara, Notaris, Financial Planner, Analis Keuangan, Konsultan Pajak, Legal Officer

**🏨 Jasa & Pariwisata (6)**: Admin Kantor, Chef, Tour Guide, Hotel Staff, Event Organizer, Driver Online

**🌾 Pertanian & Kelautan (6)**: Petani Modern, Peternak, Ahli Perikanan, Penyuluh Pertanian, Teknologi Pangan, Perkebunan

### 4.3 Proses Isi Database
1. Admin tambah karir: input nama + kategori
2. AI Gemini generate draf (deskripsi, skill, gaji estimasi, dll)
3. Admin review, koreksi, cek silang gaji ke sumber publik
4. Klik "Publikasikan"
5. Rata-rata: 5-10 menit per karir → 80 karir ≈ 13 jam kerja admin

---

## 5. AI Strategy

### 5.1 Yang AI Kerjakan (4 fungsi)

| Fungsi | Input | Output | Konsistensi |
|--------|-------|--------|-------------|
| **Scoring rekomendasi** | Jawaban user + data 80 karir | Skor + label fit untuk tiap karir | **Dicache** — hash jawaban user → result sama |
| **Ringkasan profil** | Jawaban discovery user | 2-3 paragraf profil pribadi | Dicache |
| **Penjelasan rekomendasi** | Skor + profil + data karir | *"Kami rekomendasi X karena..."* | Dicache |
| **Bantu admin tulis karir** | Nama + kategori + keyword | Draf deskripsi lengkap | Tidak perlu cache |
| **AI Chatbot support** | Pertanyaan user | Jawaban seputar Life Compass | Real-time |

### 5.2 Konsistensi Hasil (PENTING)
- Setiap hasil rekomendasi di-**cache** berdasarkan hash dari semua jawaban user
- Jika user mengisi discovery dengan jawaban **sama persis** → dapat hasil **sama persis**
- Jika ada jawaban yang **berubah** → hasil baru di-generate + di-cache ulang
- Teknis: cache key = `md5(jawaban_user_json + versi_data_karir)` → simpan di SQLite

### 5.3 Yang AI TIDAK Boleh Lakukan
- Mengarang fakta gaji (harus diverifikasi dari sumber publik)
- Diagnosis mental health
- Janji sukses ("kamu pasti cocok")
- Menjawab pertanyaan di luar topik Life Compass (khusus chatbot)

### 5.4 Prompt Utama Scoring
```
Kamu adalah asisten karir untuk Life Compass. Berikut data user:
[profil_user]

Bandingkan dengan 80 data karir berikut:
[data_karir_json]

Beri skor 0-100 untuk setiap karir berdasarkan:
1. Kecocokan minat (20%)
2. Kecocokan nilai kerja (20%)
3. Kedekatan skill (20%)
4. Kecocokan kendala (15%)
5. Kelayakan pasar (15%)
6. Risiko (10%)

Output: JSON array [{karir_id, skor, label, alasan_singkat}]
Label: Cocok Tinggi (≥80), Cocok Sedang (60-79), Coba Dulu (40-59), Kurang Cocok (<40)
```

---

## 6. Pembayaran (Mayar.id)

| Produk | Harga | Tipe | Akses |
|--------|-------|------|-------|
| Direction Snapshot | **Rp0** | Gratis | Semua user |
| Full Compass Report | **Rp25.000** | Sekali bayar | **Seumur hidup** — lihat web + download PDF |

**Alur**: Free Snapshot → klik "Buka Laporan Lengkap" → redirect Mayar.id → bayar (QRIS/VA/TF) → webhook → unlock → lihat + download PDF

**Fee Mayar.id**: ~5% + Rp2rb → kamu terima ~Rp21.750 per transaksi.

---

## 7. Tech Stack

| Lapisan | Teknologi | Biaya |
|---------|-----------|-------|
| Frontend | Next.js + Tailwind + TypeScript | Gratis (Cloudflare Pages) |
| Backend | FastAPI + SQLAlchemy + Python | Gratis (STB HG680P) |
| Database | **SQLite** | Gratis |
| AI | Gemini API (Google AI Studio) | Gratis (kuota free) |
| Payment | Mayar.id | Potongan per transaksi |
| Auth | Google OAuth + JWT | Gratis |
| Domain | Domain sudah punya | Gratis |
| PDF | **Client-side** (html2pdf.js / browser print) | Gratis |
| Chatbot | Gemini API + custom prompt | Gratis (masuk kuota) |
| Backup | Cron → copy .db → Cloudflare R2 (gratis 10GB) | Gratis |
| Deploy FE | Cloudflare Pages | Gratis |
| Deploy BE | STB HG680P via Cloudflare Tunnel | Gratis |

### Kenapa SQLite?
| Aspek | SQLite | PostgreSQL |
|-------|--------|------------|
| RAM | ~5MB | ~200-500MB |
| Setup | Bikin file langsung jalan | Install+konfigurasi |
| Backup | Copy 1 file .db | butuh pg_dump |
| Untuk MVP | **Cocok** (1 user, traffic rendah) | Berlebihan |

### PDF Client-Side
- Tidak perlu library server berat (wkhtmltopdf/puppeteer)
- Cukup html2pdf.js atau fitur `window.print()` → simpan sebagai PDF
- Laporan di-render di browser → user klik "Download PDF" → browser generate PDF

### Catatan STB HG680P + HDD Enclosure
- **OS**: **Linux** (Armbian/Ubuntu ARM) diinstall di STB
- Backend + SQLite + **gambar landing page** berjalan di STB
- STB terhubung HDD Enclosure — storage lega untuk gambar landing page, backup lokal database, dll
- Auto-restart script + systemd service agar backend otomatis jalan saat STB nyala
- Backup database ke Cloudflare R2 tiap 1 jam + backup lokal ke HDD
- SSL/HTTPS pakai Cloudflare Tunnel (gratis, tanpa perlu expose IP STB)
- Update kode: git pull di STB via SSH, restart service

---

## 8. Flow Aplikasi

```
┌─ TANPA LOGIN ─────────────────────────────┐
│ Landing Page → [Lihat Contoh Hasil]        │
│ (sample report untuk 1 karir)              │
│ → Tertarik? → [Daftar/Login]               │
└────────────────────────────────────────────┘
                     ↓
┌─ LOGIN ────────────────────────────────────┐
│ Dashboard Mix:                              │
│ • Baru pertama: "Mulai Perjalanan" + tombol │
│ • Punya hasil lama: ringkasan + riwayat     │
│ • CTA upgrade (jika belum bayar)            │
└────────────────────────────────────────────┘
                     ↓
    Fast Discovery Journey (8-12 menit, centang)
    ↓ (loading: animasi + progress stage + trivia karir)
    Free Direction Snapshot
    ├── Ringkasan profil (AI + cache)
    ├── 1 rekomendasi utama + penjelasan (AI + cache)
    ├── 1 alternatif eksplorasi
    ├── 1 risiko
    ├── 1 rencana 7-hari (AI + cache)
    └── Tombol: [Simpan] [Bagikan] [Buka Laporan — Rp25.000]
                                        ↓
                                Mayar.id Checkout
                                        ↓
                                Full Compass Report
                                    ├── 3 karir + detail (AI + cache)
                                    ├── Skill gap
                                    ├── Peta 30 hari
                                    ├── Skrip keluarga
                                    ├── Lihat di web
                                    └── Download PDF (client-side)

[FAQ] — bisa diakses kapan saja
[AI Chatbot] — ikon di pojok, tanya jawab seputar Life Compass
[Riwayat] — semua hasil discovery yang pernah dibuat user
```

---

## 9. Rencana Eksekusi — 10 Hari

| Hari | Fokus | Detail |
|------|-------|--------|
| **1** | Setup + Database | FastAPI + SQLAlchemy + SQLite, Next.js + Tailwind, Cloudflare setup, model DB, domain + Cloudflare Tunnel, cron backup |
| **2** | Auth + Landing | Google OAuth endpoint, JWT, halaman login, landing page (gate logic), design mobile-first |
| **3-4** | Discovery Journey | Form 7 bagian (centang), progress bar, save progress, back/forward, validasi, enkripsi refleksi |
| **5-6** | AI Scoring + Karir | Integrasi Gemini (scoring + caching), input 20 karir pertama + AI generate draf, admin dashboard dasar (kelola karir) |
| **7** | Free Snapshot | Ringkasan profil AI, rekomendasi + penjelasan AI, rencana 7-hari AI, halaman snapshot, simpan & bagikan, input 30 karir lagi (total 50) |
| **8** | Payment + Full Report | Mayar.id integrasi, webhook handler, halaman Full Report, lock/unlock logic, input 30 karir sisanya (total 80+), admin lihat user+payment |
| **9** | Chatbot + PDF + Admin CMS | AI Chatbot (system prompt + UI), FAQ halaman, PDF client-side, admin: atur landing page (teks, gambar, testimoni, harga), admin: statistik lengkap, testing |
| **10** | QA + Rilis | Test semua alur, test HP low-end Android, test error cases, perbaiki bug, deploy final, **publikasi** |

---

## 10. AI Chatbot — Detail

### Cara Kerja
1. User klik ikon chat (pojok kanan bawah)
2. Tulis pertanyaan (*"Cara bayarnya gimana?"*, *"Apa beda free dan paid?"*)
3. Backend kirim pertanyaan + **system prompt** ke Gemini
4. Gemini jawab berdasarkan pengetahuan tentang Life Compass
5. Jawaban ditampilkan di chat bubble

### System Prompt Chatbot
```
Kamu adalah asisten resmi Life Compass. Tugasmu hanya menjawab pertanyaan seputar:
- Cara menggunakan Life Compass
- Fitur gratis vs berbayar
- Cara pembayaran (Mayar.id, Rp25.000)
- Cara baca hasil rekomendasi
- Cara bagikan hasil
- Kebijakan privasi
- Cara hapus akun

Jika ditanya di luar topik Life Compass, jawab:
"Maaf, saya hanya bisa membantu pertanyaan seputar Life Compass. Silakan cek FAQ atau hubungi support."

Gunakan bahasa Indonesia yang ramah dan mudah dipahami.
```

### Batasan
- Hanya tahu tentang Life Compass (bukan AI umum)
- Bisa arahkan ke FAQ jika tidak tahu jawabannya
- Tidak menyimpan riwayat chat (privasi)
- Gratis (masuk kuota Gemini API)

---

## 11. Legal & Privasi

Tiga dokumen yang HARUS ada sebelum publikasi:

### 11.1 Disclaimer (di halaman hasil & footer)
> *"Life Compass adalah alat bantu keputusan karir, bukan konseling karir profesional, psikologis, atau jaminan kesuksesan. Semua rekomendasi bersifat informatif dan sebaiknya didiskusikan dengan ahli karir, keluarga, atau mentor sebelum mengambil keputusan penting."*

### 11.2 Privacy Policy (halaman terpisah)
- Data apa yang dikumpulkan (jawaban discovery, email, refleksi)
- Data refleksi dienkripsi di database
- Data tidak dijual ke pihak ketiga
- AI (Gemini) tidak dilatih dari data user
- User bisa hapus akun & export data kapan saja
- Cookie: hanya untuk sesi login

### 11.3 Terms of Service (halaman terpisah)
- Life Compass adalah alat bantu, bukan penasihat karir resmi
- Keputusan akhir tetap di tangan user
- Pembayaran tidak bisa refund (kecuali error sistem)
- Admin berhak hapus akun yang melanggar aturan

---

## 12. Yang TIDAK Masuk Sprint 1

- Weekly check-in rutin
- Subscription bulanan
- Notifikasi Email/WhatsApp
- Market intelligence otomatis
- Mentor marketplace
- Aplikasi native mobile
- Komunitas / forum
- AI chat unlimited (non-topik)
- Bahasa Inggris / multiple language
- Dark mode
- Rekomendasi kursus / affiliate

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| 80+ data karir tidak selesai | Rekomendasi kurang lengkap | 20 karir dulu untuk publik, tambah tiap hari |
| Gaji karir tidak akurat | User dapat info salah | Disclaimer + review manual + sumber publik |
| AI scoring tidak konsisten | User bingung | Cache: hash jawaban → result sama |
| STB mati/hang | Backend down | Auto-restart + Cloudflare Tunnel reconnect |
| SQLite corrupt | Data hilang | Backup tiap jam ke Cloudflare R2 (retain 7 hari) |
| Gemini API rate limit | Scoring/chatbot lambat | Cache + fallback template |
| Mayar.id webhook gagal | User bayar tapi tidak unlock | Admin bisa manual unlock |
| Discovery terlalu panjang (8-12 menit) | User dropout | Analytics: jika >50% dropout, perpendek |
| Chatbot jawab di luar topik | User kecewa | System prompt ketat + filter respons |
| CORS Cloudflare → STB | API error | Konfigurasi CORS middleware |
| Domain bermasalah | Aplikasi tidak bisa diakses | Cloudflare DNS, siapkan domain cadangan |

---

## 14. Definisi Sukses

### Wajib
- [ ] Landing page publik, admin bisa edit konten
- [ ] Google login + user bisa hapus akun
- [ ] Discovery 7 bagian, format centang, selesai <12 menit
- [ ] Free Snapshot: 1 rekomendasi + 1 alternatif + 1 risiko + 1 rencana 7-hari
- [ ] Minimal 20 karir terisi akurat saat rilis
- [ ] Rekomendasi KONSISTEN — input sama → hasil sama
- [ ] Simpan & bagikan snapshot (privasi terjaga)
- [ ] Bayar Rp25.000 via Mayar.id → unlock Full Report seumur hidup
- [ ] Full Report: lihat web + download PDF (client-side)
- [ ] Admin dashboard: statistik + kelola karir + atur landing page + lihat payment
- [ ] FAQ halaman + AI Chatbot (khusus Life Compass)
- [ ] Backup SQLite tiap jam ke Cloudflare R2
- [ ] HTTPS aktif via Cloudflare Tunnel
- [ ] Disclaimer + Privacy Policy + Terms of Service terpasang
- [ ] Tidak ada error kritis di alur utama

### Bonus (jika sempat)
- [ ] 50+ karir terisi saat rilis (target: 80+)
- [ ] Test di HP Android low-end
- [ ] Refleksi user terenkripsi

---

## 15. Strategi Akuisisi (Cara Orang Tahu Aplikasi Ini)

### 15.1 Word of Mouth (Teman/Dekat)
**Fase 1 — rilis pertama**: Share ke circle terdekat
- Grup WhatsApp teman, keluarga, alumni
- Cerita singkat + link + ajakan coba gratis
- Target: 10-20 user awal untuk testing dan feedback

### 15.2 SEO Google
**Fase 2 — organic growth**: Orang cari di Google, nemu Life Compass
| Kata Kunci Target | Volume Pencarian (estimasi) |
|-------------------|---------------------------|
| "bingung mau jadi apa" | Tinggi |
| "tes karir online gratis" | Tinggi |
| "cocoknya kerja dimana" | Sedang |
| "pindah karir" | Sedang |
| "bingung pilih jurusan" | Tinggi |

**Cara**: Blog posts / halaman statis di domain yang sama yang menjawab pertanyaan-pertanyaan ini, lalu mengarah ke landing page Life Compass.

### 15.3 Sample Report sebagai Alat Promosi
- Non-login bisa lihat 1 contoh hasil karir (misal: contoh untuk UI/UX Designer)
- Contoh ini bisa di-share ke media sosial
- Orang lihat → tertarik → daftar → coba sendiri

---

## 16. Catatan Setelah Rilis

1. Pantau analytics: user daftar, selesai discovery, bayar
2. Cari 5-10 pengguna nyata untuk feedback (dari fase word of mouth)
3. Perbaiki bug
4. Tambah karir yang belum selesai
5. Evaluasi harga Rp25.000
6. Evaluasi akurasi AI scoring — bandingkan dengan logika manual
7. Mulai konten SEO (blog post untuk kata kunci karir)
8. Rencanakan Sprint 2
