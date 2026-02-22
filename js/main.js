const slider = document.querySelector(".slider");
const cards = document.querySelectorAll(".card");
const ease = 0.08; // Slightly lower for smoother movement
let currentX = 0;
let targetX = 0;

// Optimised scaling data
let cardCenters = [];
let baseLeft = 0;
let cardWidth = 0;
let maxScroll = 0;

// Mobile detection and drag state
const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
let isDragging = false;
let touchStartX = 0;

// Throttling for scroll events
let scrollTimeout;
let rafId = null;

// ----------------------------------------------------------------------
// Helper functions
const lerp = (a, b, t) => a + (b - a) * Math.min(Math.max(t, 0), 1);

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const getScaleFactor = (position, viewportWidth) => {
  const quarterWidth = viewportWidth / 4;
  position = clamp(position, 0, viewportWidth);

  if (position < quarterWidth) return lerp(0.9, 1.0, position / quarterWidth);
  if (position < 2 * quarterWidth) return lerp(1.0, 1.1, (position - quarterWidth) / quarterWidth);
  if (position < 3 * quarterWidth) return lerp(1.1, 1.0, (position - 2 * quarterWidth) / quarterWidth);
  return lerp(1.0, 0.9, (position - 3 * quarterWidth) / quarterWidth);
};

// ----------------------------------------------------------------------
// Update card geometry (call on resize and load)
function updateCardGeometry() {
  cardCenters = Array.from(cards).map(card =>
    card.offsetLeft + card.offsetWidth / 2
  );

  baseLeft = slider.getBoundingClientRect().left - currentX;

  if (isMobile) {
    const style = getComputedStyle(cards[0]);
    const marginRight = parseFloat(style.marginRight) || 0;
    cardWidth = cards[0].offsetWidth + marginRight;
    maxScroll = slider.scrollWidth - window.innerWidth;
  }
}

// ----------------------------------------------------------------------
// Apply scales using transform with will-change for better performance
function updateScales() {
  const vw = window.innerWidth;
  
  // Use requestAnimationFrame batching for scale updates
  cards.forEach((card, i) => {
    const screenCenter = baseLeft + currentX + cardCenters[i];
    const scale = getScaleFactor(screenCenter, vw);
    
    // Use transform with translateZ(0) to force GPU acceleration
    card.style.transform = `scale(${scale}) translateZ(0)`;
  });
}

// ----------------------------------------------------------------------
// Desktop animation with improved smoothness
function animateDesktop() {
  // Apply easing with direction-based adjustment for quick movements
  const diff = targetX - currentX;
  const distance = Math.abs(diff);
  
  // Adaptive easing: move faster when far from target
  const adaptiveEase = distance > 100 ? 0.15 : ease;
  currentX += diff * adaptiveEase;
  
  // Clamp to valid range
  currentX = clamp(currentX, -maxScroll, 0);
  
  slider.style.transform = `translateX(${currentX}px) translateZ(0)`;
  updateScales();
  
  rafId = requestAnimationFrame(animateDesktop);
}

// ----------------------------------------------------------------------
// Mobile animation (touch + snap)
function animateMobile() {
  if (!isMobile) return;

  if (!isDragging) {
    // Snap to nearest card when not dragging
    const nearestIndex = Math.round(-currentX / cardWidth);
    const centerOffset = (window.innerWidth - cards[0].offsetWidth) / 2;
    targetX = -nearestIndex * cardWidth + centerOffset;
    targetX = clamp(targetX, -maxScroll, 0);
  }

  const diff = targetX - currentX;
  const distance = Math.abs(diff);
  
  // Adaptive easing for mobile too
  const adaptiveEase = distance > 50 ? 0.15 : ease;
  currentX += diff * adaptiveEase;
  
  currentX = clamp(currentX, -maxScroll, 0);
  
  slider.style.transform = `translateX(${currentX}px) translateZ(0)`;
  updateScales();
  
  rafId = requestAnimationFrame(animateMobile);
}

// ----------------------------------------------------------------------
// Optimised scroll handler with throttling
function handleScroll() {
  if (isMobile) return; // No scroll on mobile
  
  // Clear previous timeout
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout);
  }
  
  // Use requestAnimationFrame to sync with browser paint
  scrollTimeout = requestAnimationFrame(() => {
    const maxScrollY = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = window.scrollY / maxScrollY;
    
    // Calculate target position based on scroll
    const newTarget = -scrollProgress * (slider.scrollWidth - window.innerWidth);
    
    // Apply with some smoothing for large jumps
    targetX = newTarget;
    
    // Clamp target
    targetX = clamp(targetX, -maxScroll, 0);
  });
}

