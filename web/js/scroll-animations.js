/**
 * Scroll-driven animations for M+ Building presentation
 * Uses Intersection Observer for performance
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // === Reveal cards on scroll ===
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { 
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe arch-cards and data-cards
  document.querySelectorAll('.arch-card, .data-card').forEach(el => {
    revealObserver.observe(el);
  });
  
  // === SVG layer reveal based on scroll position ===
  const archSection = document.querySelector('.architecture-section');
  const svgLayers = {
    foundation: document.querySelector('.layer-foundation'),
    podium: document.querySelector('.layer-podium'),
    structure: document.querySelector('.layer-structure'),
    tower: document.querySelector('.layer-tower'),
    led: document.querySelector('.layer-led'),
  };
  
  const archCards = document.querySelectorAll('.arch-card');
  
  const layerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const revealId = entry.target.dataset.reveal;
        animateLayer(revealId);
      }
    });
  }, { threshold: 0.5 });
  
  archCards.forEach(card => layerObserver.observe(card));
  
  function animateLayer(layerId) {
    // Progressive reveal - show this layer and all previous ones
    const order = ['foundation', 'podium', 'structure', 'tower', 'led'];
    const idx = order.indexOf(layerId);
    
    order.forEach((id, i) => {
      const layer = svgLayers[id];
      if (layer && i <= idx) {
        layer.style.transition = `opacity 0.8s ease ${i * 0.2}s`;
        layer.style.opacity = '1';
      }
    });
  }
  
  // === Stat counter animation ===
  const stats = document.querySelectorAll('.stat');
  
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statEl = entry.target;
        const value = parseFloat(statEl.dataset.value);
        const suffix = statEl.dataset.suffix || '';
        const valueEl = statEl.querySelector('.stat-value');
        
        animateValue(valueEl, 0, value, 2000, suffix);
        statObserver.unobserve(statEl);
      }
    });
  }, { threshold: 0.5 });
  
  stats.forEach(stat => statObserver.observe(stat));
  
  function animateValue(el, start, end, duration, suffix) {
    const startTime = performance.now();
    const isFloat = end % 1 !== 0;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      
      if (end >= 1000) {
        el.textContent = Math.round(current).toLocaleString() + suffix;
      } else if (isFloat) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  // === Parallax on hero ===
  const hero = document.querySelector('.hero-content');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      const progress = scrollY / window.innerHeight;
      hero.style.opacity = 1 - progress * 1.5;
      hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
  
  // === Data cards stagger ===
  const dataCards = document.querySelectorAll('.data-card');
  dataCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
  
});
