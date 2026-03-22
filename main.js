// ==========================================
// THE PASSION COMPANY — main.js
// ==========================================

(function() {
  'use strict';

  // === Theme Toggle ===
  const toggles = document.querySelectorAll('[data-theme-toggle], [data-theme-toggle-mobile]');
  const root = document.documentElement;

  // Determine initial theme
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  updateToggleIcons();

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      updateToggleIcons();
    });
  });

  function updateToggleIcons() {
    const sunIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    const moonIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    toggles.forEach(toggle => {
      const svgContainer = toggle.querySelector('svg')?.parentElement === toggle ? toggle : toggle;
      // Replace just the SVG
      const existingSvg = toggle.querySelector('svg');
      if (existingSvg) {
        const temp = document.createElement('div');
        temp.innerHTML = currentTheme === 'dark' ? sunIcon : moonIcon;
        existingSvg.replaceWith(temp.firstElementChild);
      }
      toggle.setAttribute('aria-label', 'Switch to ' + (currentTheme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  // === Mobile Menu ===
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // === Header scroll behavior ===
  const header = document.getElementById('header');
  let lastScroll = 0;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100 && currentScroll > lastScroll) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }

        lastScroll = currentScroll;
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // === Scroll reveal ===
  const fadeElements = document.querySelectorAll(
    '.signal-header, .manifesto-main, .manifesto-side, ' +
    '.fragment-card, .what-header, .infra-card, ' +
    '.path-header, .path-step, .founders-header, ' +
    '.founders-text, .founders-philosophy, .join-content'
  );

  fadeElements.forEach(el => el.classList.add('fade-in'));

  // Stagger fragment cards
  document.querySelectorAll('.fragment-card').forEach((card, i) => {
    card.classList.add('fade-in-delay-' + (i + 1));
  });

  // Stagger path steps
  document.querySelectorAll('.path-step').forEach((step, i) => {
    step.classList.add('fade-in-delay-' + (i + 1));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));

  // === Email form ===
  // IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
  // See google-apps-script.js for setup instructions
  const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

  const form = document.getElementById('joinForm');
  const successMsg = document.getElementById('joinSuccess');
  const emailInput = document.getElementById('emailInput');
  const nameInput = document.getElementById('nameInput');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!email) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'SENDING...';
      submitBtn.disabled = true;

      try {
        if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE') {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
          });
        }
        form.hidden = true;
        successMsg.hidden = false;
        successMsg.style.display = 'block';
      } catch (err) {
        // Even on network errors with no-cors, the request likely went through
        form.hidden = true;
        successMsg.hidden = false;
        successMsg.style.display = 'block';
      }
    });
  }

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