// ----------------------------------------------------------------------
// Touch events (mobile only)
if (isMobile) {
  slider.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  slider.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent page scroll
    
    const delta = e.touches[0].clientX - touchStartX;
    
    // Apply movement with inertia feeling
    targetX += delta * 1.2;
    targetX = clamp(targetX, -maxScroll, 0);
    
    touchStartX = e.touches[0].clientX;
  }, { passive: false }); // Not passive to allow preventDefault

  slider.addEventListener('touchend', () => {
    isDragging = false;
    
    // Optional: Add momentum scrolling here if desired
    // For now, just let snap take over
  });
}

// ----------------------------------------------------------------------
// Resize handler with debouncing
let resizeTimeout;
window.addEventListener("resize", () => {
  // Debounce resize events
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateCardGeometry();
    
    if (!isMobile) {
      // Keep desktop position relative to scroll
      const maxScrollY = document.body.scrollHeight - window.innerHeight;
      targetX = -window.scrollY / maxScrollY * (slider.scrollWidth - window.innerWidth);
    } else {
      // On mobile, keep current index but re-center
      const nearestIndex = Math.round(-currentX / cardWidth);
      const centerOffset = (window.innerWidth - cards[0].offsetWidth) / 2;
      targetX = -nearestIndex * cardWidth + centerOffset;
    }
    
    targetX = clamp(targetX, -maxScroll, 0);
    currentX = targetX;
    
    slider.style.transform = `translateX(${currentX}px) translateZ(0)`;
    updateScales();
  }, 150);
});

// ----------------------------------------------------------------------
// Add wheel event for desktop smoothness
if (!isMobile) {
  window.addEventListener('wheel', (e) => {
    // Optional: Add wheel delta to target for smoother mouse wheel
    // This can help with jerky trackpad scrolling
    if (Math.abs(e.deltaY) > 5) {
      const delta = e.deltaY * 0.5;
      targetX -= delta;
      targetX = clamp(targetX, -maxScroll, 0);
    }
  }, { passive: true });
}

// ----------------------------------------------------------------------
// Loading and initialisation
window.addEventListener('load', () => {
  // Pre-calculate maxScroll for desktop
  maxScroll = slider.scrollWidth - window.innerWidth;
  
  // Initial geometry calculation
  updateCardGeometry();
  slider.style.opacity = "1";
  
  // Set initial position based on scroll
  if (!isMobile) {
    const maxScrollY = document.body.scrollHeight - window.innerHeight;
    targetX = -window.scrollY / maxScrollY * maxScroll;
    targetX = clamp(targetX, -maxScroll, 0);
    currentX = targetX;
  }

  // Start the correct animation loop
  if (isMobile) {
    animateMobile();
  } else {
    animateDesktop();
  }

  // Loader and typed.js logic (unchanged)
  Promise.all([
    new Promise(resolve => setTimeout(resolve, 4000)),
    new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    })
  ]).then(() => {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => {
        loader.remove();

        const date = new Date();
        let currentDate = `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;

        if (typeof Typed !== 'undefined') {
          new Typed('.auto-type-header', {
            strings: ['wallpaper gallery', currentDate],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 1500,
            showCursor: false,
            onComplete: function() {
              new Typed('.auto-type-subheader', {
                strings: ['by nas', 'enjoy'],
                typeSpeed: 60,
                backSpeed: 40,
                backDelay: 1500,
                showCursor: false,
                loop: false
              });
            }
          });
        }
      }, 1000);
    }
  });
});

// Clean up animation frame on page hide
window.addEventListener('beforeunload', () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});

// ----------------------------------------------------------------------
// Download button logic (unchanged)
const downloadButtons = document.querySelectorAll(".Btn");
downloadButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    const img = card.querySelector("img");
    const imgSrc = img.src;
    const imgAlt = img.alt || "wallpaper";

    if (confirm(`Do you want to download "${imgAlt}"?`)) {
      const link = document.createElement("a");
      link.href = imgSrc;
      link.download = imgAlt;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
});

// Add scroll listener after everything is set up
if (!isMobile) {
  window.addEventListener("scroll", handleScroll, { passive: true });
}