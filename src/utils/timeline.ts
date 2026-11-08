// [xihanzu-NR]
/**
 * Mesin timeline untuk animasi berbasis progres.
 *
 * Dipisahkan dari DOM dan dari scroll dengan sengaja. Yang dihitung di sini
 * hanya satu hal: "pada progres p, di mana tiap benda seharusnya berada".
 * Tidak ada listener, tidak ada elemen, tidak ada requestAnimationFrame.
 *
 * Kenapa pemisahan ini penting, bukan sekadar rapi: percobaan sebelumnya
 * mencampur ketiganya dalam satu komponen, sehingga tidak ada cara menguji
 * apakah perhitungan posisinya benar tanpa menyeret browser. Akibatnya
 * kesalahan aritmetika terlihat sebagai "animasi aneh", bukan sebagai angka
 * yang salah di baris tertentu.
 *
 * Semua fungsi di sini murni: masukan sama, keluaran sama.
 */

export type EasingName = "linear" | "in" | "out" | "in-out";

/** Satu titik di timeline. `at` adalah posisi 0..1, sisanya properti. */
export interface Keyframe {
  at: number;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  rotate?: number;
}

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Empat kurva saja, dan sengaja bukan cubic-bezier penuh: yang dibutuhkan
 * animasi kartu hanya "mulai pelan", "berhenti pelan", atau keduanya.
 */
export function ease(name: EasingName, t: number): number {
  const x = clamp(t, 0, 1);
  switch (name) {
    case "in":
      return x * x;
    case "out":
      return 1 - (1 - x) * (1 - x);
    case "in-out":
      return x < 0.5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x);
    default:
      return x;
  }
}

/**
 * Progres lokal untuk satu rentang.
 *
 * Sebuah track tidak selalu bergerak sepanjang 0..1: kartu ketiga mungkin baru
 * mulai setelah progres 0.6. Fungsi ini memetakan progres global ke posisi
 * 0..1 DI DALAM rentang itu.
 */
export function local(p: number, start: number, end: number): number {
  if (end <= start) return p >= start ? 1 : 0;
  return clamp((p - start) / (end - start), 0, 1);
}

/**
 * Nilai satu properti pada progres p.
 *
 * Keyframe TIDAK harus berurutan di masukan -- diurutkan di sini, karena data
 * yang tidak urut adalah kesalahan yang mudah terjadi dan hasilnya animasi yang
 * melompat tanpa penjelasan.
 */
export function valueAt(
  keyframes: Keyframe[],
  p: number,
  prop: "x" | "y" | "scale" | "opacity" | "rotate",
  fallback = 0,
): number {
  if (!keyframes || keyframes.length === 0) return fallback;
  const sorted = keyframes.slice().sort((a, b) => a.at - b.at);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  // Keyframe yang tidak menyebut properti ini TIDAK dianggap bernilai
  // `fallback`. Kalau begitu, `{at:0}` (tanpa x) bercampur dengan `{at:1,x:10}`
  // akan menghasilkan 8.5 di tengah -- interpolasi antara "nilai bawaan" dan
  // 10, padahal tidak ada satu pun keyframe yang menyebut x di awal.
  //
  // Yang benar: cari keyframe TERDEKAT yang benar-benar punya properti ini.
  // Kalau tidak ada sama sekali, barulah `fallback` dipakai.
  const punya = sorted.filter((k) => k[prop] !== undefined);
  if (punya.length === 0) return fallback;
  if (punya.length === 1) return punya[0][prop] as number;

  const f = punya[0];
  const l = punya[punya.length - 1];
  if (p <= f.at) return f[prop] as number;
  if (p >= l.at) return l[prop] as number;

  for (let i = 1; i < punya.length; i++) {
    const a = punya[i - 1];
    const b = punya[i];
    if (p <= b.at) {
      const t = local(p, a.at, b.at);
      return lerp(a[prop] as number, b[prop] as number, t);
    }
  }
  return fallback;
}

