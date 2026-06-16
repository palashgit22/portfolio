/* ==========================================================================
   PORTFOLIO ENGINE & INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Create icons using Lucide
  lucide.createIcons();

  // Initialize Core Engines
  initLenisSmoothScroll();
  initCustomCursor();
  initCanvasParticles();
  initTypingEffect();
  initStatsCounters();
  initMagneticElements();
  initSpotlightCards();
  initMobileMenu();
  initBannerAnimation();
  
  // Initialize GSAP animations
  initGsapAnimations();
});

/* ==========================================================================
   LENIS SMOOTH SCROLL INTEGRATION
   ========================================================================== */
let lenis;
function initLenisSmoothScroll() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync scrollTrigger scroll updates
  lenis.on('scroll', ScrollTrigger.update);

  // Sync GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   CUSTOM INTERACTIVE CURSOR PHYSICS
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  const label = follower.querySelector('.cursor-label');

  if (!cursor || !follower) return;

  // Track mouse coordinates
  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Quick settings via GSAP for instant reactive placement
  const xCursor = gsap.quickTo(cursor, "x", { duration: 0.05, ease: "power3.out" });
  const yCursor = gsap.quickTo(cursor, "y", { duration: 0.05, ease: "power3.out" });
  const xFollower = gsap.quickTo(follower, "x", { duration: 0.25, ease: "power3.out" });
  const yFollower = gsap.quickTo(follower, "y", { duration: 0.25, ease: "power3.out" });

  gsap.ticker.add(() => {
    xCursor(mouse.x);
    yCursor(mouse.y);
    xFollower(mouse.x);
    yFollower(mouse.y);
  });

  // Hover States Listeners
  const hoverables = document.querySelectorAll('a, button, .magnetic-el, .tech-item-wrap, .timeline-content');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hovering');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hovering');
    });
  });

  // Projects Special Viewing Hover
  const projectVisuals = document.querySelectorAll('.project-visual-wrapper');
  projectVisuals.forEach(visual => {
    visual.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-viewing-project');
      label.textContent = "VIEW";
    });
    visual.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-viewing-project');
      label.textContent = "";
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, follower], { opacity: 0 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, follower], { opacity: 1 });
  });
}

/* ==========================================================================
   CANVAS INTERACTIVE PARTICLES BACKGROUND
   ========================================================================== */
function initCanvasParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  let mouse = { x: null, y: null, radius: 150 };

  // Set size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Monitor mouse positioning on page scroll
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Blueprint
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.size = Math.random() * 2 + 1;
      this.density = (Math.random() * 20) + 15;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.color = 'rgba(255, 255, 255, 0.15)';
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Basic drift
      this.x += this.vx;
      this.y += this.vy;

      // Bounce bounds
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse interactive push/pull physics
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          // Move away from cursor
          this.x -= directionX * force * 3;
          this.y -= directionY * force * 3;
        }
      }
    }
  }

  // Populate network
  function initParticlesGrid() {
    particlesArray = [];
    // Dynamic density mapping based on screen bounds
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < numberOfParticles; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      particlesArray.push(new Particle(x, y));
    }
  }
  initParticlesGrid();
  window.addEventListener('resize', initParticlesGrid);

  // Connect close nodes
  function drawLinks() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.hypot(dx, dy);

        if (distance < 110) {
          opacityValue = (1 - (distance / 110)) * 0.05;
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacityValue})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation ticks loop
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
      p.update();
      p.draw();
    });
    drawLinks();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

/* ==========================================================================
   TYPING STRING REVEALS
   ========================================================================== */
function initTypingEffect() {
  const target = document.getElementById('typing-text');
  if (!target) return;

  const strings = [
    "React & Next.js Developer",
    "Creative Motion & GSAP Designer",
    "Frontend UI/UX Specialist",
    "HTML, CSS, & JavaScript Expert"
  ];
  
  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentString = strings[stringIndex];
    
    if (isDeleting) {
      target.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentString.length) {
      // Finished typing, pause on word
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      speed = 500;
    }

    setTimeout(type, speed);
  }

  setTimeout(type, 1000);
}

/* ==========================================================================
   COUNTER STATS SCROLLING TRIGGERS
   ========================================================================== */
