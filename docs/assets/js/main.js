

const slider = document.querySelector(".slider");
const cards = document.querySelectorAll(".card");
const ease = 0.1;
let currentX = 0;
let targetX = 0;

const getScaleFactor = (position, viewportWidth) => {
  const quarterWidth = viewportWidth / 4;
  position = Math.max(0, Math.min(position, viewportWidth));

  if (position < quarterWidth) {
    return lerp(0.9, 1.0, position / quarterWidth);
  } 
  if (position < 2 * quarterWidth) {
    return lerp(1.0, 1.1, (position - quarterWidth) / quarterWidth);
  }
  if (position < 3 * quarterWidth) {
    return lerp(1.1, 1.0, (position - 2 * quarterWidth) / quarterWidth);
  }
  return lerp(1.0, 0.9, (position - 3 * quarterWidth) / quarterWidth);
};

// Safe lerp implementation
const lerp = (a, b, t) => a + (b - a) * Math.min(Math.max(t, 0), 1);

// Optimized scale updates
const updateScales = () => {
  const vw = window.innerWidth;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const scale = getScaleFactor(rect.left + rect.width/2, vw);
    card.style.transform = `scale(${scale})`;
    card.querySelector("img").style.transform = `scale(${scale})`;
  });
};

// Smooth animation loop
const animate = () => {
  currentX += (targetX - currentX) * ease;
  slider.style.transform = `translateX(${currentX}px)`;
  updateScales();
  requestAnimationFrame(animate);
};

// Replace existing scroll handler with
let lastScroll = 0;
const scrollThreshold = 100;

function handleScroll() {
  const now = Date.now();
  if (now - lastScroll < 16) return; // ~60fps
  
  // Your optimized scroll logic
  lastScroll = now;
  requestAnimationFrame(updateScales);
}

window.addEventListener('scroll', handleScroll, { passive: true });
// Initialization
window.addEventListener("load", () => {
  updateScales();
  animate();
  slider.style.opacity = "1"; // Fade-in effect
});

// Replace the existing resize handler with:
window.addEventListener("resize", () => {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    updateScales();
    currentX = targetX = -window.scrollY / (document.body.scrollHeight - window.innerHeight) * (slider.scrollWidth - window.innerWidth);
  }
});

// Add event listeners to all download buttons
const downloadButtons = document.querySelectorAll(".Btn");

downloadButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    // Get the image source from the card
    const card = e.target.closest(".card");
    const img = card.querySelector("img");
    const imgSrc = img.src;
    const imgAlt = img.alt || "wallpaper"; // Default filename if alt is missing

    // Prompt the user for confirmation
    const userConfirmed = confirm(`Do you want to download "${imgAlt}"?`);

    if (userConfirmed) {
      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = imgSrc;
      link.download = imgAlt;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
});

// Combined loading screen logic
window.addEventListener('load', function() {
  // Wait for either 4 seconds OR page load, whichever takes longer
  // Combined loading screen logic
// Wait for either 4 seconds OR page load, whichever takes longer
Promise.all([
  new Promise(resolve => setTimeout(resolve, 4000)), // 4-second delay
  new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  })
]).then(() => {
  const loader = document.querySelector('.loader');
  if (loader) {
    // Trigger fade-out animation
    loader.classList.add('loaded');
    
    // Remove loader and start typing effect after fade-out
    setTimeout(() => {
      loader.remove();
      
      // Initialize typing effect for headers
      new Typed('.auto-type-header', {
        strings: ['wallpaper gallery', ''], // Add empty string for deletion
        typeSpeed: 80, // Typing speed
        backSpeed: 50, // Speed of deleting text
        backDelay: 1500, // Delay before starting to delete
        showCursor: false, // Hide cursor
        //loop: false, // Disable looping
        onComplete: function() {
          // Start second header after first completes
          new Typed('.auto-type-subheader', {
            strings: ['a collection of images ive gathered, enjoy', ''], // Add empty string for deletion
            typeSpeed: 60, // Typing speed
            backSpeed: 40, // Speed of deleting text
            backDelay: 1500, // Delay before starting to delete
            showCursor: false, // Hide cursor
            loop: false // Disable looping
          });
        }
      });
    }, 1000); // Match this duration with your CSS transition time
  }
})});

// Only run parallax effect on desktop
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const animate = () => {
    currentX += (targetX - currentX) * ease;
    slider.style.transform = `translateX(${currentX}px)`;
    updateScales();
    requestAnimationFrame(animate);
  };

  window.addEventListener("scroll", () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetX = -window.scrollY / maxScroll * (slider.scrollWidth - window.innerWidth);
  });

  window.addEventListener("load", animate);
// Modify the mobile initialization block
} else {
  slider.style.transform = 'none';
  // Disable scale updates on mobile
  cards.forEach(card => {
    card.style.transform = 'none';
    card.querySelector("img").style.transform = 'none';
  });
  window.addEventListener('resize', () => {
    slider.scrollTo(0, 0);
  });
}
// Remove conflicting grid media queries from CSS