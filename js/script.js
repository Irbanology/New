// ===== Utilities =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Footer year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Navbar: active section on scroll (section.offsetTop - 120)
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav a");
const samePageHashLinks = [...navLinks].filter((a) => {
  try {
    const url = new URL(a.getAttribute("href") || "", window.location.href);
    return url.pathname === window.location.pathname && url.hash;
  } catch {
    return false;
  }
});

function setActiveNav() {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id") || "";
    }
  });
  samePageHashLinks.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    a.classList.remove("active");
    if (hash === "#" + current) {
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
const navOverlay = document.getElementById("nav-overlay");
if (hamb && nav) {
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }
  function openMenu() {
    nav.classList.add("open");
    hamb.classList.add("open");
    hamb.setAttribute("aria-expanded", "true");
    nav.removeAttribute("aria-hidden");
    if (appbar) appbar.classList.add("drawer-open");
    if (navOverlay) {
      navOverlay.classList.add("active");
      navOverlay.setAttribute("aria-hidden", "false");
    }
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + "px";
  }
  function closeMenu() {
    nav.classList.remove("open");
    hamb.classList.remove("open");
    hamb.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
    if (appbar) appbar.classList.remove("drawer-open");
    if (navOverlay) {
      navOverlay.classList.remove("active");
      navOverlay.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
  hamb.addEventListener("click", () => {
    const isOpen = nav.classList.contains("open");
    if (isOpen) closeMenu();
    else openMenu();
  });
  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }
  navLinks.forEach((a) => {
    a.addEventListener("click", closeMenu);
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !hamb.contains(e.target) && e.target !== navOverlay) {
      closeMenu();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) closeMenu();
  });
  function setNavAriaHidden() {
    const isMobile = window.matchMedia("(max-width: 880px)").matches;
    if (isMobile && !nav.classList.contains("open")) {
      nav.setAttribute("aria-hidden", "true");
    } else {
      nav.removeAttribute("aria-hidden");
    }
    if (!isMobile && nav.classList.contains("open")) {
      closeMenu();
    }
  }
  setNavAriaHidden();
  window.addEventListener("resize", setNavAriaHidden);
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

// FAQ smooth open/close: wrap content in .faq-content, animate height + opacity, aria-expanded, no double-toggle
const faqCards = $$('.faq-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (faqCards.length && !prefersReducedMotion) {
  const DURATION_MS = 420;
  const EASE_OPEN = 'cubic-bezier(0.4, 0, 0.2, 1)';   // smooth ease-out
  const EASE_CLOSE = 'cubic-bezier(0.4, 0, 0.2, 1)';  // same for consistent feel
  const TRANSITION = 'height ' + (DURATION_MS / 1000) + 's ' + EASE_OPEN + ', opacity ' + (DURATION_MS * 0.6 / 1000) + 's ease-out';
  faqCards.forEach(function (details) {
    details.classList.add('faq-smooth');
    const summary = details.querySelector('summary');
    let p = details.querySelector('p');
    if (!summary || !p) return;
    var content = details.querySelector('.faq-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'faq-content';
      content.setAttribute('role', 'region');
      p.parentNode.insertBefore(content, p);
      content.appendChild(p);
    }
    var animating = false;
    var wasClosing = false;
    function clearContentStyles() {
      content.style.removeProperty('height');
      content.style.removeProperty('overflow');
      content.style.removeProperty('transition');
      content.style.removeProperty('max-height');
      content.style.removeProperty('opacity');
    }
    function onTransitionEnd(ev) {
      if (ev.target !== content || (ev.propertyName !== 'height' && ev.propertyName !== 'opacity')) return;
      content.removeEventListener('transitionend', onTransitionEnd);
      animating = false;
      clearContentStyles();
      if (wasClosing) details.open = false;
      summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    }
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (animating) return;
      var isOpening = !details.open;
      animating = true;
      wasClosing = !isOpening;
      if (isOpening) {
        details.open = true;
        summary.setAttribute('aria-expanded', 'true');
        var endHeight = content.scrollHeight;
        content.style.setProperty('height', '0px');
        content.style.setProperty('opacity', '0');
        content.style.setProperty('overflow', 'hidden');
        content.style.setProperty('max-height', 'none');
        content.style.setProperty('transition', 'none');
        content.offsetHeight;
        content.style.setProperty('transition', TRANSITION);
        content.style.setProperty('height', endHeight + 'px');
        content.style.setProperty('opacity', '1');
      } else {
        var startHeight = content.scrollHeight;
        content.style.setProperty('height', startHeight + 'px');
        content.style.setProperty('opacity', '1');
        content.style.setProperty('overflow', 'hidden');
        content.style.setProperty('max-height', 'none');
        content.style.setProperty('transition', 'height ' + (DURATION_MS / 1000) + 's ' + EASE_CLOSE + ', opacity ' + (DURATION_MS * 0.4 / 1000) + 's ease-in');
        content.offsetHeight;
        content.style.setProperty('height', '0px');
        content.style.setProperty('opacity', '0');
      }
      content.addEventListener('transitionend', onTransitionEnd);
      setTimeout(function () {
        if (animating) {
          animating = false;
          if (wasClosing) details.open = false;
          clearContentStyles();
          summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
        }
      }, DURATION_MS + 100);
    });
    summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
  });
}

