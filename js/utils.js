/**
 * Kids Study & Rewards Tracker - Utilities & Core Engines
 * - Multi-Theme Engine
 * - Monday-to-Friday Study Week Engine
 * - In-App Modals & Dialogs (Confirm & Toast Notifications)
 * - Confetti Celebration
 * - Date & String Formatters
 */

// ==========================================
// 1. MULTI-THEME ENGINE
// ==========================================
const THEMES = [
  { id: 'indigo', name: 'Royal Indigo', desc: 'Twilight Navy & Violet', icon: '🌌', colors: ['#4f46e5', '#1e1b4b', '#f1f5f9'] },
  { id: 'emerald', name: 'Forest Emerald', desc: 'Calming Sage & Mint', icon: '🌿', colors: ['#059669', '#064e3b', '#f0fdf4'] },
  { id: 'sunset', name: 'Sunset Amber', desc: 'Warm Mahogany & Coral', icon: '🌅', colors: ['#ea580c', '#431407', '#fffbeb'] },
  { id: 'ocean', name: 'Oceanic Blue', desc: 'Ice Blue & Deep Cyan', icon: '🌊', colors: ['#0284c7', '#082f49', '#f0f9ff'] },
  { id: 'candy', name: 'Candy Violet', desc: 'Playful Grape & Pink', icon: '🦄', colors: ['#9333ea', '#3b0764', '#faf5ff'] },
  { id: 'midnight', name: 'Midnight Dark', desc: 'Cozy Low-Light Mode', icon: '🌙', colors: ['#818cf8', '#090d16', '#0b1120'] }
];

function getCurrentTheme() {
  return localStorage.getItem('study_tracker_theme') || 'indigo';
}

function applyTheme(themeId) {
  const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', selectedTheme.id);
  localStorage.setItem('study_tracker_theme', selectedTheme.id);

  // Update active card indicator and active tag if theme modal is currently open
  const cards = document.querySelectorAll('.theme-card');
  cards.forEach(c => {
    const isCur = c.getAttribute('data-theme-id') === selectedTheme.id;
    if (isCur) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
    const badgeSlot = c.querySelector('.theme-active-badge-slot');
    if (badgeSlot) {
      badgeSlot.innerHTML = isCur 
        ? `<span class="theme-active-tag">✓ Active</span>` 
        : `<span></span>`;
    }
  });
}

