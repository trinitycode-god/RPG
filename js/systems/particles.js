// =============================================
// SHADOWREALM ONLINE - PARTICLE SYSTEM (Login Screen)
// =============================================

const ParticlesSystem = {
  particles: [],
  container: null,
  animFrame: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.spawn();
    this.animate();
  },

  spawn() {
    for (let i = 0; i < 40; i++) {
      setTimeout(() => this.createParticle(), i * 100);
    }
  },

  createParticle() {
    if (!this.container) return;
    const el = document.createElement('div');
    const size = Helpers.randFloat(2, 5);
    const x = Math.random() * 100;
    const duration = Helpers.randFloat(4, 10);
    const delay = Helpers.randFloat(0, 3);
    const colors = ['rgba(120,40,255,0.6)', 'rgba(60,120,255,0.6)', 'rgba(255,200,0,0.4)', 'rgba(0,200,255,0.4)'];
    
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${Helpers.randFrom(colors)};
      border-radius: 50%;
      left: ${x}%;
      bottom: -10px;
      pointer-events: none;
      animation: particleFloat ${duration}s ${delay}s ease-in infinite;
    `;
    
    this.container.appendChild(el);
    this.particles.push(el);
    
    // Cleanup old particles
    if (this.particles.length > 80) {
      const old = this.particles.shift();
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }
  },

  animate() {
    // Add the CSS keyframe dynamically
    if (!document.getElementById('particle-style')) {
      const style = document.createElement('style');
      style.id = 'particle-style';
      style.textContent = `
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(${Helpers.randInt(-100, 100)}px) scale(0.2); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Keep spawning particles
    setInterval(() => this.createParticle(), 300);
  },

  destroy() {
    this.particles.forEach(p => { if (p.parentNode) p.parentNode.removeChild(p); });
    this.particles = [];
  }
};
