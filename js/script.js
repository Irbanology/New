// ===== Utilities =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Footer year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Navbar: active section on scroll (section.offsetTop - 120)
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav a[href^='#']");

function setActiveNav() {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id") || "";
    }
  });
  navLinks.forEach((a) => {
    a.classList.remove("active");
    if (a.getAttribute("href") === "#" + current) {
      a.classList.add("active");
    }
  });
}
window.addEventListener("scroll", setActiveNav, { passive: true });
window.addEventListener("load", setActiveNav);
setActiveNav();

// Navbar shadow on scroll
const appbar = document.querySelector(".appbar");
function updateAppbarScroll() {
  if (appbar) {
    if (window.scrollY > 20) {
      appbar.classList.add("scrolled");
    } else {
      appbar.classList.remove("scrolled");
    }
  }
}
window.addEventListener("scroll", updateAppbarScroll, { passive: true });
updateAppbarScroll();

// Mobile nav toggle + close on link click or outside click
const hamb = $(".hamburger");
const nav = $(".nav");
if (hamb && nav) {
  hamb.addEventListener("click", () => {
    nav.classList.toggle("open");
    hamb.classList.toggle("open");
  });
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      hamb.classList.remove("open");
    });
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !hamb.contains(e.target)) {
      nav.classList.remove("open");
      hamb.classList.remove("open");
    }
  });
}

// Scroll progress & subtle parallax for floating shapes
const bar = document.querySelector('.progress span');
document.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max <= 0 ? 0 : Math.min(1, (scrollY || window.pageYOffset) / max);
  if (bar) bar.style.transform = `scaleX(${p})`;
  $$('.float').forEach((el, i) => {
    el.style.transform = `translateY(${(p * 20) * (i % 2 ? 1 : -1)}px)`;
  });
});

// Ripple coordinates
$$('[data-ripple], .btn').forEach(el => {
  el.addEventListener('pointerdown', e => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
    el.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
  });
});

// Scroll reveal on view
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
$$('.reveal').forEach((el) => revealObserver.observe(el));

// Typing effect for hero title (skipped when user prefers reduced motion)
const typingEl = $('#typing');
const phrase = 'WibeIT - Private Messaging App You Can Trust';
if (typingEl) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typingEl.textContent = phrase;
  } else {
    let ti = 0;
    (function typeLoop() {
      typingEl.textContent = phrase.slice(0, ti);
      ti = ti < phrase.length ? ti + 1 : phrase.length;
      if (ti < phrase.length) setTimeout(typeLoop, 60);
    })();
  }
}

// ===== Slider (only on pages that have it) =====
const slider = $('.slider');
const slides = $('.slides');
const imgs = $$('.slides img');
const dots = $('.dots');
let idx = 0, timer, playing = true, touchStartX = null;

if (slider && slides) {
  function renderDots() {
    if (!dots) return;
    dots.innerHTML = '';
    imgs.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i===idx ? ' active' : '');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.setAttribute('aria-current', i === idx ? 'true' : 'false');
      b.addEventListener('click', () => go(i));
      dots.appendChild(b);
    });
  }
  function go(i) {
    idx = (i + imgs.length) % imgs.length;
    slides.style.transform = 'translateX(-' + (idx*100) + '%)';
    if (dots) $$('.dot', dots).forEach((d, di) => {
      d.classList.toggle('active', di === idx);
      d.setAttribute('aria-current', di === idx ? 'true' : 'false');
    });
  }
  function next(){ go(idx+1); }
  function prev(){ go(idx-1); }
  function start() { stop(); timer = setInterval(next, 4000); playing = true; }
  function stop() { clearInterval(timer); playing = false; }

  const nextBtn = $('.next');
  const prevBtn = $('.prev');
  if (nextBtn) nextBtn.onclick = next;
  if (prevBtn) prevBtn.onclick = prev;
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slides.addEventListener('touchstart', (e)=> touchStartX = e.touches[0].clientX, {passive:true});
  slides.addEventListener('touchend', (e)=>{
    if (touchStartX===null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) (dx<0? next: prev)();
    touchStartX = null;
  }, {passive:true});
  renderDots();
  go(0);
  start();
}

// ===== Smooth scroll for nav (same-page anchors only) =====
$$('.nav a').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (nav) nav.classList.remove('open');
      if (hamb) hamb.classList.remove('open');
    }
  });
});

// ===== Form validation (only on pages with contact form) =====
const form = $('#contact-form');
const status = $('#form-status');

if (form) {
  function setErr(input, msg) {
    const field = input.closest('.field');
    if (!field) return;
    const err = field.querySelector('.err');
    if (err) err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name');
    const email = $('#email');
    const msg = $('#msg');
    let ok = true;

    if (name && name.value.trim().length < 2){ setErr(name, 'Please enter your full name.'); ok=false; } else if (name) setErr(name,'');
    if (email && !validEmail(email.value)){ setErr(email, 'Please enter a valid email.'); ok=false; } else if (email) setErr(email,'');
    if (msg && msg.value.trim().length < 10){ setErr(msg, 'Please tell us a bit more.'); ok=false; } else if (msg) setErr(msg,'');

    if (!ok){ if (status) status.textContent = 'Fix the highlighted fields.'; return; }
    if (status) status.textContent = 'Sending…';

    setTimeout(() => {
      if (status) status.textContent = 'Thanks! Your message has been sent.';
      form.reset();
    }, 800);
  });
}


document.addEventListener("contextmenu", function(e) {
  e.preventDefault()
}, false )