// Typing effect for hero title (skipped when user prefers reduced motion)
const typingEl = $('#typing');
const phrase = 'Secure Messaging App Built for Private Communication';
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
let idx = 0, touchStartX = null;

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
    imgs.forEach((img, imgIdx) => {
      img.classList.toggle('active', imgIdx === idx);
      img.setAttribute('aria-hidden', imgIdx === idx ? 'false' : 'true');
    });
    if (dots) $$('.dot', dots).forEach((d, di) => {
      d.classList.toggle('active', di === idx);
      d.setAttribute('aria-current', di === idx ? 'true' : 'false');
    });
  }
  function next(){ go(idx+1); }
  function prev(){ go(idx-1); }

  const nextBtn = $('.next');
  const prevBtn = $('.prev');
  if (nextBtn) nextBtn.onclick = next;
  if (prevBtn) prevBtn.onclick = prev;
  slides.addEventListener('touchstart', (e)=> touchStartX = e.touches[0].clientX, {passive:true});
  slides.addEventListener('touchend', (e)=>{
    if (touchStartX===null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) (dx<0? next: prev)();
    touchStartX = null;
  }, {passive:true});
  renderDots();
  go(0);
}

// ===== Smooth scroll for nav (same-page hash links) =====
$$('.nav a').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href') || '';
    const isHashLink = href.includes('#');
    if (!isHashLink) return;
    const hash = href.slice(href.indexOf('#'));
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
      if (nav) nav.classList.remove('open');
      if (hamb) hamb.classList.remove('open');
    }
  });
});

// Smoothly align section when arriving with a hash
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth' });
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

// Download modal (index privacy CTA button)
const downloadModalTriggers = $$('#open-download-modal');
const downloadModalOverlay = $('#download-modal-overlay');
const downloadModalClose = $('#download-modal-close');

if (downloadModalTriggers.length && downloadModalOverlay && downloadModalClose) {
  function openDownloadModal() {
    downloadModalOverlay.classList.add('open');
    downloadModalOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeDownloadModal() {
    downloadModalOverlay.classList.remove('open');
    downloadModalOverlay.setAttribute('aria-hidden', 'true');
  }

  downloadModalTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openDownloadModal();
    });
  });

  downloadModalClose.addEventListener('click', closeDownloadModal);

  downloadModalOverlay.addEventListener('click', function (e) {
    if (e.target === downloadModalOverlay) {
      closeDownloadModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && downloadModalOverlay.classList.contains('open')) {
      closeDownloadModal();
    }
  });
}