<!-- [xihanzu-NR] -->
# Reyhan Akhtar Afriansyah (Hanz) — Developer Portfolio

Portofolio pribadi Reyhan Akhtar Afriansyah (Hanz), developer dan penggemar
sistem dari SMK Ma'arif 1 Kroya.

Ditulis hampir seluruhnya dalam HydraScript (`.hyx` dan `.hys`) di atas
meta-framework Hydra. Empat berkas utilitas tetap TypeScript karena menulisnya
ulang tidak memberi keuntungan — lihat [Berkas TypeScript](#berkas-typescript).

---

## Fitur

- **Hero video loop** — latar H.264 1920px (1 MB), bukan HEVC, supaya jalan di
  semua browser. Scrim dan bobot judul disetel ulang agar teks tetap terbaca di
  atas gambar yang ramai.
- **Deretan kartu digerakkan scroll** — section "Dokumentasi & Sertifikasi".
  Pola track + sticky, tanpa mengunci scroll: scroll tetap milik browser, tidak
  ada `preventDefault`. Dua kolom di layar ≥768px (teks kiri, foto kanan), satu
  kolom bertumpuk di mobile.
- **Animasi reveal** — IntersectionObserver + transisi CSS, bukan animasi
  per-frame.
- **Latar grid 3D** — kisi perspektif yang mengikuti kursor.
- **Splash di shell, bukan di React** — cover dari paint pertama, menunggu aset
  siap, lalu menyerahkan halaman.
- **Tanpa salin / klik kanan** — situs portofolio, bukan dokumentasi.

---

## Struktur

```
├── hydraconfig.json     # konfigurasi server, compiler, dan tema
├── index.html           # shell HTML: splash, font, meta
├── public/              # aset statis
│   ├── fonts/           # Inter & JetBrains Mono (woff2, self-host)
│   ├── images/          # foto dokumentasi (webp)
│   ├── llms.txt         # ringkasan situs untuk agen AI
│   └── ai-catalog.json  # manifest resource untuk agen AI
└── src/
    ├── main.hyx         # entrypoint browser
    ├── App.hyx          # shell aplikasi
    ├── hydra.hys        # hook React dan adaptor runtime
    ├── index.css        # stylesheet dasar
    ├── components/      # komponen UI (.hyx, satu .tsx)
    ├── data/            # konten portofolio (.hys)
    └── utils/           # mesin animasi (campuran .hys dan .ts)
```

---

## Berkas TypeScript

README ini dulu mengklaim "zero TypeScript", dan itu tidak benar. Yang ada:

| Berkas | Isi |
|---|---|
| `src/utils/timeline.ts` | matematika posisi kartu dan peredam pegas — murni, tanpa DOM |
| `src/utils/scrollEngine.ts` | satu listener scroll global, dibagikan lewat rAF |
| `src/utils/revealEngine.ts` | IntersectionObserver untuk animasi reveal |
| `src/components/GradientWaves.tsx` | latar gelombang WebGL |

Alasannya sama untuk keempatnya: isinya perhitungan atau API browser yang lebih
aman ditulis dengan tipe, dan menuliskannya ulang ke `.hys` hanya memindahkan
risiko tanpa manfaat. Sisanya, termasuk seluruh komponen UI, tetap `.hyx`.

---

## Pengembangan

Butuh Node.js v22.

```bash
npm install

npm run dev       # server pengembangan
npm run build     # build produksi ke dist/
npm run preview   # pratinjau hasil build
```

`hydra build` menjalankan runtime gate (membuka halaman di browser headless dan
memeriksa tidak ada exception). Gate itu butuh ~350 MB memori bebas; di mesin
yang sempit ia dilewati dengan pesan, dan bisa dipaksa lewat
`HYDRA_GATE_FORCE=1 hydra build`.

---

## Catatan teknis

Beberapa hal yang tidak kelihatan dari kode dan mahal untuk ditemukan ulang.
Catatan lengkapnya ada di vault Obsidian; ini ringkasnya.

**Pegas, bukan batas kecepatan.** Animasi kartu memakai peredam dengan
kecepatan sebagai state, sehingga sisa energi scroll cepat habis perlahan
alih-alih dipangkas di ujung. Integrasinya diselesaikan secara analitik
(bentuk tertutup osilator teredam), bukan Euler eksplisit — versi Euler meledak
di bawah 45fps, dan itu penyebab glitch yang lama tidak ketahuan.

**Jangan membaca layout di dalam frame animasi.** `getBoundingClientRect` dan
`clientWidth` setelah menulis transform memaksa layout sinkron. Semua ukuran
dihitung sekali saat mount dan resize.

**`loading="lazy"` salah di dalam wadah ber-`transform`.** Lazy loading memutuskan
dari posisi di layout, dan `transform` tidak menggeser layout — jadi gambar baru
dimuat saat kartunya sudah tampil. `eager` juga salah karena merebut bandwidth
dari LCP. Yang dipakai: tanpa atribut.

---

## Penulis

Reyhan Akhtar Afriansyah (Hanz)
GitHub: [hanxthvy](https://github.com/hanxthvy)
Compiler: [HydraScript](https://github.com/hanxthvy/hydrascript)

---

## Lisensi

MIT License. Copyright (c) 2026 Reyhan Akhtar Afriansyah.
