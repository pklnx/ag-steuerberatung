/* ================================================
   AG Steuerberatung – JavaScript
   ================================================ */

(function () {
  'use strict';

  /* ---- Utilities ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     1. Dynamic year in footer
  ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. Sticky header shadow on scroll
  ============================================================ */
  const header = $('#header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ============================================================
     3. Smooth scroll for anchor links (with header offset)
  ============================================================ */
  function scrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      e.preventDefault();
      scrollToSection(targetId);
      // Close mobile nav if open
      if (nav && nav.classList.contains('open')) closeNav();
    });
  });

  /* ============================================================
     4. Mobile hamburger menu
  ============================================================ */
  const hamburger = $('#hamburger');
  const nav       = $('#nav-menu');

  function openNav() {
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.contains('open') ? closeNav() : openNav();
    });

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') &&
          !nav.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }

  /* ============================================================
     5. Active nav link highlighting (IntersectionObserver)
  ============================================================ */
  const navLinks = $$('.nav-link');
  const sections = $$('section[id], #hero');

  if (sections.length && navLinks.length) {
    const headerHeight = header ? header.offsetHeight : 72;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', href === id);
          });
        }
      });
    }, {
      rootMargin: `-${headerHeight + 10}px 0px -55% 0px`,
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  /* ============================================================
     6. Scroll-reveal animation
  ============================================================ */
  function initReveal() {
    const revealTargets = $$(
      '.card, .about-content, .about-image-wrap, .gallery-item, .testimonial, ' +
      '.kontakt-form-wrap, .kontakt-info, .section-header'
    );

    revealTargets.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // Only animate if user hasn't requested reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initReveal();
  }

  /* ============================================================
     7. Contact form validation & submission
  ============================================================ */
  const contactForm = $('#contact-form');

  function setError(fieldId, message) {
    const field = $('#' + fieldId);
    const errEl = $('#' + fieldId + '-error');
    if (field)  field.classList.toggle('invalid', !!message);
    if (errEl)  errEl.textContent = message || '';
  }

  function clearErrors() {
    $$('.form-error').forEach(el => (el.textContent = ''));
    $$('.invalid').forEach(el   => el.classList.remove('invalid'));
  }

  function validateForm(form) {
    let valid = true;

    const name      = form.querySelector('#name');
    const email     = form.querySelector('#email');
    const nachricht = form.querySelector('#nachricht');
    const dsgvo     = form.querySelector('#dsgvo');

    if (!name.value.trim()) {
      setError('name', 'Bitte geben Sie Ihren Namen ein.');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError('email', 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
      valid = false;
    } else if (!emailRe.test(email.value.trim())) {
      setError('email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      valid = false;
    }

    if (!nachricht.value.trim()) {
      setError('nachricht', 'Bitte geben Sie eine Nachricht ein.');
      valid = false;
    }

    if (!dsgvo.checked) {
      setError('dsgvo', 'Bitte stimmen Sie der Datenschutzerklärung zu.');
      valid = false;
    }

    return valid;
  }

  if (contactForm) {
    const statusEl = $('#form-status');

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors();

      if (!validateForm(contactForm)) return;

      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';

      // Check if Formspree ID has been configured
      const action = contactForm.action;
      if (action.includes('YOUR_FORM_ID')) {
        // Fallback: open mailto
        const name    = contactForm.querySelector('#name').value;
        const email   = contactForm.querySelector('#email').value;
        const betreff = contactForm.querySelector('#betreff').value;
        const msg     = contactForm.querySelector('#nachricht').value;
        const subject = encodeURIComponent(betreff || 'Anfrage über Website');
        const body    = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${msg}`);
        window.location.href = `mailto:info@ag-steuerberatung.de?subject=${subject}&body=${body}`;
        statusEl.className = 'success';
        statusEl.textContent = 'Ihr E-Mail-Programm wird geöffnet …';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht senden';
        return;
      }

      try {
        const data = new FormData(contactForm);
        const res  = await fetch(action, {
          method:  'POST',
          body:    data,
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          statusEl.className   = 'success';
          statusEl.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich so bald wie möglich.';
          contactForm.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        statusEl.className   = 'error';
        statusEl.textContent = 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie direkt an info@ag-steuerberatung.de';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht senden';
      }
    });

    // Clear individual field errors on input
    ['name', 'email', 'nachricht'].forEach(id => {
      const field = contactForm.querySelector('#' + id);
      if (field) field.addEventListener('input', () => setError(id, ''));
    });
    const dsgvo = contactForm.querySelector('#dsgvo');
    if (dsgvo) dsgvo.addEventListener('change', () => setError('dsgvo', ''));
  }

  /* ============================================================
     8. Modal system (Impressum / Datenschutz)
  ============================================================ */
  function openModal(name) {
    const modal = $('#modal-' + name);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // Focus first focusable element
    const focusable = modal.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // Open via data-modal buttons
  $$('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  // Close via close button or backdrop click
  $$('.modal').forEach(modal => {
    const closeBtn  = modal.querySelector('.modal-close');
    const backdrop  = modal.querySelector('.modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    if (backdrop) backdrop.addEventListener('click', () => closeModal(modal));

    // Trap Escape key
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal(modal);
    });
  });

})();
