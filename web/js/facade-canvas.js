/**
 * M+ LED Facade Canvas
 * Simulates the 140,000 ceramic tiles with interactive LED effect
 */

class FacadeCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.tiles = [];
    this.mouse = { x: -100, y: -100 };
    this.time = 0;
    this.isVisible = false;
    this.animationStarted = false;
    
    this.config = {
      cols: 80,
      rows: 40,
      tileGap: 1,
      baseColor: '#1a1a1a',
      glowColor: '#c9a96e',
      brightColor: '#e8c547',
      waveSpeed: 0.02,
      mouseRadius: 120,
    };
    
    this.init();
  }
  
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => { this.mouse = { x: -100, y: -100 }; });
    
    // Intersection observer to start animation when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animationStarted) {
          this.animationStarted = true;
          this.animate();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(this.canvas);
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
    
    // Calculate tile size
    this.tileW = (this.width - this.config.tileGap * (this.config.cols + 1)) / this.config.cols;
    this.tileH = (this.height - this.config.tileGap * (this.config.rows + 1)) / this.config.rows;
  }
  
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  getTileColor(col, row) {
    const x = col / this.config.cols;
    const y = row / this.config.rows;
    
    // Wave pattern (simulating art display)
    const wave1 = Math.sin(x * 6 + this.time * 0.8) * 0.5 + 0.5;
    const wave2 = Math.cos(y * 4 + this.time * 0.5) * 0.5 + 0.5;
    const wave3 = Math.sin((x + y) * 3 + this.time * 0.3) * 0.5 + 0.5;
    
    let intensity = (wave1 * wave2 * 0.6 + wave3 * 0.4) * 0.35;
    
    // Mouse proximity glow
    const tileX = this.config.tileGap + col * (this.tileW + this.config.tileGap) + this.tileW / 2;
    const tileY = this.config.tileGap + row * (this.tileH + this.config.tileGap) + this.tileH / 2;
    const dist = Math.sqrt((tileX - this.mouse.x) ** 2 + (tileY - this.mouse.y) ** 2);
    
    if (dist < this.config.mouseRadius) {
      const proximity = 1 - (dist / this.config.mouseRadius);
      intensity += proximity * 0.8;
    }
    
    // Clamp
    intensity = Math.min(1, Math.max(0, intensity));
    
    // Color interpolation
    if (intensity < 0.1) {
      return this.config.baseColor;
    }
    
    const r = Math.round(26 + intensity * (201 - 26));
    const g = Math.round(26 + intensity * (169 - 26));
    const b = Math.round(26 + intensity * (110 - 26));
    
    return `rgb(${r},${g},${b})`;
  }
  
  draw() {
    this.ctx.fillStyle = '#050505';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        const x = this.config.tileGap + col * (this.tileW + this.config.tileGap);
        const y = this.config.tileGap + row * (this.tileH + this.config.tileGap);
        
        this.ctx.fillStyle = this.getTileColor(col, row);
        this.ctx.fillRect(x, y, this.tileW, this.tileH);
      }
    }
  }
  
  animate() {
    if (!this.isVisible) {
      requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.time += this.config.waveSpeed;
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FacadeCanvas('facade-canvas');
});
