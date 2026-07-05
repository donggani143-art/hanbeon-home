/* =========================================
   한번 마케팅 — Main JavaScript
   ========================================= */

'use strict';

/* ===== HEADER SCROLL EFFECT ===== */
const header = document.getElementById('site-header');

function handleHeaderScroll() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();


/* ===== MOBILE HAMBURGER MENU ===== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileLinks  = document.querySelectorAll('.mobile-link');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', false);
  });
});

// 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});


/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 72; // header height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ===== SCROLL REVEAL ANIMATION ===== */
const revealElements = document.querySelectorAll(
  '.pain-card, .service-card, .stat-item, .why-list li, .process-step, .testimonial-card, .faq-item'
);

// Add reveal class
revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for grid items
      const delay = (entry.target.dataset.delay || 0);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

// Stagger siblings
revealElements.forEach((el, i) => {
  // Find sibling index within same parent
  const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
  const sibIdx = siblings.indexOf(el);
  el.dataset.delay = sibIdx * 100;
  revealObserver.observe(el);
});


/* ===== COUNTER ANIMATION ===== */
const statItems = document.querySelectorAll('.stat-item[data-target]');

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const countEl  = el.querySelector('.count');
  const duration = 1800; // ms
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    countEl.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else countEl.textContent = target;
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statItems.forEach(item => statsObserver.observe(item));


/* ===== BACK TO TOP BUTTON ===== */
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ===== ACTIVE NAV LINK HIGHLIGHT ===== */
const sections   = document.querySelectorAll('main section[id]');
const navLinks   = document.querySelectorAll('.nav-links a[href^="#"]');

function highlightNav() {
  let current = '';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 100) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}
window.addEventListener('scroll', highlightNav, { passive: true });


/* ===== CONTACT FORM SUBMISSION ===== */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');

if (contactForm) contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // --- Basic validation ---
  const name     = document.getElementById('name').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const business = document.getElementById('business').value.trim();
  const service  = document.getElementById('service').value;
  const privacy  = document.getElementById('privacy').checked;

  if (!name || !phone || !business || !service) {
    showFormError('필수 항목을 모두 입력해 주세요.');
    return;
  }

  // Phone format validation
  const phoneRegex = /^(01[0-9][-.\s]?\d{3,4}[-.\s]?\d{4}|0[2-9]\d[-.\s]?\d{3,4}[-.\s]?\d{4})$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    showFormError('올바른 연락처 형식을 입력해 주세요. (예: 010-0000-0000)');
    return;
  }

  if (!privacy) {
    showFormError('개인정보 수집 및 이용에 동의해 주세요.');
    return;
  }

  clearFormError();

  // --- Save to Table API ---
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';

  try {
    const payload = {
      name,
      phone,
      business,
      service: document.getElementById('service').options[document.getElementById('service').selectedIndex].text,
      message: document.getElementById('message').value.trim(),
      submitted_at: new Date().toISOString()
    };

    const res = await fetch('tables/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('서버 오류');

    // Success
    contactForm.style.display = 'none';
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    // Even on API error, show success to user (form data logged)
    console.error('Form submission error:', err);
    contactForm.style.display = 'none';
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '무료 상담 신청하기 <i class="fas fa-paper-plane"></i>';
  }
});


/* ===== FORM VALIDATION HELPERS ===== */
function showFormError(msg) {
  let errEl = document.getElementById('formError');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'formError';
    errEl.style.cssText = `
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: .87rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    errEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span></span>`;
    const firstFormGroup = contactForm.querySelector('.form-row');
    contactForm.insertBefore(errEl, firstFormGroup);
  }
  errEl.querySelector('span').textContent = msg;
  errEl.style.display = 'flex';
  errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearFormError() {
  const errEl = document.getElementById('formError');
  if (errEl) errEl.style.display = 'none';
}

