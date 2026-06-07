/* ============================================================
   IRON & OAK FITNESS — MAIN JS
   ============================================================ */

/* ---- Navbar scroll behaviour ---- */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const heroOrPage = document.querySelector('.hero, .page-hero');
  const isTransparentStart = !!heroOrPage;

  function updateNav() {
    if (!isTransparentStart || window.scrollY > 60) {
      nav.classList.remove('transparent');
      nav.classList.add('solid');
    } else {
      nav.classList.add('transparent');
      nav.classList.remove('solid');
    }
  }

  if (isTransparentStart) {
    nav.classList.add('transparent');
  } else {
    nav.classList.add('solid');
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* ---- Mobile nav ---- */
(function () {
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!burger || !mobileNav) return;

  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const isOpen = mobileNav.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });
})();

/* ---- Scroll fade-in animations ---- */
(function () {
  const targets = document.querySelectorAll('.fade-in, .fade-in-up');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ---- Hero parallax ---- */
(function () {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
  }, { passive: true });
})();

/* ---- Accordion ---- */
(function () {
  const triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.classList.contains('open');
      triggers.forEach(t => {
        t.classList.remove('open');
        const body = t.nextElementSibling;
        if (body) body.classList.remove('open');
      });
      if (!isOpen) {
        trigger.classList.add('open');
        const body = trigger.nextElementSibling;
        if (body) body.classList.add('open');
      }
    });
  });
})();

/* ---- FAQ Tabs ---- */
(function () {
  const tabs = document.querySelectorAll('.faq-tab');
  const categories = document.querySelectorAll('.faq-category');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      categories.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
})();

/* ---- Billing Toggle (Membership page) ---- */
(function () {
  const toggle = document.getElementById('billing-toggle');
  if (!toggle) return;

  const monthlyLabel = document.getElementById('label-monthly');
  const annualLabel  = document.getElementById('label-annual');
  const prices = document.querySelectorAll('[data-monthly][data-annual]');

  function updatePrices(isAnnual) {
    prices.forEach(el => {
      const monthly = parseFloat(el.dataset.monthly);
      const annual  = parseFloat(el.dataset.annual);
      el.textContent = isAnnual ? annual : monthly;
    });
    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
    if (annualLabel)  annualLabel.classList.toggle('active', isAnnual);
  }

  toggle.addEventListener('change', () => updatePrices(toggle.checked));
  updatePrices(false);
})();

/* ---- Class filter ---- */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const cells = document.querySelectorAll('.class-pill');
      cells.forEach(cell => {
        const parent = cell.closest('td');
        if (!parent) return;
        if (filter === 'all' || cell.classList.contains(filter)) {
          cell.style.opacity = '1';
        } else {
          cell.style.opacity = '0.2';
        }
      });
    });
  });
})();

/* ---- Contact form ---- */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = document.getElementById('form-success');
    if (success) {
      success.style.display = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }
  });
})();

/* ---- Active nav link ---- */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a, .mobile-nav a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