/**
 * Jarak tempuh induk pada progres p.
 *
 * Ini model dari sumbernya (Alight Motion): SATU induk bergeser, kartu menempel
 * padanya dengan jarak tetap. Jadi yang dihitung bukan posisi tiap kartu,
 * melainkan satu angka.
 *
 * Pada p = 1 hasilnya negatif sebesar jarak x (jumlah-1), yang membuat kartu
 * TERAKHIR tepat di tengah -- itu syarat yang diminta.
 */
export function trackOffset(cardCount: number, gap: number, progress: number): number {
  if (cardCount <= 1) return 0;
  const total = gap * (cardCount - 1);
  return -total * clamp(progress, 0, 1);
}

/**
 * Posisi tengah tiap kartu di koordinat wadah, untuk progres p.
 *
 * Dipakai untuk memutuskan kartu mana yang perlu dilukis, dan untuk memeriksa
 * apakah kartu pertama dan terakhir benar-benar berhenti di tengah.
 */
export function cardCenters(
  cardCount: number,
  containerWidth: number,
  cardWidth: number,
  gapRatio: number,
  progress: number,
): number[] {
  const gap = cardWidth * (1 + gapRatio);
  const offset = trackOffset(cardCount, gap, progress);
  const startCenter = containerWidth / 2;
  const out: number[] = [];
  for (let i = 0; i < cardCount; i++) out.push(startCenter + i * gap + offset);
  return out;
}

/**
 * Normalisasi delta roda.
 *
 * `deltaMode` menentukan satuan: piksel, baris, atau halaman. Memakai `deltaY`
 * mentah tanpa memeriksanya membuat satu kali scroll di Firefox (baris) jauh
 * lebih kecil daripada di Chrome (piksel) -- animasi terasa sepuluh kali lebih
 * lambat di satu browser.
 */
export function normalizeWheel(
  deltaY: number,
  deltaMode: number,
  lineHeight = 16,
  viewportHeight = 800,
): number {
  if (deltaMode === 1) return deltaY * lineHeight;
  if (deltaMode === 2) return deltaY * viewportHeight;
  return deltaY;
}

/**
 * Peredam berbasis pegas: menyimpan momentum, bukan hanya posisi.
 *
 * Ini yang menjawab "energi sisa scroll". `stepToward` hanya tahu posisi
 * sekarang dan tujuan, jadi ia tidak punya inersia: begitu target berhenti
 * bergerak, ia langsung mengerem ke target. Dengan kecepatan sebagai state,
 * kartu bisa terus melaju sebentar setelah scroll berhenti, lalu melambat
 * karena redaman -- persis seperti benda yang punya massa.
 *
 * @param x    posisi sekarang
 * @param v    kecepatan sekarang (satuan per detik)
 * @param tx   posisi target
 * @param dt   lama frame, detik
 * @returns posisi dan kecepatan baru
 */
export function stepSpring(
  x: number,
  v: number,
  tx: number,
  dt: number,
  k = 700,
  redaman = 52.915,
  // ^ k=700 dengan redaman 2*sqrt(700) = redaman kritis: seluruh rentang
  //   ditempuh ~0.60 s pada 60fps, tanpa overshoot. Diukur, bukan ditebak.
): { x: number; v: number } {
  if (!(dt > 0)) return { x, v };
  const d = dt > 0.064 ? 0.064 : dt;
  const a = k * (tx - x) - redaman * v;
  const nv = v + a * d;
  const nx = x + nv * d;
  // Berhenti bersih kalau sudah sangat dekat dan sangat lambat, supaya loop
  // tidak berjalan selamanya untuk sisa yang tak terlihat.
  if (Math.abs(tx - nx) < 0.0002 && Math.abs(nv) < 0.002) return { x: tx, v: 0 };
  return { x: nx, v: nv };
}
