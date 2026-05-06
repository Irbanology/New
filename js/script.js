// ===== Utilities =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Footer year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Footer sitemap link: inject on all pages
$$('.foot-col').forEach((col) => {
  const title = (col.querySelector('.foot-col-title')?.textContent || '').trim().toLowerCase();
  if (title !== 'explore') return;
  const exists = [...col.querySelectorAll('a')].some(
    (a) => (a.getAttribute('href') || '').includes('sitemaps.html')
  );
  if (exists) return;
  const link = document.createElement('a');
  link.href = '/sitemaps.html';
  link.textContent = 'Sitemap';
  col.appendChild(link);
});

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

// Mobile drawer (max-width: 768px): created from scratch via JS for all pages
const desktopBrandLogo = $(".brand .logo img");
const desktopHamburger = $(".hamburger");
const legacyOverlay = $("#nav-overlay");
if (legacyOverlay) legacyOverlay.remove();
$$(".mobile-menu, .nav-drawer").forEach((legacyMenu) => legacyMenu.remove());

if (desktopHamburger) {
  desktopHamburger.classList.add("mob-hamburger");
  desktopHamburger.id = "mobHamburger";
  desktopHamburger.setAttribute("aria-controls", "mobDrawer");
  desktopHamburger.setAttribute("aria-expanded", "false");
}

if (!$("#mobOverlay")) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="mob-overlay" id="mobOverlay"></div>
<div class="mob-drawer" id="mobDrawer">
  <div class="mob-drawer-header">
    <a href="./index.html" class="mob-logo">
      <img src="${desktopBrandLogo ? desktopBrandLogo.getAttribute("src") : "/images/wibeIt_black.webp"}" alt="Wibeit Logo">
    </a>
    <button class="mob-close-btn" id="mobCloseBtn" aria-label="Close menu">✕</button>
  </div>
  <nav class="mob-nav-links">
    <a href="./index.html#features">Features</a>
    <a href="./index.html#showcase">Showcase</a>
    <a href="./wibeitsecure.html">Wibeit Secure</a>
    <a href="./about.html">About</a>
    <a href="./contactus.html">Contact</a>
  </nav>
