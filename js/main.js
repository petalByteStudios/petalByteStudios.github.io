/* ═══════════════════════════════════════════════
   PetalByte — main.js  (Carousel)
   ═══════════════════════════════════════════════ */

(function () {
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel__slide'));
  let current = 0;

  function syncVideoPlayback() {
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;

      if (i === current) {
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(() => {
            // Ignore autoplay rejections; user can still tap play.
          });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  // ── Build dot indicators ────────────────────────
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel__dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('carousel__dot--active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = () => Array.from(dotsContainer.querySelectorAll('.carousel__dot'));

  // ── Core navigation ─────────────────────────────
  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots().forEach((d, i) => {
      d.classList.toggle('carousel__dot--active', i === current);
    });

    syncVideoPlayback();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // ── Keyboard support ────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // ── Touch / swipe support ───────────────────────
  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goTo(delta > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  syncVideoPlayback();

})();
