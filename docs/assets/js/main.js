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

const lerp = (a, b, t) => a + (b - a) * Math.min(Math.max(t, 0), 1);

const updateScales = () => {
  const vw = window.innerWidth;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const scale = getScaleFactor(rect.left + rect.width / 2, vw);
    card.style.transform = `scale(${scale})`;
    card.querySelector("img").style.transform = `scale(${scale})`;
  });
};

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

window.addEventListener("load", () => {
  updateScales();
  animate();
  slider.style.opacity = "1";
});

window.addEventListener("resize", () => {
  updateScales();
  currentX = targetX = -window.scrollY / (document.body.scrollHeight - window.innerHeight) * (slider.scrollWidth - window.innerWidth);
});

const downloadButtons = document.querySelectorAll(".Btn");

downloadButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    const img = card.querySelector("img");
    const imgSrc = img.src;
    const imgAlt = img.alt || "wallpaper";

    const userConfirmed = confirm(`Do you want to download "${imgAlt}"?`);

    if (userConfirmed) {
      const link = document.createElement("a");
      link.href = imgSrc;
      link.download = imgAlt;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
});

window.addEventListener('load', function() {
  Promise.all([
    new Promise(resolve => setTimeout(resolve, 4000)),
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