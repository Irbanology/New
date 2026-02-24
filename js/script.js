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

// Defer non-critical work until after first paint (helps LCP / TBT)
function whenIdle(cb) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 1);
  }
}

// Scroll progress & subtle parallax (passive + rAF) — deferred
whenIdle(function () {
  const bar = document.querySelector('.progress span');
  let scrollScheduled = false;
  function updateScrollProgress() {
    scrollScheduled = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max <= 0 ? 0 : Math.min(1, (scrollY || window.pageYOffset) / max);
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    $$('.float').forEach(function (el, i) {
      el.style.transform = 'translateY(' + (p * 20) * (i % 2 ? 1 : -1) + 'px)';
    });
  }
  document.addEventListener('scroll', function () {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }, { passive: true });
});

// Ripple coordinates — deferred
whenIdle(function () {
  $$('[data-ripple], .btn').forEach(function (el) {
    el.addEventListener('pointerdown', function (e) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
      el.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
    });
  });
});

// Scroll reveal on view — deferred
whenIdle(function () {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  $$('.reveal').forEach(function (el) { revealObserver.observe(el); });
});

// FAQ smooth open/close (animate height instead of instant toggle)
const faqCards = $$('.faq-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (faqCards.length && !prefersReducedMotion) {
  const DURATION_MS = 350;
  faqCards.forEach(function (details) {
    const summary = details.querySelector('summary');
    const content = details.querySelector('p');
    if (!summary || !content) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpening = !details.open;
      if (isOpening) {
        details.open = true;
        const endHeight = content.scrollHeight;
        content.style.height = '0px';
        content.style.overflow = 'hidden';
        content.style.transition = 'none';
        content.offsetHeight; // reflow
        content.style.transition = 'height ' + (DURATION_MS / 1000) + 's ease';
        content.style.height = endHeight + 'px';
        const onEnd = function () {
          content.removeEventListener('transitionend', onEnd);
          content.style.height = '';
          content.style.overflow = '';
          content.style.transition = '';
        };
        content.addEventListener('transitionend', onEnd);
      } else {
        const startHeight = content.scrollHeight;
        content.style.height = startHeight + 'px';
        content.style.overflow = 'hidden';
        content.style.transition = 'height ' + (DURATION_MS / 1000) + 's ease';
        content.offsetHeight;
        content.style.height = '0px';
        const onEnd = function () {
          content.removeEventListener('transitionend', onEnd);
          details.open = false;
          content.style.height = '';
          content.style.overflow = '';
          content.style.transition = '';
        };
        content.addEventListener('transitionend', onEnd);
      }
    });
  });
}

// Typing effect for hero title (skipped when user prefers reduced motion)
const typingEl = $('#typing');
const phrase = 'Secure Messaging App End to End Encrypted Chat You Can Trust';
if (typingEl) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typingEl.textContent = phrase;
  } else {
    let ti = 0;
    (function typeLoop() {
      ti = ti + 1;
      typingEl.textContent = phrase.slice(0, ti);
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