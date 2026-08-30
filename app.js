/* ============================================================
   STINGCLOUD — app.js
   Interactions: Navbar, Particles, Tilt, Counters, Typing,
                 Scroll Reveal, Form, Cursor Glow
   ============================================================ */

'use strict';

/* ── 1. DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initTyping();
  initHeroTilt();
  initScrollReveal();
  initCounters();
  initCardTilt();
  initContactForm();
  initProcessAnimation();
  initFooterYear();
  initCursorGlow();
  initNavMobile();
  initSmoothScrollCTAs();
});


/* ── 2. NAVBAR ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateNav() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 40);

    // Scroll spy: calculate which section is currently in view
    const scrollPosition = scrollY + 200;
    let currentSectionId = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // If reached bottom of page, activate contact
    if ((window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 120) {
      currentSectionId = 'contact';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (currentSectionId && href === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* ── 3. MOBILE NAV ── */
function initNavMobile() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    // Animate hamburger
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}


/* ── 4. PARTICLE CANVAS ── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animId;
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '56,189,248' : '124,58,237',
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    const count = Math.min(Math.floor(W * H / 8000), 120);
    particles = Array.from({ length: count }, createParticle);
  }

  let mouseX = -9999, mouseY = -9999;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.pulse += 0.012;
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.5;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Dampen velocity
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 100) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  init();
  animId = requestAnimationFrame(draw);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  }, { passive: true });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animId = requestAnimationFrame(draw);
  });
}


/* ── 5. TYPING ANIMATION ── */
function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  // Phrases completing "One Platform For ..."
  const phrases = [
    'Web Development.',
    'Cloud Hosting.',
    'Custom VPS.',
    'Smart Bot Systems.',
    'Custom Software.',
    'Top Google SEO.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function type() {
    const current = phrases[phraseIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(type, 1600);
      return;
    }

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 40);
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        isPaused = true;
        setTimeout(type, 100);
        return;
      }
      setTimeout(type, 75);
    }
  }

  // Add cursor style
  el.style.borderRight = '3px solid #38bdf8';
  el.style.paddingRight = '4px';

  const style = document.createElement('style');
  style.textContent = `@keyframes cursorBlink { 0%,100%{border-color:#38bdf8} 50%{border-color:transparent} }`;
  style.textContent += `#typingText { animation: cursorBlink 0.8s step-end infinite; }`;
  document.head.appendChild(style);

  setTimeout(type, 800);
}


/* ── 6. HERO SHOWCASE INTERACTION ── */
function initHeroTilt() {
  const showcase = document.querySelector('.hero-showcase');
  if (!showcase) return;

  showcase.addEventListener('mousemove', (e) => {
    const rect = showcase.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -4;
    const rotY = ((x - cx) / cx) * 5;
    showcase.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  showcase.addEventListener('mouseleave', () => {
    showcase.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    showcase.style.transition = 'transform 0.5s ease';
    setTimeout(() => { showcase.style.transition = ''; }, 500);
  });
}


/* ── 7. SCROLL REVEAL ── */
function initScrollReveal() {
  const selector = [
    '.service-card', '.why-feature', '.process-step',
    '.counter-item', '.step-card', '.contact-detail',
    '.section-header',
  ].join(',');

  const elements = document.querySelectorAll(selector);

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));

  // Why left/right columns
  document.querySelectorAll('.why-left .why-feature').forEach((el, i) => {
    el.classList.remove('reveal');
    el.classList.add('reveal-left', `reveal-delay-${i % 4 + 1}`);
    observer.observe(el);
  });
  document.querySelectorAll('.why-right .why-feature').forEach((el, i) => {
    el.classList.remove('reveal');
    el.classList.add('reveal-right', `reveal-delay-${i % 4 + 1}`);
    observer.observe(el);
  });
}


