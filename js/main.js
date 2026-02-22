// js/main.js

(function() {
  console.log('Main.js loaded, waiting for smooothy...');
  
  function getCore() {
    return window.Core || window.smooothy || window.Smooothy;
  }

  function waitForDependencies() {
    const Core = getCore();
    const isDOMReady = document.readyState === 'interactive' || document.readyState === 'complete';
    
    if (Core && isDOMReady) {
      console.log('Smooothy and DOM ready, initializing...');
      initSlider(Core);
    } else {
      console.log('Waiting... Library:', !!Core, 'DOM:', isDOMReady);
      setTimeout(waitForDependencies, 50);
    }
  }

  waitForDependencies();

 function initSlider(Core) {
  const sliderWrapper = document.querySelector('[data-slider]');
  if (!sliderWrapper) return;

  const slider = new Core(sliderWrapper, {
    infinite: true,
    snap: true,
    scrollInput: true,
    dragSensitivity: 0.008,
    lerpFactor: 0.15,
    snapStrength: 0.2,
    speedDecay: 0.9,
    virtualScroll: {
      mouseMultiplier: 0.8,
      touchMultiplier: 1.2,
      useKeyboard: true
    },
    setOffset: ({ itemWidth, wrapperWidth }) => {
      return (wrapperWidth - itemWidth) / 2;
    },
    onUpdate: ({ parallaxValues }) => {
      const slides = document.querySelectorAll('[data-slider] .slide');
      slides.forEach((slide, i) => {
        if (parallaxValues && parallaxValues[i] !== undefined) {
          const distance = Math.abs(parallaxValues[i]);
          const scale = 0.9 + 0.2 * (1 - Math.min(distance, 1));
          slide.querySelector('.card-content').style.transform = `scale(${scale}) translateZ(0)`;
        }
      });
    }
  });

  window.slider = slider;
  
  function animate() {
    slider.update();
    requestAnimationFrame(animate);
  }
  animate();

    // Show the slider
    sliderWrapper.style.opacity = '1';
    sliderWrapper.style.cursor = 'grab';

    // Download buttons
    document.querySelectorAll('.Btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.card');
        const img = card.querySelector('img');
        const imgSrc = img.src;
        const imgAlt = img.alt || 'wallpaper';

        if (confirm(`Download "${imgAlt}"?`)) {
          const link = document.createElement('a');
          link.href = imgSrc;
          link.download = imgAlt;
          link.click();
        }
      });
    });

    // Loader and typed.js
    const date = new Date();
    const currentDate = `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;

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
  }
})();

// Cleanup
window.addEventListener('beforeunload', () => {
  if (window.slider && window.slider.destroy) {
    window.slider.destroy();
  }
});