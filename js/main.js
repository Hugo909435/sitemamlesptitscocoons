/* =============================================
   MAM Les P'tits Cocoons — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. NAVIGATION — Burger menu & scroll style
     ============================================= */
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Burger toggle
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on nav link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Navbar scrolled state
  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load


  /* =============================================
     2. SMOOTH SCROLL — Anchor links
     ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* =============================================
     3. ANIMATIONS — IntersectionObserver
     ============================================= */
  const animateElements = document.querySelectorAll('.animate-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animateElements.forEach(el => observer.observe(el));


  /* =============================================
     4. LIGHTBOX — Galerie photos
     ============================================= */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');

  let currentIndex = 0;
  const images = [];

  // Build images array from gallery
  galleryItems.forEach((item, i) => {
    const img = item.querySelector('img');
    images.push({ src: img.src, alt: img.alt });

    item.addEventListener('click', () => {
      openLightbox(i);
    });

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Agrandir : ${img.alt}`);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Return focus to gallery item
    if (galleryItems[currentIndex]) {
      galleryItems[currentIndex].focus();
    }
  }

  function updateLightboxImage() {
    const { src, alt } = images[currentIndex];
    lightboxImg.src = '';
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = alt;

    // Update prev/next visibility
    lightboxPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    lightboxNext.style.visibility = currentIndex < images.length - 1 ? 'visible' : 'hidden';
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateLightboxImage();
    }
  }

  function showNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateLightboxImage();
    }
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Close on overlay click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    switch (e.key) {
      case 'Escape':      closeLightbox(); break;
      case 'ArrowLeft':   showPrev();      break;
      case 'ArrowRight':  showNext();      break;
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? showNext() : showPrev();
    }
  }, { passive: true });


  /* =============================================
     5. FORMULAIRE — Validation côté client
     ============================================= */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    // Real-time validation on blur
    const nameInput    = document.getElementById('name');
    const emailInput   = document.getElementById('email');
    const messageInput = document.getElementById('message');

    nameInput.addEventListener('blur',    () => validateField(nameInput,    'nameError',    validateName));
    emailInput.addEventListener('blur',   () => validateField(emailInput,   'emailError',   validateEmail));
    messageInput.addEventListener('blur', () => validateField(messageInput, 'messageError', validateMessage));

    nameInput.addEventListener('input',    () => clearError(nameInput,    'nameError'));
    emailInput.addEventListener('input',   () => clearError(emailInput,   'emailError'));
    messageInput.addEventListener('input', () => clearError(messageInput, 'messageError'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameOk    = validateField(nameInput,    'nameError',    validateName);
      const emailOk   = validateField(emailInput,   'emailError',   validateEmail);
      const messageOk = validateField(messageInput, 'messageError', validateMessage);

      if (!nameOk || !emailOk || !messageOk) return;

      // Build mailto link
      const name    = nameInput.value.trim();
      const email   = emailInput.value.trim();
      const phone   = document.getElementById('phone').value.trim();
      const age     = document.getElementById('age').value;
      const date    = document.getElementById('date').value;
      const message = messageInput.value.trim();

      const ageLabels = {
        'moins-3-mois': 'Moins de 3 mois',
        '3-6-mois': '3 à 6 mois',
        '6-12-mois': '6 à 12 mois',
        '1-2-ans': '1 à 2 ans',
        '2-3-ans': '2 à 3 ans'
      };

      const body = [
        `Nom : ${name}`,
        `Email : ${email}`,
        phone    ? `Téléphone : ${phone}` : '',
        age      ? `Âge de l'enfant : ${ageLabels[age] || age}` : '',
        date     ? `Date souhaitée : ${formatDate(date)}` : '',
        '',
        `Message :`,
        message
      ].filter(Boolean).join('\n');

      const subject = encodeURIComponent(`Demande de contact - MAM Les P'tits Cocoons - ${name}`);
      const bodyEncoded = encodeURIComponent(body);
      const mailtoUrl = `mailto:mam.lesptitscocoons@gmail.com?subject=${subject}&body=${bodyEncoded}`;

      window.location.href = mailtoUrl;

      // Show success message after a short delay
      setTimeout(() => {
        formSuccess.classList.add('show');
        form.reset();
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      }, 300);
    });
  }

  // --- Validation helpers ---

  function validateName(value) {
    if (!value.trim()) return 'Veuillez entrer votre prénom et nom.';
    if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
    return '';
  }

  function validateEmail(value) {
    if (!value.trim()) return 'Veuillez entrer votre adresse email.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return 'Veuillez entrer une adresse email valide.';
    return '';
  }

  function validateMessage(value) {
    if (!value.trim()) return 'Veuillez entrer un message.';
    if (value.trim().length < 10) return 'Le message doit contenir au moins 10 caractères.';
    return '';
  }

  function validateField(input, errorId, validatorFn) {
    const error = validatorFn(input.value);
    const errorEl = document.getElementById(errorId);
    if (error) {
      errorEl.textContent = error;
      input.classList.add('error');
      return false;
    } else {
      errorEl.textContent = '';
      input.classList.remove('error');
      return true;
    }
  }

  function clearError(input, errorId) {
    if (input.classList.contains('error')) {
      document.getElementById(errorId).textContent = '';
      input.classList.remove('error');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }


  /* =============================================
     6. ACTIVE NAV LINK — Highlight on scroll
     ============================================= */
  const sections = document.querySelectorAll('section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70}px 0px 0px 0px`
  });

  sections.forEach(section => navObserver.observe(section));

});
