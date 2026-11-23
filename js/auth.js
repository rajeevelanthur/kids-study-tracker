/**
 * Kids Study & Rewards Tracker - Authentication & Profile Management
 * - Production-Grade Multi-Family Login Flow
 * - Private Family Code Entry (Zero visibility between different families)
 * - Remembers active Family Code per device/browser
 * - Register New Family Workspace (Children added strictly from Parent Dashboard)
 */

var authTab = 'signin';  // 'signin' | 'register_family'
var activeAuthFamilyCode = null;
var selectedLoginUserId = null;

function getStoredDeviceFamilyCode() {
  try {
    const key = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') 
      ? 'kst_device_family_code_demo' 
      : 'kst_device_family_code_prod';
    return localStorage.getItem(key) || null;
  } catch (e) {
    return null;
  }
}

function setStoredDeviceFamilyCode(code) {
  try {
    const key = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') 
      ? 'kst_device_family_code_demo' 
      : 'kst_device_family_code_prod';
    if (code) {
      localStorage.setItem(key, code);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {}
}

function renderLandingAuthPage(container) {
  if (!activeAuthFamilyCode) {
    activeAuthFamilyCode = getStoredDeviceFamilyCode();
  }

  let currentFamily = activeAuthFamilyCode ? store.getFamilyByCode(activeAuthFamilyCode) : null;

  // If stored family is invalid, reset it
  if (!currentFamily && activeAuthFamilyCode) {
    setStoredDeviceFamilyCode(null);
    activeAuthFamilyCode = null;
  }

  const familyUsers = currentFamily ? store.getUsersForFamily(currentFamily.id) : [];

  if (!selectedLoginUserId || !familyUsers.some(u => u.id === selectedLoginUserId)) {
    selectedLoginUserId = familyUsers[0] ? familyUsers[0].id : null;
  }
  const selectedUser = store.getUserById(selectedLoginUserId) || familyUsers[0] || null;

  container.innerHTML = `
    <div class="auth-wrapper">
      ${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? `
        <div style="display: flex; justify-content: center; margin-bottom: 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 4px 12px; border-radius: 99px;">
            🧪 Showcase &amp; Staging Portal (Demo Environment)
          </span>
        </div>
      ` : ''}

      <div class="landing-hero">
        <div class="landing-icon">🎓</div>
        <h2 class="landing-title">Kids Study Tracker</h2>
        <p class="landing-subtitle">Kerala State &amp; CBSE Syllabus (Classes 1 - 10) • Multi-Family Study &amp; Rewards Portal</p>

        <div class="auth-tabs-nav">
          <button class="auth-tab-btn ${authTab === 'signin' ? 'active' : ''}" onclick="switchAuthTab('signin')">
            🔑 Sign In
          </button>
          <button class="auth-tab-btn ${authTab === 'register_family' ? 'active' : ''}" onclick="switchAuthTab('register_family')">
            🏡 Register Family
          </button>
        </div>
      </div>

      ${authTab === 'signin' 
        ? renderSignInView(currentFamily, familyUsers, selectedUser) 
        : renderRegisterFamilyCard()
      }

      <div style="margin-top: 24px; padding-top: 14px; text-align: center;">
        <button type="button" onclick="openSuperAdminLoginModal()" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--slate-400); font-weight: 600; display: inline-flex; align-items: center; gap: 5px; transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--slate-400)'">
          <span>🛡️</span> <span>Platform Super Admin</span>
        </button>
      </div>
    </div>
  `;
}

function renderSignInView(currentFamily, familyUsers, selectedUser) {
  // If no family code has been verified on this device, prompt for Family Code
  if (!currentFamily) {
    return renderFamilyCodeEntryCard();
  }

  // Once Family Code is verified, show that family's private login card
  return renderFamilyProfilesCard(currentFamily, familyUsers, selectedUser);
}

/**
 * Clean & Private Family Code Verification Screen
 * Ensures zero leakage of other families' names or data.
 */
function renderFamilyCodeEntryCard() {
  const families = store.getFamilies();
  const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');

  if (!families || families.length === 0) {
    return `
      <div class="auth-card" style="max-width: 440px; margin: 0 auto; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 8px;">🏡✨</div>
        <h3 style="font-size: 18px; font-weight: 800; color: var(--slate-900); margin-bottom: 6px;">
          Welcome to Kids Study Tracker!
        </h3>
        <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 20px; line-height: 1.5;">
          No families are registered in the cloud database yet. Create your private family workspace to start tracking studies and rewards!
        </p>

        <button type="button" class="btn btn-primary" onclick="switchAuthTab('register_family')" style="width: 100%; padding: 13px; font-size: 15px; font-weight: 700;">
          ✨ Register Your Family
        </button>

        <div style="margin-top: 18px; font-size: 12px; color: var(--slate-500);">
          ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? `${CURRENT_ENV_CONFIG.badge} (${CURRENT_ENV_CONFIG.projectId}) Connected` : '☁️ Cloud Connected'}
        </div>
      </div>
    `;
  }

  return `
    <div class="auth-card" style="max-width: 440px; margin: 0 auto; text-align: center;">
      <div style="font-size: 38px; margin-bottom: 8px;">🏡</div>
      <h3 style="font-size: 18px; font-weight: 800; color: var(--slate-900); margin-bottom: 6px;">
        Enter Your Family Code
      </h3>
      <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 20px; line-height: 1.5;">
        Please enter the code given by your parent to access your private study portal.
      </p>

      <form onsubmit="handleVerifyFamilyCode(event)">
        <div class="form-group" style="margin-bottom: 16px;">
          <input 
            type="text" 
            id="family-code-input-field" 
            class="form-input" 
            style="text-align: center; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 12px; border: 2px solid var(--primary);" 
            placeholder="${isDemo ? 'e.g. KIDS-101' : 'Enter Family Code'}" 
            required 
            autofocus 
          />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-size: 15px; font-weight: 700;">
          Continue to Family Portal ➔
        </button>
      </form>

      ${isDemo ? `
        <div style="margin-top: 20px; padding: 12px; background: #fffbeb; border-radius: var(--radius-sm); border: 1px dashed #f59e0b; font-size: 12px; color: #92400e; line-height: 1.5; text-align: left;">
          💡 <strong>Demo Codes for Testing:</strong><br/>
          • Enter <strong>KIDS-101</strong> (Rajeev's Family - Arjun &amp; Ananya)<br/>
          • Enter <strong>KIDS-202</strong> (Anand's Family - Rahul)
        </div>
      ` : ''}

      <div style="margin-top: 18px; font-size: 13px; color: var(--slate-600);">
        Don't have a family workspace yet? 
        <a href="javascript:void(0)" onclick="switchAuthTab('register_family')" style="color: var(--primary); font-weight: 700; text-decoration: none;">
          Register Here
        </a>
      </div>
    </div>
  `;
}

/**
 * Private Family Member Profiles Screen
 */
function renderFamilyProfilesCard(currentFamily, familyUsers, selectedUser) {
  return `
    <div class="auth-card">
      <!-- Verified Family Banner with Change Code Option -->
      <div class="family-info-banner" style="margin-bottom: 18px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">Family Workspace</span>
          <div style="font-size: 17px; font-weight: 800; color: #14532d;">🏡 ${escapeHtml(currentFamily.name)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="family-code-badge">${currentFamily.code}</span>
          <button 
            type="button" 
            class="btn btn-outline-primary" 
            style="padding: 4px 10px; font-size: 11px; background: #ffffff;" 
            onclick="handleChangeFamilyCode()" 
            title="Switch or enter a different Family Code"
          >
            🔄 Switch Family
          </button>
        </div>
      </div>

      <!-- Member Profile Selection -->
      <h3 style="font-size: 15px; font-weight: 700; color: var(--slate-900); margin-bottom: 6px;">
        Select Profile to Sign In
      </h3>

      ${familyUsers.length === 0 ? `
        <div style="text-align: center; padding: 24px 16px; background: var(--slate-50); border-radius: var(--radius-md); border: 1px dashed var(--slate-300); margin: 12px 0;">
          <p style="font-size: 13px; color: var(--slate-500); margin: 0;">No profiles found for this family. Please register or switch family.</p>
        </div>
      ` : `
        <div class="user-select-grid">
          ${familyUsers.map(u => `
            <div class="user-select-card ${selectedUser && u.id === selectedUser.id ? 'selected' : ''}" onclick="selectLoginUser('${u.id}')">
              <div class="user-select-avatar">${u.avatar || '👤'}</div>
              <div class="user-select-name">${escapeHtml(u.name)}</div>
              <span class="user-select-badge">${u.role === 'parent' ? '👨‍👩‍👧 Parent Admin' : `Class ${u.grade} • ${u.syllabus && u.syllabus.includes('CBSE') ? 'CBSE' : 'Kerala'}`}</span>
            </div>
          `).join('')}
        </div>
      `}

      <!-- PIN Verification -->
      ${selectedUser ? `
        <form onsubmit="handleSignInSubmit(event)">
          <h3 style="font-size: 15px; font-weight: 700; color: var(--slate-900); margin-bottom: 4px;">
            Enter 4-digit PIN for ${escapeHtml(selectedUser.name)}
          </h3>
          ${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? `
            <div style="margin-bottom: 12px;">
              <span style="font-size: 12px; color: #b45309; background: #fffbeb; padding: 4px 10px; border-radius: 6px; border: 1px dashed #f59e0b; display: inline-block;">
                💡 Demo PIN: <strong>${selectedUser.pin || '1234'}</strong>
              </span>
            </div>
          ` : `
            <p style="font-size: 12px; color: var(--slate-500); margin-bottom: 12px;">
              Enter your private 4-digit PIN to access dashboard.
            </p>
          `}

          <div class="pin-input-box">
            <input 
              type="password" 
              id="login-pin-input" 
              class="pin-display-input" 
              maxlength="4" 
              inputmode="numeric" 
              placeholder="••••" 
              value="${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? (selectedUser.pin || '') : ''}" 
              required 
              autofocus 
            />
          </div>

          <button type="submit" class="btn btn-primary" style="font-size: 16px; padding: 14px; width: 100%;">
            🚀 Sign In as ${escapeHtml(selectedUser.name)}
          </button>
        </form>
      ` : ''}

      <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--slate-200); text-align: center; font-size: 12px; color: var(--slate-500);">
        💡 Children can be added or managed anytime by signing in as Parent Admin.
      </div>
    </div>
  `;
}

/**
 * Register New Family Screen
 */
function renderRegisterFamilyCard() {
  return `
    <div class="auth-card">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 28px;">🏡</span>
        <div>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--slate-900); margin: 0;">
            Register New Family Workspace
          </h3>
          <p style="font-size: 13px; color: var(--slate-600); margin: 0;">
            Creates a private, isolated workspace with a unique Family Code.
          </p>
        </div>
      </div>

      <div style="background: var(--slate-50); border-left: 4px solid var(--primary); padding: 10px 14px; border-radius: 4px; margin: 14px 0 18px; font-size: 13px; color: var(--slate-700);">
        💡 As Parent Admin, you will manage tasks, approve completed work, and add your children's profiles inside your dashboard.
      </div>

      <form onsubmit="handleRegisterFamilySubmit(event)">
        <div class="form-group">
          <label class="form-label">Family Name</label>
          <input 
            type="text" 
            name="familyName" 
            class="form-input" 
            placeholder="e.g. Suresh's Family, The Varmas" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Parent / Admin Full Name</label>
          <input 
            type="text" 
            name="parentName" 
            class="form-input" 
            placeholder="e.g. Suresh Kumar, Deepa" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Parent Profile Avatar</label>
          <select name="avatar" class="form-select">
            <option value="👨‍👩‍👧‍👦">👨‍👩‍👧‍👦 Family / Parents</option>
            <option value="👨">👨 Father</option>
            <option value="👩">👩 Mother</option>
            <option value="👨‍🏫">👨‍🏫 Teacher / Parent</option>
            <option value="⭐">⭐ Star</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Set Parent Admin 4-digit PIN</label>
          <input 
            type="password" 
            name="pin" 
            class="form-input" 
            maxlength="4" 
            inputmode="numeric" 
            placeholder="e.g. 5678" 
            value="${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? '1234' : ''}" 
            required 
          />
          <small style="color: var(--slate-500); font-size: 11px;">This PIN secures parent controls like assigning tasks & approving completions.</small>
        </div>

        <button type="submit" class="btn btn-success" style="font-size: 16px; padding: 14px; width: 100%; margin-top: 10px;">
          🚀 Create Family & Enter Dashboard
        </button>
      </form>

      <div style="margin-top: 18px; text-align: center; font-size: 13px; color: var(--slate-600);">
        Already have a Family Code? 
        <a href="javascript:void(0)" onclick="switchAuthTab('signin')" style="color: var(--primary); font-weight: 700; text-decoration: none;">
          Sign In Here
        </a>
      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  authTab = tab;
  renderApp();
}

function handleVerifyFamilyCode(e) {
  e.preventDefault();
  const input = document.getElementById('family-code-input-field');
  if (!input) return;
  const enteredCode = input.value.trim().toUpperCase();

  const fam = store.getFamilyByCode(enteredCode);
  if (fam) {
    activeAuthFamilyCode = fam.code;
    setStoredDeviceFamilyCode(fam.code);
    const users = store.getUsersForFamily(fam.id);
    selectedLoginUserId = users[0] ? users[0].id : null;
    showToast(`Welcome to ${fam.name}! 🏡`, 'success');
    renderApp();
  } else {
    showToast(`Family code "${enteredCode}" not found. Please verify code or register.`, 'error');
  }
}

function handleChangeFamilyCode() {
  activeAuthFamilyCode = null;
  setStoredDeviceFamilyCode(null);
  selectedLoginUserId = null;
  renderApp();
}

function selectLoginUser(userId) {
  selectedLoginUserId = userId;
  renderApp();
  const pinInput = document.getElementById('login-pin-input');
  if (pinInput) pinInput.focus();
}

function handleSignInSubmit(e) {
  e.preventDefault();
  const enteredPin = document.getElementById('login-pin-input').value.trim();
  const user = store.getUserById(selectedLoginUserId);

  if (!user) {
    showToast('Please select a profile to sign in.', 'warning');
    return;
  }

  if (enteredPin === user.pin || !user.pin) {
    store.setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! 👋`, 'success');
    renderApp();
  } else {
    const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');
    if (isDemo) {
      showToast(`Incorrect PIN for ${user.name}. (Demo PIN: ${user.pin || '1234'})`, 'error');
    } else {
      showToast(`Incorrect PIN for ${user.name}. Please check and try again.`, 'error');
    }
  }
}

function handleRegisterFamilySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const familyName = form.familyName.value.trim();
  const parentName = form.parentName.value.trim();
  const pin = form.pin.value.trim() || '1234';
  const avatar = form.avatar.value;

  const result = store.createFamily({
    name: familyName,
    parentName,
    pin,
    avatar
  });

  // Switch to the newly created family and log in as Parent
  activeAuthFamilyCode = result.family.code;
  setStoredDeviceFamilyCode(result.family.code);
  store.setCurrentUser(result.parentUser);

  showToast(`🎉 Family "${result.family.name}" created with Code ${result.family.code}!`, 'success');

  // Show welcome modal informing parent of their code
  setTimeout(() => {
    openModal({
      title: '🏡 Family Workspace Ready!',
      content: `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--slate-900); margin-bottom: 8px;">
            ${escapeHtml(result.family.name)}
          </h3>
          <p style="font-size: 14px; color: var(--slate-600); margin-bottom: 18px;">
            Your dedicated workspace has been successfully initialized.
          </p>

          <div style="background: #ede9fe; border: 2px dashed #8b5cf6; border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 700; color: #6d28d9; text-transform: uppercase; margin-bottom: 4px;">
              Your Unique Family Code
            </div>
            <div style="font-size: 28px; font-weight: 900; color: #5b21b6; letter-spacing: 2px;">
              ${result.family.code}
            </div>
          </div>

          <p style="font-size: 13px; color: var(--slate-600); text-align: left; margin-bottom: 20px; line-height: 1.5;">
            📌 <strong>Next Step:</strong> You can now add your children profiles by clicking <strong>"➕ Add Child"</strong> in the top header. Share the code <strong>${result.family.code}</strong> with your kids so they can sign in from their mobile, tablet, or PC.
          </p>

          <button class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 15px;" onclick="closeModal()">
            ✨ Get Started with Parent Dashboard
          </button>
        </div>
      `,
      showCancel: false,
      confirmText: 'Done'
    });
  }, 250);

  renderApp();
}

function handleSignOut() {
  store.logout();
  selectedLoginUserId = null;
  authTab = 'signin';
  renderApp();
}

function openSuperAdminLoginModal() {
  const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');
  const modalHtml = `
    <div class="modal-overlay" id="super-admin-login-modal" onclick="closeModalOnOutsideClick(event, 'super-admin-login-modal')">
      <div class="modal-card" style="max-width: 400px; text-align: center;">
        <div class="modal-header" style="justify-content: center; position: relative;">
          <h3 class="modal-title">🛡️ Super Admin Access</h3>
          <button class="modal-close" style="position: absolute; right: 0;" onclick="closeModal('super-admin-login-modal')">✕</button>
        </div>

        <p style="font-size: 13px; color: var(--slate-600); margin: 8px 0 16px; line-height: 1.4;">
          Enter the Master Admin password to manage platform settings and data.
        </p>

        <form onsubmit="handleSuperAdminLoginSubmit(event)">
          <div class="form-group" style="margin-bottom: 16px;">
            <input 
              type="password" 
              id="super-admin-password-input" 
              class="form-input" 
              style="text-align: center; font-size: 18px; letter-spacing: 2px;" 
              placeholder="Master Password" 
              value="${isDemo ? 'admin123' : ''}"
              required 
              autofocus 
            />
            ${isDemo ? `
              <small style="font-size: 11px; color: #b45309; display: block; margin-top: 6px; font-weight: 600;">
                💡 Demo Admin Password: <strong>admin123</strong>
              </small>
            ` : ''}
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 700;">
            🔐 Unlock Admin Console
          </button>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminLoginSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('super-admin-password-input');
  if (!input) return;
  const pass = input.value.trim();

  if (store.verifySuperAdminPassword(pass)) {
    closeModal('super-admin-login-modal');
    store.setSuperAdminSession(true);
    showToast('Authenticated as Super Admin 🛡️', 'success');
    renderApp();
  } else {
    const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');
    if (isDemo) {
      showToast('Invalid Master Password! (Demo: admin123)', 'error');
    } else {
      showToast('Invalid Master Password! Please check and try again.', 'error');
    }
  }
}
