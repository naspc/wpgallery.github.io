const slider = document.querySelector(".slider");
const cards = document.querySelectorAll(".card");
const ease = 0.1;
let currentX = 0;
let targetX = 0;

// Scale calculation logic
const getScaleFactor = (position, viewportWidth) => {
  const quarterWidth = viewportWidth / 4;
  position = Math.max(0, Math.min(position, viewportWidth));

  if (position < quarterWidth) return lerp(0.9, 1.0, position / quarterWidth);
  if (position < 2 * quarterWidth) return lerp(1.0, 1.1, (position - quarterWidth) / quarterWidth);
  if (position < 3 * quarterWidth) return lerp(1.1, 1.0, (position - 2 * quarterWidth) / quarterWidth);
  return lerp(1.0, 0.9, (position - 3 * quarterWidth) / quarterWidth);
};

const lerp = (a, b, t) => a + (b - a) * Math.min(Math.max(t, 0), 1);

// Update card scales
const updateScales = () => {
  const vw = window.innerWidth;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const scale = getScaleFactor(rect.left + rect.width / 2, vw);
    card.style.transform = `scale(${scale})`;
    card.querySelector("img").style.transform = `scale(${scale})`;
  });
};

// Animation loop
const animate = () => {
  currentX += (targetX - currentX) * ease;
  slider.style.transform = `translateX(${currentX}px)`;
  updateScales();
  requestAnimationFrame(animate);
};

// Scroll handler
window.addEventListener("scroll", () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  targetX = -window.scrollY / maxScroll * (slider.scrollWidth - window.innerWidth);
}, { passive: true });

// Mobile touch handling
let touchStartX = 0;
let isDragging = false;

slider.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  isDragging = true;
}, { passive: true });

slider.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const delta = e.touches[0].clientX - touchStartX;
  targetX += delta * 1.5; // Adjust sensitivity
  touchStartX = e.touches[0].clientX;
}, { passive: true });

slider.addEventListener('touchend', () => {
  isDragging = false;
});

// Download button logic
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

// Loading screen and text animations
window.addEventListener('load', () => {
  updateScales();
  animate();
  slider.style.opacity = "1";

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
        
        new Typed('.auto-type-header', {
          strings: ['wallpaper gallery', ''],
          typeSpeed: 80,
          backSpeed: 50,
          backDelay: 1500,
          showCursor: false,
          onComplete: function() {
            new Typed('.auto-type-subheader', {
              strings: ['a collection of images ive gathered, enjoy', ''],
              typeSpeed: 60,
              backSpeed: 40,
              backDelay: 1500,
              showCursor: false,
              loop: false
            });
          }
        });
      }, 1000);
    }
  });
});

// Resize handler
window.addEventListener("resize", () => {
  updateScales();
  currentX = targetX = -window.scrollY / (document.body.scrollHeight - window.innerHeight) * (slider.scrollWidth - window.innerWidth);
});