/* ── 8. ANIMATED COUNTERS ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter-num');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = (el, target, duration = 2000) => {
    const start = performance.now();
    const isDecimal = !Number.isInteger(target);

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = target * eased;
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = isDecimal ? target.toFixed(2) : target;
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        animate(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  // Ring number
  const ringNum = document.querySelector('.ring-number');
  if (ringNum) {
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = 99.99;
          const dur = 2000;
          const s = performance.now();
          const tick = (now) => {
            const p = Math.min((now - s) / dur, 1);
            const val = end * (1 - Math.pow(1 - p, 3));
            ringNum.textContent = val.toFixed(2);
            if (p < 1) requestAnimationFrame(tick);
            else ringNum.textContent = '99.99';
          };
          requestAnimationFrame(tick);
          ringObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    ringObserver.observe(ringNum);
  }
}


/* ── 9. CARD 3D TILT ── */
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -6;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;

      // Glow follows cursor
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.left = `${(x / rect.width) * 100}%`;
        glow.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      setTimeout(() => card.style.transition = '', 500);
      const glow = card.querySelector('.card-glow');
      if (glow) glow.style.opacity = '';
    });
  });
}


/* ── 11. CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const btnText = document.getElementById('btnText');
  const submitBtn = document.getElementById('formSubmitBtn');
  if (!form) return;

  // Live validation
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  function validateField(field) {
    const valid = field.checkValidity() && field.value.trim() !== '';
    field.classList.toggle('error', !valid);
    field.classList.toggle('success', valid);
    return valid;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let allValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    const emailField = document.getElementById('email');
    if (emailField && !validateEmail(emailField.value)) {
      emailField.classList.add('error');
      allValid = false;
    }

    if (!allValid) {
      statusEl.style.color = '#f87171';
      statusEl.textContent = '⚠ Please fill in all required fields correctly.';
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Submit to Formspree
    btnText.textContent = 'Sending…';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    statusEl.textContent = '';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://formspree.io/f/xjyvkqvl', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        btnText.textContent = '✅ Message Sent!';
        statusEl.style.color = '#10b981';
        statusEl.textContent = "🎉 Thank you! We've received your request and will be in touch within 24 hours.";

        setTimeout(() => {
          form.reset();
          inputs.forEach(f => { f.classList.remove('success', 'error'); });
          btnText.textContent = 'Send My Request ⚡';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          statusEl.textContent = '';
        }, 5000);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit form');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      btnText.textContent = 'Send My Request ⚡';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      statusEl.style.color = '#f87171';
      statusEl.textContent = '⚠ Oops! There was an issue submitting your request. Please try again or email us directly at hello@stingcloud.in';
    }
  });

  // Add error/success styles
  const style = document.createElement('style');
  style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: rgba(248,113,113,0.6) !important;
      box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important;
    }
    .form-group input.success,
    .form-group select.success,
    .form-group textarea.success {
      border-color: rgba(16,185,129,0.5) !important;
    }
    .nav-link.active { color: #38bdf8 !important; }
  `;
  document.head.appendChild(style);
}


/* ── 12. PROCESS ANIMATION ── */
function initProcessAnimation() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  steps.forEach((step, i) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.forEach(step => {
          step.style.opacity = '1';
          step.style.transform = 'translateY(0)';
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const section = document.getElementById('process');
  if (section) observer.observe(section);
}


/* ── 13. FOOTER YEAR ── */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ── 14. CURSOR GLOW EFFECT ── */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch devices

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 350px; height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateGlow() {
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    rafId = requestAnimationFrame(animateGlow);
  }
  animateGlow();
}


/* ── 15. SMOOTH SCROLL FOR CTAS ── */
function initSmoothScrollCTAs() {
  // Extra: add ripple effect to primary buttons
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-ghost-light').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        width: 8px; height: 8px;
        left: ${e.clientX - rect.left - 4}px;
        top: ${e.clientY - rect.top - 4}px;
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 10;
      `;
      if (window.getComputedStyle(this).position === 'static') {
        this.style.position = 'relative';
      }
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(50); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}


/* ── 16. FLOATING CARD GENTLE SCROLL ──
   Cards inside hero-visual which has overflow:hidden — no parallax needed,
   the CSS float animation already provides movement. Removing JS transform
   override prevents conflicts with card-3's translateX(-50%) centering. */
/* No scroll listener needed – pure CSS animation handles the motion */


/* ── 17. GLASSMORPHISM CARD MOUSE HIGHLIGHT ── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `
      radial-gradient(circle at ${x}% ${y}%, rgba(56,189,248,0.07) 0%, rgba(255,255,255,0.04) 50%)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});
