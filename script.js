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

  // Initialize Shadow Simulation at 12:00
  simulateShadow(12);
});

// UI Sync Helper
function syncAccessibilityUI(theme, size, font) {
  // Size buttons
  document.querySelectorAll('[id^="btn-size-"]').forEach(btn => btn.classList.remove('active'));
  const sizeBtn = document.getElementById(`btn-size-${size}`);
  if (sizeBtn) sizeBtn.classList.add('active');

  // Font buttons
  document.querySelectorAll('[id^="btn-font-"]').forEach(btn => btn.classList.remove('active'));
  const fontBtn = document.getElementById(`btn-font-${font}`);
  if (fontBtn) fontBtn.classList.add('active');

  // Theme toggle icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.setAttribute('data-lucide', 'sun');
    } else {
      themeIcon.setAttribute('data-lucide', 'moon');
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
  });
  const activeBtn = document.getElementById(`btn-size-${size}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// Change Font Type (Applied to HTML document element)
function changeFont(font) {
  document.documentElement.setAttribute('data-font', font);
  localStorage.setItem('font', font);
  
  // Update Active Button State
  document.querySelectorAll('[id^="btn-font-"]').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btn-font-${font}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// Toggle Theme (Light / Dark)
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update Theme Icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    if (newTheme === 'dark') {
      themeIcon.setAttribute('data-lucide', 'sun');
    } else {
      themeIcon.setAttribute('data-lucide', 'moon');
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

/* ==================== 3. VEGILOG DEMO (INTEGRATED TEMP GROWTH) ==================== */

let currentAccumulatedTemp = 120;
const targetHarvestTemp = 500;

function simulateGrowth() {
  if (currentAccumulatedTemp >= targetHarvestTemp) return;
  
  // Generate a random daily average temperature (e.g., 20 - 28 degrees)
  const addition = Math.floor(Math.random() * 9) + 20; 
  currentAccumulatedTemp += addition;
  
  if (currentAccumulatedTemp > targetHarvestTemp) {
    currentAccumulatedTemp = targetHarvestTemp;
  }
  
  // Update UI
  const tempLabel = document.getElementById('demo-temp');
  const progressBar = document.getElementById('demo-progress');
  const plantIcon = document.getElementById('demo-plant');
  const statusMsg = document.getElementById('demo-message');
  
  tempLabel.textContent = `${currentAccumulatedTemp} ℃`;
  
  // Calculate Progress Percentage
  const progressPercent = (currentAccumulatedTemp / targetHarvestTemp) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  // Update plant icon and message based on accumulated temperature
  if (currentAccumulatedTemp >= targetHarvestTemp) {
    plantIcon.textContent = '🥝'; // Harvest phase (Kiwi!)
    plantIcon.style.transform = 'scale(1.4)';
    statusMsg.innerHTML = '<span style="color:#10B981; font-weight:800;">🎉 収穫適期に到達しました！</span><br>糖度と大きさがベストな状態です。収穫しましょう！';
  } else if (currentAccumulatedTemp >= 350) {
    plantIcon.textContent = '🌿'; // Growth phase 2
    plantIcon.style.transform = 'scale(1.2)';
    statusMsg.textContent = '順順に育っています！つぼみが膨らみ始めました。';
  } else if (currentAccumulatedTemp >= 220) {
    plantIcon.textContent = '🌱'; // Growth phase 1
    plantIcon.style.transform = 'scale(1.1)';
    statusMsg.textContent = '定着し、新しい葉っぱが出てきました。水やりを忘れずに！';
  } else {
    plantIcon.textContent = '🌱';
    plantIcon.style.transform = 'scale(1)';
    statusMsg.textContent = '順調に根を張っています。';
  }
}

function resetGrowth() {
  currentAccumulatedTemp = 120;
  
  const tempLabel = document.getElementById('demo-temp');
  const progressBar = document.getElementById('demo-progress');
  const plantIcon = document.getElementById('demo-plant');
  const statusMsg = document.getElementById('demo-message');
  
  tempLabel.textContent = `${currentAccumulatedTemp} ℃`;
  progressBar.style.width = '24%';
  plantIcon.textContent = '🌱';
  plantIcon.style.transform = 'scale(1)';
  statusMsg.textContent = '苗を植えました。毎日気温が加算されます。';
}

/* ==================== 4. AGRISCAPE DEMO (SHADOW SUN SIMULATION - IMPROVED) ==================== */

function simulateShadow(hour) {
  const shadow = document.getElementById('sim-shadow');
  const timeLabel = document.getElementById('time-label');
  const statusMsg = document.getElementById('sim-message');
  const sunElement = document.getElementById('sun-element');
  
  // Crop Zones and Stats
  const zoneA = document.querySelector('.zone-left');
  const zoneB = document.querySelector('.zone-center');
  const zoneC = document.querySelector('.zone-right');
  
  const statA = document.getElementById('sun-percent-a');
  const statB = document.getElementById('sun-percent-b');
  const statC = document.getElementById('sun-percent-c');
  
  const h = parseInt(hour, 10);
  
  // 1. Calculate Sun Position (Arc)
  // Normalizing hour (6 to 18) to progress (0% to 100%)
  const progress = (h - 6) / 12; // 0 at 6am, 0.5 at 12pm, 1 at 6pm
  const leftPos = progress * 100;
  
  // Height calculation (Sine curve)
  // bottomPos will peak at 0.5 (12:00) at 35px, and start/end at -10px
  const bottomPos = -10 + Math.sin(progress * Math.PI) * 45;
  
  sunElement.style.left = `${leftPos}%`;
  sunElement.style.bottom = `${bottomPos}px`;
  
  // 2. Calculate Shadow Skew and Width
  let skew = 0;
  let shadowWidth = 0;
  let opacity = 0.4;
  let timeStr = `${h}:00`;
  let descText = '';
  
  // Direct calculations for zones sun levels
  let sunA = 100;
  let sunB = 100;
  let sunC = 100;
  
  // Reset all zone highlights
  zoneA.classList.remove('in-shadow');
  zoneB.classList.remove('in-shadow');
  zoneC.classList.remove('in-shadow');
  statA.classList.remove('shadowed');
  statB.classList.remove('shadowed');
  statC.classList.remove('shadowed');
  
  if (h === 12) {
    skew = 0;
    shadowWidth = 20; // Short shadow directly under
    opacity = 0.5;
    timeStr += ' (昼)';
    descText = '☀️ 太陽が南中。影は障害物の直下にのみ落ちるため、すべての区画に100%直射日光が当たります。成長期（トマト等）に最適。';
  } else if (h < 12) {
    // Morning: Sun is on the left, shadow is cast to the right
    const factor = (12 - h) / 6; // 1 at 6:00, 0 at 12:00
    skew = -50 * factor;
    shadowWidth = 20 + (160 * factor);
    opacity = 0.5 - (0.2 * factor);
    timeStr += ' (朝・午前)';
    
    if (h <= 8) {
      // Very early morning, long shadow casts over B and C
      sunB = 15;
      sunC = 10;
      zoneB.classList.add('in-shadow');
      zoneC.classList.add('in-shadow');
      statB.classList.add('shadowed');
      statC.classList.add('shadowed');
      descText = '🌤️ 朝日。家（左）の影が右側の「区画B・C」に長く伸び、日照が遮られます。「区画A」は日当たり良好です。';
    } else {
      // Mid-morning shadow covers only B
      sunB = 40;
      zoneB.classList.add('in-shadow');
      statB.classList.add('shadowed');
      descText = '🌤️ 午前。影がやや短くなり「区画C」は直射日光に入りましたが、「区画B」はまだ家陰に入ります。';
    }
  } else {
    // Afternoon: Sun is on the right, shadow is cast to the left
    const factor = (h - 12) / 6; // 0 at 12:00, 1 at 18:00
    skew = 50 * factor;
    shadowWidth = 20 + (160 * factor);
    opacity = 0.5 - (0.2 * factor);
    timeStr += ' (夕方・午後)';
    
    if (h >= 16) {
      // Late afternoon, long shadow casts over A and B
      sunA = 10;
      sunB = 30;
      zoneA.classList.add('in-shadow');
      zoneB.classList.add('in-shadow');
      statA.classList.add('shadowed');
      statB.classList.add('shadowed');
      descText = '🌇 夕方。西日の影響で影が左側へ長く伸び、「区画A・B」が日陰になります。暑さに弱い葉物野菜（レタスなど）の育成に適した日陰環境です。';
    } else {
      // Early afternoon shadow covers only A
      sunA = 50;
      zoneA.classList.add('in-shadow');
      statA.classList.add('shadowed');
      descText = '🌇 午後。太陽が西へ傾き始め、障害物のすぐ左側にある「区画A」が影に入り始めました。';
    }
  }
  
  // Apply changes to shadow element
  shadow.style.transform = `skewX(${skew}deg)`;
  shadow.style.width = `${shadowWidth}px`;
  shadow.style.opacity = opacity;
  
  // Update UI values
  timeLabel.textContent = timeStr;
  statusMsg.textContent = descText;
  
  statA.textContent = `${sunA}%`;
  statB.textContent = `${sunB}%`;
  statC.textContent = `${sunC}%`;
}