function openThemeModal() {
  const currentThemeId = getCurrentTheme();
  const modalHtml = `
    <div class="modal-overlay" id="theme-modal" onclick="closeModalOnOutsideClick(event, 'theme-modal')">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">🎨 Select Theme Palette</h3>
          <button class="modal-close" onclick="closeModal('theme-modal')">✕</button>
        </div>

        <p class="theme-modal-intro" style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 16px;">
          Choose a personalized, comfortable color theme for your Study Tracker dashboard:
        </p>

        <div class="theme-grid">
          ${THEMES.map(t => {
            const isCurrent = t.id === currentThemeId;
            return `
            <div class="theme-card ${isCurrent ? 'active' : ''}" data-theme-id="${t.id}" onclick="applyTheme('${t.id}')">
              <div class="theme-swatch-circles">
                ${t.colors.map(col => `<span class="theme-circle" style="background: ${col};"></span>`).join('')}
              </div>
              <div class="theme-card-title">${t.icon} ${t.name}</div>
              <div class="theme-card-desc">${t.desc}</div>
              <div class="theme-active-badge-slot">
                ${isCurrent ? `<span class="theme-active-tag">✓ Active</span>` : `<span></span>`}
              </div>
            </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
          <button class="btn btn-primary" style="width: auto; padding: 8px 22px;" onclick="closeModal('theme-modal')">
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  `;
  showModal(modalHtml);
}

// ==========================================
// 2. STUDY WEEK ENGINE (Monday to Friday Tracker)
// ==========================================
if (typeof getFormattedDate !== 'function') {
  function getFormattedDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
if (typeof TODAY_STR === 'undefined') {
  var TODAY_STR = getFormattedDate();
}

function getCurrentStudyWeek(refDate = new Date()) {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 is Sun, 1 is Mon ... 5 is Fri, 6 is Sat
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    monday,
    friday,
    sunday,
    mondayStr: getFormattedDate(monday),
    fridayStr: getFormattedDate(friday),
    sundayStr: getFormattedDate(sunday),
    displayLabel: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  };
}

function getChildWeeklyTaskData(childId) {
  const currentWeek = getCurrentStudyWeek();
  const allTasks = store.getTasksForChild(childId);

  // 1. Current Week Tasks (Assigned between Monday and Sunday of this week)
  const currentWeekTasks = allTasks.filter(t => t.date >= currentWeek.mondayStr && t.date <= currentWeek.sundayStr);

  // 2. Carried-Over Unfinished Tasks from previous weeks (date < this Monday and status != 'completed')
  const carriedOverTasks = allTasks.filter(t => t.date < currentWeek.mondayStr && t.status !== 'completed');

  // 3. Active Tasks for Dashboard = (Carried-over unfinished) + (Current week unfinished)
  const activeTasks = [...carriedOverTasks, ...currentWeekTasks.filter(t => t.status !== 'completed')];

  // 4. Completed Tasks for Dashboard = Completed in current study week only!
  const completedThisWeekTasks = currentWeekTasks.filter(t => t.status === 'completed');

  // 5. Dashboard All Tasks = Current week tasks + carried-over unfinished tasks
  const dashboardAllTasks = [...carriedOverTasks, ...currentWeekTasks];

  const submittedTasks = activeTasks.filter(t => t.status === 'submitted');
  const pendingTasks = activeTasks.filter(t => t.status === 'pending');

  return {
    currentWeek,
    allTasks,
    currentWeekTasks,
    carriedOverTasks,
    activeTasks,
    completedThisWeekTasks,
    dashboardAllTasks,
    submittedTasks,
    pendingTasks
  };
}

// ==========================================
// 3. HTML ESCAPING & FORMATTING HELPERS
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDisplayDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
         ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ==========================================
// 4. IN-APP MODALS & DIALOG SYSTEM
// ==========================================
function showModal(modalHtml) {
  let container = document.getElementById('modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
  }
  container.innerHTML = modalHtml;
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.remove();
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
}

function closeModalOnOutsideClick(e, modalId) {
  if (e.target && e.target.id === modalId) {
    closeModal(modalId);
  }
}

// In-App Toast Notification System
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  const icon = iconMap[type] || '✨';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  // Trigger smooth entrance
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Auto-dismiss smoothly
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 3200);
}

// Universal In-App Confirmation Modal
function showConfirmDialog({
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed?',
  icon = '❓',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm
}) {
  const modalId = 'inapp-confirm-modal';
  const modalHtml = `
    <div class="modal-overlay" id="${modalId}" onclick="closeModalOnOutsideClick(event, '${modalId}')">
      <div class="modal-card" style="max-width: 440px; text-align: center; padding: 24px 20px;">
        <div style="font-size: 38px; margin-bottom: 10px; line-height: 1;">${icon}</div>
        <h3 class="modal-title" style="margin-bottom: 8px; font-size: 18px; justify-content: center; text-align: center;">${escapeHtml(title)}</h3>
        <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.5; margin-bottom: 22px;">${escapeHtml(message)}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto; min-width: 100px; padding: 9px 18px;" onclick="closeModal('${modalId}')">
            ${escapeHtml(cancelText)}
          </button>
          <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="inapp-confirm-submit-btn" style="width: auto; min-width: 100px; padding: 9px 18px;">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    </div>
  `;
  showModal(modalHtml);

  const confirmBtn = document.getElementById('inapp-confirm-submit-btn');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      closeModal(modalId);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }
}

function openConfirmModal(opts) {
  if (!opts) return;
  return showConfirmDialog({
    title: opts.title || 'Please Confirm',
    message: opts.message || '',
    icon: opts.icon || '⚠️',
    confirmText: opts.confirmText || 'Confirm',
    cancelText: opts.cancelText || 'Cancel',
    isDanger: opts.isDanger || (opts.confirmClass && opts.confirmClass.includes('danger')) || false,
    onConfirm: opts.onConfirm
  });
}

// ==========================================
// 5. CONFETTI CELEBRATION ENGINE
// ==========================================
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360
    });
  }

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.alpha -= 0.015;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive && frame < 90) {
      frame++;
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(animate);
}

/**
 * Format Class / Grade Label (Supports Standards 1-10 and Plus One / Plus Two)
 */
function getGradeLabel(grade) {
  const g = parseInt(grade, 10);
  if (g === 11) return 'Class 11 (Plus One)';
  if (g === 12) return 'Class 12 (Plus Two)';
  return `Class ${g}`;
}