function initStatsCounters() {
  const stats = document.querySelectorAll('.stat-number');
  
  stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'), 10);
    
    gsap.from(stat, {
      textContent: 0,
      duration: 2.5,
      ease: "power2.out",
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: stat,
        start: "top 90%",
        toggleActions: "play none none none"
      },
      onUpdate: function() {
        stat.innerHTML = Math.floor(stat.textContent) + "+";
      }
    });
  });
}

/* ==========================================================================
   MAGNETIC INTERACTION METRICS
   ========================================================================== */
function initMagneticElements() {
  const magnets = document.querySelectorAll('.magnetic-el');
  
  magnets.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Translate magnetic element
      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    el.addEventListener('mouseleave', () => {
      // Elastic spring back to home coordinates
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}

/* ==========================================================================
   SPOTLIGHT MOUSE FOLLOW LIGHTING
   ========================================================================== */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.skill-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Draw custom spotlight gradient background highlights
      card.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.08), transparent 80%), var(--glass-bg)`;
      card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = 'var(--glass-bg)';
      card.style.borderColor = 'var(--border-color)';
    });
  });
}

/* ==========================================================================
   MOBILE MENU OVERLAYS
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const overlay = document.getElementById('mobile-menu-overlay');

  if (!toggle || !overlay) return;

  function toggleMenu() {
    toggle.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (overlay.classList.contains('active')) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }

  toggle.addEventListener('click', toggleMenu);
}

/* ==========================================================================
   GSAP INTERACTIVE LAYOUT SCROLLTRIGGERS
   ========================================================================== */
function initGsapAnimations() {
  
  // Register plugins
  gsap.registerPlugin(ScrollTrigger);

  // Global hash-free internal navigation interceptor
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          lenis.scrollTo(target);
          
          // Also close mobile overlay menu if open
          const toggle = document.getElementById('mobile-toggle');
          const overlay = document.getElementById('mobile-menu-overlay');
          if (toggle && toggle.classList.contains('active')) {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            lenis.start();
          }
        }
      }
    });
  });

  // 1. Navigation header active states on scrolling down
  ScrollTrigger.create({
    start: 'top -50px',
    onEnter: () => document.getElementById('main-header').classList.add('scrolled'),
    onLeaveBack: () => document.getElementById('main-header').classList.remove('scrolled')
  });

  // 2. Global Scroll progress updates
  ScrollTrigger.create({
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      gsap.to('#scroll-progress-bar', { width: `${self.progress * 100}%`, duration: 0.05 });
    }
  });

  // 3. Sync scroll progress with footer circle
  const progressCircle = document.getElementById('footer-scroll-circle');
  if (progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const offset = circumference - (self.progress * circumference);
        progressCircle.style.strokeDashoffset = offset;
      }
    });

    document.getElementById('back-to-top').addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo('#hero');
    });
  }

  // 4. Navbar link active highlight tracker
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(sec => {
    const id = sec.getAttribute('id');
    ScrollTrigger.create({
      trigger: sec,
      start: "top 40%",
      end: "bottom 40%",
      onEnter: () => updateActiveNavLink(id),
      onEnterBack: () => updateActiveNavLink(id)
    });
  });

  function updateActiveNavLink(id) {
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 5. Hero Reveal Sequence (Initial landing entrance)
  const heroTL = gsap.timeline();
  heroTL.from(".animate-split", {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out"
  })
  .from(".animate-fade", {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.8")
  .from(".profile-card-wrapper", {
    scale: 0.9,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
  }, "-=1");

  // 6. Reveal Text (Line-by-line animations)
  const revealTexts = document.querySelectorAll('.reveal-text');
  revealTexts.forEach(text => {
    gsap.from(text, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: text,
        start: "top 85%"
      }
    });
  });

  // 7. General slide reveals
  const revealSlidesLeft = document.querySelectorAll('.reveal-slide-left');
  revealSlidesLeft.forEach(slide => {
    gsap.from(slide, {
      x: -60,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: slide,
        start: "top 80%"
      }
    });
  });

  const revealSlidesRight = document.querySelectorAll('.reveal-slide-right');
  revealSlidesRight.forEach(slide => {
    gsap.from(slide, {
      x: 60,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: slide,
        start: "top 80%"
      }
    });
  });

  // 8. Interactive Skills stagger bars reveal
  gsap.from(".skills-grid .stagger-item", {
    y: 60,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#skills-cards-container",
      start: "top 80%"
    },
    onComplete: () => {
      // Trigger filling of skill progress bars once grid reveals
      const bars = document.querySelectorAll('.skill-progress-bar-fill');
      bars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-progress');
      });
    }
  });

  // 9. Selected projects parallax reveals & visual tilts
  const projectItems = document.querySelectorAll('.reveal-project-item');
  projectItems.forEach(item => {
    const details = item.querySelector('.project-details');
    const visual = item.querySelector('.project-visual-wrapper');

    gsap.from(details, {
      opacity: 0,
      y: 40,
      duration: 1,
      scrollTrigger: {
        trigger: item,
        start: "top 75%"
      }
    });

    gsap.from(visual, {
      opacity: 0,
      scale: 0.95,
      y: 80,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 75%"
      }
    });
  });

  // 10. Timeline central progression line fill
  gsap.fromTo(".timeline-progress-indicator", 
    { height: "0%" },
    { 
      height: "100%", 
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline-wrapper",
        start: "top 20%",
        end: "bottom 90%",
        scrub: true
      }
    }
  );

  // Experience nodes highlight triggers
  const timelineItems = document.querySelectorAll('.reveal-timeline-item');
  timelineItems.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 60%",
      onEnter: () => item.classList.add('active'),
      onLeaveBack: () => item.classList.remove('active')
    });
    
    gsap.from(item.querySelector('.timeline-content'), {
      opacity: 0,
      x: item.classList.contains('timeline-item') && item.style.left === '50%' ? 50 : -50,
      duration: 1,
      scrollTrigger: {
        trigger: item,
        start: "top 80%"
      }
    });
  });

  // 11. Tech stack entrance sequence
  gsap.from(".tech-grid .tech-item-wrap", {
    scale: 0.8,
    opacity: 0,
    stagger: 0.08,
    duration: 0.8,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: ".tech-stack-section",
      start: "top 80%"
    }
  });
}

/* ==========================================================================
   BANNER SVG RIGHT-SIDE ANIMATION
   ========================================================================== */
function initBannerAnimation() {
  // 1. Slow continuous rotation for background dashed circle
  gsap.to(".rotating-circle", {
    rotation: 360,
    transformOrigin: "center center",
    duration: 35,
    repeat: -1,
    ease: "none"
  });

  // 2. Continuous floating animation for floating icon groups
  gsap.to(".float-icon-1", {
    y: -15,
    x: 6,
    rotation: 4,
    transformOrigin: "center center",
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".float-icon-2", {
    y: 12,
    x: -8,
    rotation: -5,
    transformOrigin: "center center",
    duration: 4.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".float-icon-3", {
    y: -18,
    x: -5,
    rotation: 3,
    transformOrigin: "center center",
    duration: 3.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // 3. Subtle floating & tilting for the code window mockup
  gsap.to(".code-window-group", {
    y: -8,
    rotation: 1.5,
    transformOrigin: "center center",
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // 4. Mouse interaction: parallax displacement on the hero visual
  const visualWrapper = document.querySelector('.hero-visual');
  const innerCard = document.querySelector('.profile-card-wrapper');
  if (visualWrapper && innerCard) {
    visualWrapper.addEventListener('mousemove', (e) => {
      const rect = visualWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Parallax effect on the card wrapper
      gsap.to(innerCard, {
        rotateY: x * 0.08,
        rotateX: -y * 0.08,
        x: x * 0.04,
        y: y * 0.04,
        duration: 0.6,
        ease: "power2.out"
      });

      // Subtle reactive displacement for internal nodes
      gsap.to(".float-icon-1", { x: -x * 0.04, y: -y * 0.04, duration: 0.8, overwrite: "auto" });
      gsap.to(".float-icon-2", { x: -x * 0.03, y: -y * 0.03, duration: 0.8, overwrite: "auto" });
      gsap.to(".float-icon-3", { x: -x * 0.05, y: -y * 0.05, duration: 0.8, overwrite: "auto" });
      gsap.to(".code-window-group", { x: -x * 0.02, y: -y * 0.02, duration: 0.8, overwrite: "auto" });
    });

    visualWrapper.addEventListener('mouseleave', () => {
      // Smooth return to default state
      gsap.to(innerCard, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        y: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.6)"
      });
      
      gsap.to(".float-icon-1", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".float-icon-2", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".float-icon-3", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
      gsap.to(".code-window-group", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
    });
  }
}


