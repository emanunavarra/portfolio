/* ============================================================
   EMANUELE · PORTFOLIO — interazioni (vanilla JS)
   ============================================================ */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* Anno corrente nel footer */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Header: stato allo scroll + torna su */
  const header = document.querySelector('.site-header');
  const toTop = document.querySelector('.to-top');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
    toTop.classList.toggle('show', window.scrollY > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* Menu mobile */
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay = document.getElementById('mobile-menu');

  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('aria-hidden', String(!open));
    overlay.toggleAttribute('inert', !open);
    body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const first = overlay.querySelector('a');
      if (first) first.focus();
    } else {
      menuToggle.focus();
    }
  };

  menuToggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (mq) => {
    if (mq.matches && body.classList.contains('menu-open')) setMenu(false);
  });
  setMenu(false); // stato iniziale (inert attivo)

  /* Reveal allo scroll */
  const revealEls = document.querySelectorAll('.reveal, .lm');
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* Scrollspy: evidenzia la sezione attiva */
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const spySections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id)
      );
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spySections.forEach((sec) => spy.observe(sec));

  /* Effetto decode sui kicker */
  const scrambleChars = '█▓▒░<>/{}[]=+*·';
  const scramble = (el) => {
    const original = el.textContent;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      const progress = Math.max(0, (frame - 6) / 2);
      el.textContent = original
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < progress) return ch;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join('');
      if (progress >= original.length) {
        el.textContent = original;
        clearInterval(timer);
      }
    }, 26);
  };

  if (!prefersReduced) {
    const scrambleObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scramble(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-scramble]').forEach((el) => scrambleObserver.observe(el));
  }

  /* Parallasse leggera sull'art della hero */
  const heroArt = document.getElementById('hero-art');
  const ctaArrow = document.querySelector('.cta-arrow');
  if (!prefersReduced && heroArt) {
    let ticking = false;
    const parallax = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroArt.style.transform = 'translateY(' + (y * 0.07) + 'px)';
      }
      if (ctaArrow && window.innerWidth > 720) {
        const rect = ctaArrow.parentElement.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          ctaArrow.style.transform = 'translateY(calc(-50% + ' + (rect.top * -0.06) + 'px))';
        }
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
  }

  /* Accordion servizi */
  const accItems = document.querySelectorAll('.acc-item');
  accItems.forEach((item) => {
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      accItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Copia email + toast */
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = 'Copiato ✓';
      showToast('Email copiata negli appunti');
      setTimeout(() => { btn.textContent = original; }, 2000);
    });
  });
})();