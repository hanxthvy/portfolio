// [xihanzu-NR]
'use client';

/**
 * Reveal saat elemen masuk viewport.
 *
 * Hanya memakai IntersectionObserver + transisi CSS (transform dan opacity),
 * bukan animasi per-frame. Jadi nol biaya JS saat menggulir dan GPU yang
 * mengerjakan sisanya — penting di mesin 2 vCPU.
 *
 * Prinsip keselamatan: elemen disembunyikan lewat kelas `reveal-pending` yang
 * HANYA dipasang pada elemen yang benar-benar sudah masuk daftar pantau. Jadi
 * kalau ada elemen yang tidak terpantau (mis. dirender belakangan), dia tetap
 * terlihat. Konten yang tak sengaja tersembunyi jauh lebih buruk daripada
 * animasi yang tidak jalan.
 */

const SELECTOR = '[data-reveal]';
const PENDING = 'reveal-pending';
const DONE = 'is-revealed';

let observer: IntersectionObserver | null = null;

const reduced = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

const settle = (el: Element): void => {
  observer?.unobserve(el);
  el.classList.remove(PENDING);
  el.classList.add(DONE);
};

const reveal = (el: Element): void => {
  const delay = Number((el as HTMLElement).dataset.revealDelay || 0);
  if (delay > 0) {
    window.setTimeout(() => settle(el), delay);
  } else {
    settle(el);
  }
};

/**
 * Panggil `fn` sekali saat `el` terlihat, lalu berhenti mengamati.
 *
 * `topMargin` memperluas area pengamatan ke ATAS viewport. Alasannya sama
 * seperti pada init_reveal: kalau pengguna menggulir cepat (atau melompat
 * lewat tautan), elemen bisa melewati viewport tanpa pernah dilaporkan
 * intersecting. Untuk coretan judul itu berarti judulnya berhenti separuh
 * tergambar. Dengan margin besar, elemen yang sudah terlewati langsung
 * diselesaikan.
 */
export const on_visible_once = (
  el: Element,
  fn: () => void,
  threshold = 0.25,
  topMargin = 120
): (() => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    fn();
    return () => undefined;
  }
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          io.disconnect();
          fn();
        }
      });
    },
    { threshold, rootMargin: `${topMargin}% 0px 0px 0px` }
  );
  io.observe(el);
  return () => io.disconnect();
};

export const init_reveal = (): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const pending = Array.from(document.querySelectorAll(SELECTOR)).filter(
    el => !el.classList.contains(DONE)
  );
  if (!pending.length) return () => undefined;

  // Tanpa IntersectionObserver atau saat pengguna minta minim gerak:
  // tampilkan semuanya tanpa animasi.
  if (!('IntersectionObserver' in window) || reduced()) {
    pending.forEach(el => el.classList.add(DONE));
    return () => undefined;
  }

  // rootMargin atas 120%: elemen yang sudah TERLEWATI (kini di atas viewport)
  // tetap dianggap intersecting. Penting karena kalau pengguna menggulir cepat,
  // IntersectionObserver bisa tidak pernah melaporkan elemen yang masuk dan
  // keluar dalam satu frame — kalau itu terjadi, elemennya akan tersembunyi
  // selamanya. Dengan margin ini, apa pun yang terlewati selalu ikut terbuka.
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    { rootMargin: '120% 0px -10% 0px', threshold: 0.05 }
  );

  pending.forEach(el => {
    // Kelas penyembunyi dipasang di sini, bukan lewat CSS global, supaya
    // elemen yang tidak terpantau tidak pernah ikut tersembunyi.
    el.classList.add(PENDING);
    observer?.observe(el);
  });

  // Jaring pengaman terakhir: apa pun yang sudah berada di atas viewport
  // dibuka tanpa animasi. Ini menutup semua celah sisa, termasuk elemen yang
  // di-render setelah init_reveal dipanggil.
  let sweepTimer = 0;
  const sweep = (): void => {
    const left = document.querySelectorAll(`.${PENDING}`);
    left.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0) settle(el);
    });
    // Berhenti sendiri setelah tidak ada yang tertunda, supaya tidak ada
    // timer yang jalan terus tanpa alasan.
    if (!document.querySelector(`.${PENDING}`)) window.clearInterval(sweepTimer);
  };
  sweepTimer = window.setInterval(sweep, 1000);
  window.addEventListener('load', sweep, { once: true });

  return () => {
    window.clearInterval(sweepTimer);
    observer?.disconnect();
    observer = null;
  };
};
