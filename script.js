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

  // Scrollspy for navigation active state
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.menu-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href').slice(1) === current) {
        item.classList.add('active');
      }
    });
  });

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
        if (modal.style.display === 'block') {
          closeModal(modal.id);
        }
      });
    }
  });

  // Keyboard navigation for work cards (Accessibility)
  const workCards = document.querySelectorAll('.work-card');
  workCards.forEach(card => {
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const onclickStr = card.getAttribute('onclick');
        if (onclickStr) {
          const match = onclickStr.match(/openModal\('([^']+)'\)/);
          if (match && match[1]) {
            openModal(match[1]);
          }
        }
      }
    });
  });

  // Focus trap for modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const activeModal = document.querySelector('.modal[style*="display: block"]');
      if (activeModal) {
        const focusableElements = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
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
    modal.style.display = 'block';
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
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Restore focus
    if (previousFocusedElement) {
      previousFocusedElement.focus();
    }
  }
}


