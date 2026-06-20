/**
 * Blueprint SVG interactions
 * Hover tooltips + click highlights for blueprint layers
 */

document.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('bp-tooltip');
  const tooltipTitle = tooltip.querySelector('.bp-tooltip-title');
  const tooltipDesc = tooltip.querySelector('.bp-tooltip-desc');
  const svgWrap = document.querySelector('.blueprint-canvas-wrap');
  
  const floorData = {
    'found-space': { title: 'Found Space (B2)', desc: 'Underground hall following MTR tunnel contours · Large installations' },
    'podium': { title: 'Podium (G–3F)', desc: '33 galleries · 17,000 m² · Cinema ×3 · Roof Garden' },
    'tower': { title: 'Tower (4–20F)', desc: '65m · Research · M+ Lounge · Lingnan U · HSUHK' },
    'facade': { title: 'LED Facade', desc: '65.8m × 110m · 140,000 ceramic tiles · Art screen' },
    'trusses': { title: 'Mega-Trusses', desc: '5 structural trusses spanning MTR tunnel (Arup)' },
  };

  // Hover tooltips
  const layers = document.querySelectorAll('.bp-layer');
  
  layers.forEach(layer => {
    layer.addEventListener('mouseenter', (e) => {
      const floor = layer.dataset.floor;
      const data = floorData[floor];
      if (data) {
        tooltipTitle.textContent = data.title;
        tooltipDesc.textContent = data.desc;
        tooltip.classList.add('visible');
      }
    });

    layer.addEventListener('mousemove', (e) => {
      const rect = svgWrap.getBoundingClientRect();
      const x = e.clientX - rect.left + 15;
      const y = e.clientY - rect.top - 10;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    });

    layer.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  // SVG draw animation on scroll
  const blueprintSection = document.querySelector('.blueprint-section');
  const svgStrokes = document.querySelectorAll('.bp-stroke');
  
  // Set initial stroke-dasharray for draw animation
  svgStrokes.forEach(stroke => {
    const length = stroke.getTotalLength ? stroke.getTotalLength() : 1000;
    stroke.style.strokeDasharray = length;
    stroke.style.strokeDashoffset = length;
    stroke.style.transition = 'stroke-dashoffset 2s ease-out';
  });

  const blueprintObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger draw animation
        svgStrokes.forEach((stroke, i) => {
          setTimeout(() => {
            stroke.style.strokeDashoffset = '0';
          }, i * 300);
        });
        blueprintObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  blueprintObserver.observe(blueprintSection);

  // Specs reveal on scroll
  const specsSection = document.querySelector('.specs-section');
  const specRows = document.querySelectorAll('.spec-row');

  const specsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        specRows.forEach(row => {
          row.style.animationPlayState = 'running';
        });
        specsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  // Pause animations initially
  specRows.forEach(row => {
    row.style.animationPlayState = 'paused';
  });

  specsObserver.observe(specsSection);
});