</div>`
  );
}

const mobHamburger = document.getElementById("mobHamburger");
const mobDrawer = document.getElementById("mobDrawer");
const mobOverlay = document.getElementById("mobOverlay");
const mobCloseBtn = document.getElementById("mobCloseBtn");

function openMobMenu() {
  if (!mobDrawer || !mobOverlay) return;
  mobDrawer.classList.add("active");
  mobOverlay.classList.add("active");
  if (mobHamburger) mobHamburger.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobMenu() {
  if (!mobDrawer || !mobOverlay) return;
  mobDrawer.classList.remove("active");
  mobOverlay.classList.remove("active");
  if (mobHamburger) mobHamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

if (mobHamburger) mobHamburger.addEventListener("click", openMobMenu);
if (mobCloseBtn) mobCloseBtn.addEventListener("click", closeMobMenu);
if (mobOverlay) mobOverlay.addEventListener("click", closeMobMenu);
document.querySelectorAll(".mob-nav-links a").forEach((link) => {
  link.addEventListener("click", closeMobMenu);
});

window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 768px)").matches) closeMobMenu();
});

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

// FAQ smooth open/close across devices.
const faqCards = $$('.faq-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (faqCards.length && !prefersReducedMotion) {
  const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  function getDurationMs() {
    return window.matchMedia('(max-width: 768px)').matches ? 260 : 360;
  }

  faqCards.forEach(function (details) {
    const summary = details.querySelector('summary');
    if (!summary) return;
    details.classList.add('faq-smooth');

    var content = details.querySelector('.faq-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'faq-content';
      content.setAttribute('role', 'region');
      const nodesToWrap = Array.from(details.children).filter(function (el) {
        return el !== summary;
      });
      if (!nodesToWrap.length) return;
      nodesToWrap[0].parentNode.insertBefore(content, nodesToWrap[0]);
      nodesToWrap.forEach(function (node) { content.appendChild(node); });
    }

    var animating = false;
    var collapseAfterAnimation = false;

    function clearContentStyles() {
      content.style.removeProperty('height');
      content.style.removeProperty('overflow');
      content.style.removeProperty('transition');
      content.style.removeProperty('opacity');
      content.style.removeProperty('will-change');
    }

    function finishAnimation() {
      animating = false;
      if (collapseAfterAnimation) details.open = false;
      clearContentStyles();
      summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    }

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (animating) return;

      const opening = !details.open;
      const durationMs = getDurationMs();
      const durationSec = (durationMs / 1000) + 's';
      animating = true;
      collapseAfterAnimation = !opening;
      content.style.setProperty('will-change', 'height, opacity');

      if (opening) {
        details.open = true;
        summary.setAttribute('aria-expanded', 'true');
        const endHeight = content.scrollHeight;
        content.style.setProperty('height', '0px');
        content.style.setProperty('opacity', '0');
        content.style.setProperty('overflow', 'hidden');
        content.style.setProperty('transition', 'none');
        content.offsetHeight;
        content.style.setProperty('transition', 'height ' + durationSec + ' ' + EASE + ', opacity ' + (durationMs * 0.72 / 1000) + 's ease-out');
        requestAnimationFrame(function () {
          content.style.setProperty('height', endHeight + 'px');
          content.style.setProperty('opacity', '1');
        });
      } else {
        const startHeight = content.scrollHeight;
        content.style.setProperty('height', startHeight + 'px');
        content.style.setProperty('opacity', '1');
        content.style.setProperty('overflow', 'hidden');
        content.style.setProperty('transition', 'none');
        content.offsetHeight;
        content.style.setProperty('transition', 'height ' + durationSec + ' ' + EASE + ', opacity ' + (durationMs * 0.5 / 1000) + 's ease-in');
        requestAnimationFrame(function () {
          content.style.setProperty('height', '0px');
          content.style.setProperty('opacity', '0');
        });
      }

      function onTransitionEnd(ev) {
        if (ev.target !== content || ev.propertyName !== 'height') return;
        content.removeEventListener('transitionend', onTransitionEnd);
        finishAnimation();
      }
      content.addEventListener('transitionend', onTransitionEnd);

      // Fallback guard for interrupted transitions on some mobile browsers.
      setTimeout(function () {
        if (!animating) return;
        content.removeEventListener('transitionend', onTransitionEnd);
        finishAnimation();
      }, durationMs + 140);
    });

    summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
  });
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
      closeMobMenu();
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

// ===== Contact form submit behavior (direct email delivery) =====
const form = document.querySelector('#contact-form');
const status = $('#form-status');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#msg');

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    const clearInlineError = function (fieldEl) {
      const errEl = fieldEl?.closest('.field')?.querySelector('.err');
      if (errEl) errEl.textContent = '';
    };
    const setInlineError = function (fieldEl, msg) {
      const errEl = fieldEl?.closest('.field')?.querySelector('.err');
      if (errEl) errEl.textContent = msg;
    };

    clearInlineError(nameInput);
    clearInlineError(emailInput);
    clearInlineError(messageInput);
    if (status) status.textContent = '';

    let hasError = false;
    if (!name) {
      setInlineError(nameInput, 'Please enter your name.');
      hasError = true;
    }
    if (!email) {
      setInlineError(emailInput, 'Please enter your email.');
      hasError = true;
    }
    if (!message) {
      setInlineError(messageInput, 'Please enter your message.');
      hasError = true;
    }

    if (hasError) {
      if (status) status.textContent = 'Please fill in all fields before sending.';
      return;
    }

    if (status) status.textContent = 'Sending your message...';

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    fetch('/send-mail.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    })
      .then((response) => {
        if (!response.ok) throw new Error('Mail endpoint returned non-200 response.');
        return response.json();
      })
      .then((data) => {
        if (data && data.success === true) {
          if (status) status.textContent = 'Thank you! Your query has been sent to support@wibeit.co.';
          form.reset();
          return;
        }
        throw new Error((data && data.error) || 'Mail send failed.');
      })
      .catch(() => {
        if (status) status.textContent = 'Could not send message right now. Please try again.';
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  });
}

// Download modal (index privacy CTA button)
const downloadModalTriggers = $$('[data-open-download-modal]');
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
