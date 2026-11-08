<!-- [xihanzu-NR] -->
# Roadmap

Status terakhir: commit `dbc0907`, 8 November 2026.

Diurutkan dari yang paling berdampak. Yang sudah selesai tidak dicatat di sini;
riwayatnya ada di `git log` dan di catatan vault.

---

## Terbuka

### 1. `style & layout` 1164 ms — PageSpeed

Kategori terbesar di "Minimalkan pekerjaan thread utama". DOM hanya 145 elemen,
jadi ini bukan jumlah node. Belum diselidiki.

Kemungkinan penyebab: animasi `transition` yang memicu layout (bukan sekadar
`transform`/`opacity`), atau `backdrop-blur` pada navbar yang mahal saat
digulir. Cara memeriksanya: Chrome Performance, cari "Recalculate Style" dan
"Layout" selama scroll, lihat elemen mana yang dilaporkan.

### 2. JavaScript tidak terpakai — 31 KiB

GSAP ikut di bundle dan hanya dipakai `CircleSweep` serta `Navbar`. Bisa
dipecah dengan `import()` dinamis supaya tidak masuk chunk awal.

Perlu diukur dulu berapa sebenarnya yang bisa dihemat; 31 KiB dari 89 KiB itu
signifikan untuk halaman yang FCP-nya masih ~5 detik di throttle 4x.

### 3. JavaScript versi lama — 10 KiB

Target build sudah `es2020`. Sisa temuan ini datang dari dependensi, bukan kode
sendiri. Perlu dicek apakah `@babel/preset-env` di toolchain menurunkan target
lebih jauh dari yang diminta.

### 4. Durasi cache — 5 KiB

Temuan ini menyebut Cloudflare (`beacon.min.js`, `email-decode.min.js`), keduanya
disuntikkan Cloudflare sendiri, bukan aset situs. Token API di shell ini tidak
punya izin `cache purge`, jadi tidak bisa dibersihkan dari sini.

Yang bisa dikerjakan: matikan Cloudflare Web Analytics kalau tidak dipakai, dan
`email-decode.min.js` (anti-scrape email) kalau tidak ada email di halaman.

### 5. Gambar hero masih 98 KB

`hero-ponsel.webp` adalah elemen LCP. Sudah WebP dan `fetchpriority="high"`,
tapi 98 KB untuk satu latar masih bisa turun. Kandidat: AVIF (biasanya 30-50%
lebih kecil), atau gradasi CSS kalau latarnya memang bisa dibuat dengan CSS.

### 6. `email-decode` dan beacon Cloudflare

Dua skrip pihak ketiga yang disuntikkan otomatis. Cek apakah benar-benar
dipakai; kalau tidak, matikan di dashboard Cloudflare.

---

## Selesai (ringkas, untuk konteks)

- **Nol TypeScript.** `timeline.ts`, `scrollEngine.ts`, `revealEngine.ts`, dan
  `GradientWaves.tsx` sudah tidak ada. Yang dipakai tetap dikonversi ke `.hys`;
  GradientWaves dihapus karena sudah tidak dipakai sejak hero diganti gambar.

- Header & manifest: `llms.txt` dan `ai-catalog.json` sekarang dilayani dengan
  tipe benar, bukan HTML dari fallback SPA.
- Urutan heading `h1 → h2 → h3`, tanpa lompatan level.
- Font self-host: dua origin pihak ketiga jadi nol, satu stylesheet saja.
- Foto dokumentasi WebP: 377 KB → 162 KB.
- Forced reflow 91 ms dihapus dari `ScrollCards`.
- Pegas animasi kartu diganti bentuk tertutup — stabil 2–240 fps.
- Geometri sticky: `dead scroll` 171 px → 0, di tujuh ukuran viewport.

---

## Catatan

Angka FCP di mesin pengembangan tidak bisa dipercaya: mesin ini hanya punya
~200 MB memori bebas saat pengukuran, dan `hydra build` sendiri melewati runtime
gate karena itu. Selalu ukur ulang lewat PageSpeed Insights di jaringan asli
sebelum menyimpulkan sesuatu membaik atau memburuk.
