/* ═══════════════════════════════════════════════
   PetalByte — main.js  (Carousel)
   ═══════════════════════════════════════════════ */

(function () {
  const track        = document.getElementById('carouselTrack');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel__slide'));
  let current = 0;

  // ── Video sync ───────────────────────────────────
  function syncVideoPlayback() {
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;

      if (i === current) {
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(() => {});
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
    if (e.key === 'Escape')     closeLightbox();
  });

  // ── Touch / swipe — live finger-follow ───────────
  let touchStartX = 0;
  let isDragging  = false;
  let dragOffset  = 0;
  let wasSwipe    = false;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isDragging  = true;
    dragOffset  = 0;
    wasSwipe    = false;
    track.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    dragOffset = currentX - touchStartX;
    
    // Mark as swipe if movement exceeds threshold
    if (Math.abs(dragOffset) > 10) {
      wasSwipe = true;
    }
    
    const newTranslate = -current * 100 + (dragOffset / track.offsetWidth) * 100;
    track.style.transform = `translateX(${newTranslate}%)`;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const threshold = track.offsetWidth * 0.2; // 20% of track width
    
    if (Math.abs(dragOffset) > threshold) {
      goTo(dragOffset > 0 ? current - 1 : current + 1);
    } else {
      track.style.transition = '';
      goTo(current);
    }
  }, { passive: true });

  // ── Lightbox ─────────────────────────────────────
  const lightbox        = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose   = document.getElementById('lightboxClose');

  function openLightbox(img) {
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.alt = img.alt;
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(clone);
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('lightbox--open')) return;
    lightbox.classList.remove('lightbox--open');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // ── Per-slide interactions ────────────────────────
  slides.forEach((slide) => {
    const img   = slide.querySelector('img');
    const video = slide.querySelector('video');

    if (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        // Only open lightbox if no recent swipe
        if (!wasSwipe) {
          openLightbox(img);
        }
        wasSwipe = false;
      });
    }

    if (video) {
      const btn = document.createElement('button');
      btn.className = 'carousel__expand-btn';
      btn.setAttribute('aria-label', 'View fullscreen');
      btn.innerHTML = '&#x26F6;';
      btn.addEventListener('click', () => {
        const requestFS = video.requestFullscreen
          || video.webkitRequestFullscreen
          || video.mozRequestFullScreen;
        if (requestFS) requestFS.call(video);
      });
      slide.appendChild(btn);
    }
  });

  syncVideoPlayback();

})();
