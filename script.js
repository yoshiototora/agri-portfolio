/* ==========================================================================
   PORTFOLIO INTERACTION & ACCESSIBILITY LOGIC (UPDATED WITH A11Y & STORAGE)
   ========================================================================== */

let previousFocusedElement = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize accessibility settings from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedSize = localStorage.getItem('size') || 'normal';
  const savedFont = localStorage.getItem('font') || 'standard';

  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-size', savedSize);
  document.documentElement.setAttribute('data-font', savedFont);

  // Sync button active states
  syncAccessibilityUI(savedTheme, savedSize, savedFont);

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  window.addEventListener('resize', updateScrollSpy);
  updateScrollSpy();

  // Modal outside click listener
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  });

  // Close modals on Escape key press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (modal.classList.contains('is-open')) {
          closeModal(modal.id);
        }
      });
    }
  });




  // Focus trap for modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const activeModal = document.querySelector('.modal.is-open');
      if (activeModal) {
        const focusableElements = getFocusableElements(activeModal);
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      }
    }
  });


});

function updateScrollSpy() {
  const visibleNavItems = [...document.querySelectorAll('.menu-item')]
    .filter((item) => getComputedStyle(item).display !== 'none');

  const sections = visibleNavItems
    .map((item) => document.querySelector(item.getAttribute('href')))
    .filter(Boolean);

  let current = sections[0]?.id || '';

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 150) {
      current = section.id;
    }
  });

  document.querySelectorAll('.menu-item').forEach((item) => {
    const isVisible = getComputedStyle(item).display !== 'none';
    const isCurrent = isVisible && item.getAttribute('href').slice(1) === current;

    item.classList.toggle('active', isCurrent);

    if (isCurrent) {
      item.setAttribute('aria-current', 'location');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function getFocusableElements(container) {
  const candidates = container.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
  return [...candidates].filter((element) => {
    const isHiddenDetailsContent = element.closest('details:not([open])');
    const isDisabled = element.disabled || element.getAttribute('aria-hidden') === 'true';
    const isVisible = Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    return !isHiddenDetailsContent && !isDisabled && isVisible;
  });
}

function setPageInert(isInert) {
  document.querySelectorAll('#ud-header, .side-menu, main > section').forEach((element) => {
    element.inert = isInert;
    if (isInert) {
      element.setAttribute('inert', '');
    } else {
      element.removeAttribute('inert');
    }
  });
}

// UI Sync Helper
function syncAccessibilityUI(theme, size, font) {
  // Size buttons
  document.querySelectorAll('[id^="btn-size-"]').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const sizeBtn = document.getElementById(`btn-size-${size}`);
  if (sizeBtn) {
    sizeBtn.classList.add('active');
    sizeBtn.setAttribute('aria-pressed', 'true');
  }

  // Font buttons
  document.querySelectorAll('[id^="btn-font-"]').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const fontBtn = document.getElementById(`btn-font-${font}`);
  if (fontBtn) {
    fontBtn.classList.add('active');
    fontBtn.setAttribute('aria-pressed', 'true');
  }

  // Theme toggle icon
  const themeIcon = document.getElementById('theme-icon');
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.setAttribute('data-lucide', 'sun');
      if (themeBtn) themeBtn.setAttribute('aria-label', 'ライトモードに切り替え');
    } else {
      themeIcon.setAttribute('data-lucide', 'moon');
      if (themeBtn) themeBtn.setAttribute('aria-label', 'ダークモードに切り替え');
    }
  }
}

/* ==================== 1. ACCESSIBILITY CONTROLS ==================== */

// Change Font Size (Applied to HTML document element for rem scaling)
function changeSize(size) {
  document.documentElement.setAttribute('data-size', size);
  localStorage.setItem('size', size);
  
  // Update Active Button State
  document.querySelectorAll('[id^="btn-size-"]').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const activeBtn = document.getElementById(`btn-size-${size}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }
}

// Change Font Type (Applied to HTML document element)
function changeFont(font) {
  document.documentElement.setAttribute('data-font', font);
  localStorage.setItem('font', font);
  
  // Update Active Button State
  document.querySelectorAll('[id^="btn-font-"]').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const activeBtn = document.getElementById(`btn-font-${font}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }
}

// Toggle Theme (Light / Dark)
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update Theme Icon
  const themeIcon = document.getElementById('theme-icon');
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeIcon) {
    if (newTheme === 'dark') {
      themeIcon.setAttribute('data-lucide', 'sun');
      if (themeBtn) themeBtn.setAttribute('aria-label', 'ライトモードに切り替え');
    } else {
      themeIcon.setAttribute('data-lucide', 'moon');
      if (themeBtn) themeBtn.setAttribute('aria-label', 'ダークモードに切り替え');
    }
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==================== 2. MODAL CONTROLS ==================== */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    previousFocusedElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setPageInert(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus the close button or first focusable element
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    setPageInert(false);
    document.body.style.overflow = ''; // Restore scrolling
    
    // Restore focus
    if (previousFocusedElement) {
      previousFocusedElement.focus();
    }
  }
}