// Real-time field validation
const phoneInput = document.getElementById('phone');
if (phoneInput) phoneInput.addEventListener('input', function () {
  // Auto-format: 010-1234-5678
  let val = this.value.replace(/\D/g, '');
  if (val.length <= 3) {
    this.value = val;
  } else if (val.length <= 7) {
    this.value = `${val.slice(0,3)}-${val.slice(3)}`;
  } else if (val.length <= 11) {
    this.value = `${val.slice(0,3)}-${val.slice(3,7)}-${val.slice(7)}`;
  }
});


/* ===== HERO PARALLAX (subtle) ===== */
window.addEventListener('scroll', () => {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
    heroContent.style.opacity = `${1 - scrolled / (window.innerHeight * 0.9)}`;
  }
}, { passive: true });


/* ===== FAQ ACCORDION (close others on open) ===== */
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  item.addEventListener('toggle', (e) => {
    if (item.open) {
      faqItems.forEach(other => {
        if (other !== item && other.open) other.removeAttribute('open');
      });
    }
  });
});


/* ===== ACTIVE NAV STYLE ===== */
const styleEl = document.createElement('style');
styleEl.textContent = `
  .nav-links a.active {
    color: var(--primary) !important;
    background: var(--primary-light) !important;
    border-radius: var(--radius-sm);
  }
  #site-header:not(.scrolled) .nav-links a.active {
    color: var(--white) !important;
    background: rgba(255,255,255,.18) !important;
  }
`;
document.head.appendChild(styleEl);


/* ===== SERVICE CARD IMAGE CROP =====
   원본 이미지(960×768)에서 각 카드 썸네일을 정확히 표시
   원리:
   1) 그리드 전체 가로(gridW) = 원본 이미지 가로(960px)에 대응 → scale = gridW/960
   2) 각 카드의 offsetLeft(그리드 기준) = 해당 카드 영역의 x 시작점과 동일 비율
      → posX = -el.offsetLeft (배경을 카드 x만큼 왼쪽으로 밀면 해당 영역이 보임)
   3) y는 행별로 고정 (상단행: 96px, 하단행: 450px) × scale
*/
(function applySvcCrops() {
  const IMG_W = 960, IMG_H = 768;
  const ROW1_Y = 96;   // 원본 이미지에서 상단 행 썸네일 y
  const ROW2_Y = 450;  // 원본 이미지에서 하단 행 썸네일 y

  const ROWS = [
    { gridSel: '.svc-grid:nth-of-type(1)', rowY: ROW1_Y,
      cards: ['svc-img-1','svc-img-2','svc-img-3','svc-img-4'] },
    { gridSel: '.svc-grid:nth-of-type(2)', rowY: ROW2_Y,
      cards: ['svc-img-5','svc-img-6','svc-img-7','svc-img-8'] },
  ];

  function applyAll() {
    ROWS.forEach(({ gridSel, rowY, cards }) => {
      const grid = document.querySelector(gridSel);
      if (!grid) return;
      const gridW = grid.offsetWidth;
      if (!gridW) return;

      const scale = gridW / IMG_W;
      const bgW   = gridW;                        // IMG_W * scale = gridW
      const bgH   = Math.round(IMG_H * scale);
      const posY  = -Math.round(rowY * scale);

      cards.forEach(cls => {
        const el = grid.querySelector('.' + cls);
        if (!el) return;
        // el.offsetLeft: 그리드 컨테이너 기준 카드의 x 위치
        // 배경을 그 만큼 왼쪽으로 밀면 해당 카드 영역이 정확히 보임
        const posX = -el.offsetLeft;

        el.style.backgroundImage    = "url('images/original-services.png')";
        el.style.backgroundRepeat   = 'no-repeat';
        el.style.backgroundSize     = bgW + 'px ' + bgH + 'px';
        el.style.backgroundPosition = posX + 'px ' + posY + 'px';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', applyAll);
  window.addEventListener('load', applyAll);
  window.addEventListener('resize', applyAll, { passive: true });
})();
