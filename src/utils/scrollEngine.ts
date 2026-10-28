// [xihanzu-NR]
'use client';

/**
 * Scroll driver tunggal untuk seluruh halaman.
 *
 * Kenapa ada: sebelumnya tiap komponen memasang listener `scroll` sendiri lalu
 * memanggil setState, sehingga React merender ulang setiap event (bisa ratusan
 * kali per detik) — di mesin 2 vCPU ini yang bikin animasi scroll tersendat.
 *
 * Di sini hanya SATU listener pasif, dan nilainya dibagikan lewat callback yang
 * dipanggil di dalam requestAnimationFrame. Tidak ada state React, jadi tidak
 * ada render ulang: konsumen menulis langsung ke style/transform elemennya.
 */

export interface ScrollFrame {
  /** 0 di paling atas, 1 di paling bawah dokumen. */
  progress: number;
  /** window.scrollY saat ini. */
  y: number;
  /** Perubahan piksel per milidetik pada frame ini (bisa negatif). */
  velocity: number;
  /** progress dibatasi pada viewport pertama saja (0..1 sepanjang 100vh). */
  hero: number;
}

type Listener = (frame: ScrollFrame) => void;

const listeners = new Set<Listener>();
let raf = 0;
let lastY = 0;
let lastTime = 0;
let running = false;

const frame: ScrollFrame = { progress: 0, y: 0, velocity: 0, hero: 0 };

/**
 * Kecepatan tidak boleh langsung nol begitu gulir berhenti.
 *
 * Kalau dibiarkan: event scroll berhenti, jadi kerangka terakhir yang
 * dilaporkan punya kecepatan besar dan nilai itu menempel selamanya — kartu
 * lanyard akan terus terembus padahal halaman sudah diam.
 * Kalau pula langsung dinolkan: animasi terasa terputus.
 * Jadi diluruhkan terhadap waktu (bukan per frame), supaya hasilnya sama
 * di laptop 144Hz maupun di mesin ini.
 */
const DECAY_MS = 110;
const FLOOR = 0.015;

const pump = (now: number): void => {
  raf = 0;
  if (!running) return;
  const current = compute(now);
  listeners.forEach(fn => {
    try {
      fn(current);
    } catch {
      /* satu konsumen gagal tidak boleh mematikan sisanya */
    }
  });
  // Lanjutkan hanya selama masih ada kecepatan yang perlu diluruhkan.
  if (current.velocity !== 0) schedule();
};

const compute = (now: number): ScrollFrame => {
  const y = window.scrollY || window.pageYOffset || 0;
  const doc = document.documentElement;
  const max = Math.max(1, (doc.scrollHeight || 0) - window.innerHeight);
  const dt = lastTime ? Math.max(1, now - lastTime) : 16;
  const moved = y !== lastY;

  if (moved) {
    frame.velocity = (y - lastY) / dt;
  } else if (frame.velocity !== 0) {
    frame.velocity *= Math.exp(-dt / DECAY_MS);
    if (Math.abs(frame.velocity) <= FLOOR) frame.velocity = 0;
  }

  frame.y = y;
  lastY = y;
  lastTime = now;
  frame.progress = Math.min(1, Math.max(0, y / max));
  frame.hero = Math.min(1, Math.max(0, y / Math.max(1, window.innerHeight)));
  return frame;
};

const schedule = (): void => {
  if (!raf && running) raf = requestAnimationFrame(pump);
};

const onNative = (): void => {
  schedule();
};

const onVisibility = (): void => {
  if (document.hidden) {
    // Hemat baterai: berhenti menjadwalkan frame saat tab tidak terlihat.
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  } else {
    lastTime = 0;
    schedule();
  }
};

const start = (): void => {
  if (running) return;
  running = true;
  lastY = window.scrollY || 0;
  lastTime = 0;
  window.addEventListener('scroll', onNative, { passive: true });
  window.addEventListener('resize', onNative, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  schedule();
};

/** Berlangganan frame scroll. Mengembalikan fungsi untuk berhenti berlangganan. */
export const on_scroll = (fn: Listener): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  if (!running) start();
  listeners.add(fn);
  fn(compute(performance.now()));
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      window.removeEventListener('scroll', onNative);
      window.removeEventListener('resize', onNative);
      document.removeEventListener('visibilitychange', onVisibility);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      running = false;
      frame.velocity = 0;
    }
  };
};

export const prefers_reduced_motion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
};

export const scroll_progress = (): number => frame.progress;

export const hero_progress = (): number => frame.hero;
