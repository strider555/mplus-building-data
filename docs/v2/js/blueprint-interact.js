/**
 * Blueprint SVG interactions (v2 - Accurate per HdM Section B)
 * Hover tooltips + click highlights for blueprint layers
 */

document.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('bp-tooltip');
  const tooltipTitle = tooltip.querySelector('.bp-tooltip-title');
  const tooltipDesc = tooltip.querySelector('.bp-tooltip-desc');
  const svgWrap = document.querySelector('.blueprint-canvas-wrap');
  
  // Floor data per HdM 415_DR_2110_002_Section B legend
  const floorData = {
    'found-space': { title: '1. Found Space + 2. The Studio', desc: 'B1/F · Underground exhibition following MTR tunnel · Large installations' },
    'podium': { title: '3–5. Podium (Main Hall · Atrium · Galleries)', desc: 'G–2F · 33 galleries · 17,000 m² · Cinema ×3 · Mediatheque · Learning Hub' },
    'tower': { title: '6–11. Tower', desc: 'L6 Terrace Restaurant · L7 Research Centre · L8 Office ×4\nL9 M+ Members Lounge · L10 Art-related OACF · L11 RDE (F&B) ×3' },
    'facade': { title: 'M+ Facade (LED Screen)', desc: '65.8m × 110m · Ceramic louvres with embedded LEDs\nScreens commissioned moving image works facing harbour' },
    'roof-garden': { title: '12. Roof Garden', desc: 'Atop podium, both sides of tower · Faces Victoria Harbour' },
    'csf': { title: '13–14. CSF Building', desc: 'Conservation & Storage Facility\n13: Art Storage · 14: Conservation Labs' },
    'tunnel': { title: '20–21. Underground Infrastructure', desc: '20: Airport Express Line Tunnel (1.5m below ground)\n21: MTR / Elements Cooling Main' },
    'harbour': { title: '19. Victoria Harbour', desc: 'M+ Facade LED artworks visible from harbour & HK Island' },
    'promenade': { title: '18. Waterfront Promenade', desc: 'Public waterfront · Viewing point for M+ Facade' },
    'trusses': { title: 'Mega-Trusses (Arup)', desc: '5 structural trusses spanning above railway tunnels\nPrevents building loading MTR infrastructure' },
    'access': { title: '15–17. Access', desc: '15: Avenue · 16: Carriageway · 17: Parking' },
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
  
  svgStrokes.forEach(stroke => {
    try {
      const length = stroke.getTotalLength();
      stroke.style.strokeDasharray = length;
      stroke.style.strokeDashoffset = length;
      stroke.style.transition = 'stroke-dashoffset 2s ease-out';
    } catch(e) {
      // rect elements don't have getTotalLength in all browsers
      stroke.style.opacity = '0';
      stroke.style.transition = 'opacity 1.5s ease-out';
    }
  });

  const blueprintObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        svgStrokes.forEach((stroke, i) => {
          setTimeout(() => {
            stroke.style.strokeDashoffset = '0';
            stroke.style.opacity = '';
          }, i * 200);
        });
        blueprintObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

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

  specRows.forEach(row => { row.style.animationPlayState = 'paused'; });
  specsObserver.observe(specsSection);
});
