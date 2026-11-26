/**
 * Kids Study Tracker - Authentication & Profile Management
 * - Production-Grade Multi-Family Login Flow
 * - Private Family Code Entry (Zero visibility between different families)
 * - Remembers active Family Code per device/browser
 * - Register New Family Workspace (Children added strictly from Parent Dashboard)
 */

var authTab = 'signin';  // 'signin' | 'register_family'
var activeAuthFamilyCode = null;
var selectedLoginUserId = null;
var pendingRegistration = null; // { familyName, parentName, parentEmail, pin, avatar, firebaseUser }
var verificationPollingInterval = null;

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
        <p class="landing-subtitle">Kerala State &amp; CBSE Syllabus (Classes 1 - 12 / Plus Two) • Multi-Family Study &amp; Rewards Portal</p>

        <div class="auth-tabs-nav">
          <button class="auth-tab-btn ${authTab === 'signin' ? 'active' : ''}" onclick="switchAuthTab('signin')">
            🔑 Sign In
          </button>
          <button class="auth-tab-btn ${authTab === 'register_family' ? 'active' : ''}" onclick="switchAuthTab('register_family')">
            🏡 Register Family
          </button>
        </div>
      </div>

      ${pendingRegistration
        ? renderEmailVerificationPendingCard()
        : (authTab === 'signin' 
            ? renderSignInView(currentFamily, familyUsers, selectedUser) 
            : renderRegisterFamilyCard())
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
            placeholder="${isDemo ? 'e.g. KIDS101' : 'Enter Family Code'}" 
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
          • Enter <strong>KIDS101</strong> (Rajeev's Family - Arjun &amp; Ananya)<br/>
          • Enter <strong>KIDS202</strong> (Anand's Family - Rahul)
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
          <label class="form-label">Parent Email Address <span style="color: #dc2626;">*</span></label>
          <input 
            type="email" 
            name="parentEmail" 
            class="form-input" 
            placeholder="e.g. parent@gmail.com" 
            required 
          />
          <small style="color: var(--slate-500); font-size: 11px;">🔒 We'll send a one-time verification link to secure your workspace &amp; recover PIN if needed.</small>
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

        <button type="submit" id="reg-submit-btn" class="btn btn-success" style="font-size: 15px; padding: 14px; width: 100%; margin-top: 10px; font-weight: 700;">
          ✉️ Verify Email &amp; Create Family ➔
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
  const rawCode = input.value.trim();
  const cleanCode = rawCode.replace(/[-\s_]/g, '').toUpperCase();

  const fam = store.getFamilyByCode(cleanCode);
  if (fam) {
    activeAuthFamilyCode = fam.code;
    setStoredDeviceFamilyCode(fam.code);
    const users = store.getUsersForFamily(fam.id);
    selectedLoginUserId = users[0] ? users[0].id : null;
    showToast(`Welcome to ${fam.name}! 🏡`, 'success');
    renderApp();
  } else {
    showToast(`Family code "${rawCode}" not found. Please verify code or register.`, 'error');
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
  const pinInput = document.getElementById('login-pin-input');
  const enteredPin = pinInput ? pinInput.value.trim() : '';
  const user = store.getUserById(selectedLoginUserId);

  if (!user) {
    showToast('Please select a profile to sign in.', 'warning');
    return;
  }

  const expectedPin = (user.pin !== undefined && user.pin !== null) ? String(user.pin).trim() : '';
  if (!expectedPin || enteredPin === expectedPin) {
    store.setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! 👋`, 'success');
    renderApp();
  } else {
    const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');
    if (isDemo) {
      showToast(`Incorrect PIN for ${user.name}. (Demo PIN: ${expectedPin || '1234'})`, 'error');
    } else {
      showToast(`Incorrect PIN for ${user.name}. Please check and try again.`, 'error');
    }
  }
}

async function handleRegisterFamilySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const familyName = form.familyName.value.trim();
  const parentName = form.parentName.value.trim();
  const parentEmail = form.parentEmail.value.trim();
  const pin = form.pin.value.trim() || '1234';
  const avatar = form.avatar.value;

  if (!parentEmail || !parentEmail.includes('@')) {
    showToast('Please enter a valid Parent Email address.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('reg-submit-btn');
  const origBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Sending Verification Email...';
  }

  // If Firebase Auth is available, verify email before creating workspace
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try {
      const auth = firebase.auth();
      // Internal password for Firebase Auth (min 6 chars)
      const authPassword = `Kst_${pin}_${parentEmail.split('@')[0]}!`;

      let userCredential = null;
      try {
        userCredential = await auth.createUserWithEmailAndPassword(parentEmail, authPassword);
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Email already in Firebase Auth, attempt signing in
          try {
            userCredential = await auth.signInWithEmailAndPassword(parentEmail, authPassword);
          } catch (signInErr) {
            throw new Error('This email is already registered in the system. If you recently registered, please check your email for the verification link.');
          }
        } else {
          throw createErr;
        }
      }

      const user = userCredential.user;

      // If email was already verified, complete registration immediately!
      if (user.emailVerified) {
        completeFamilyRegistration({
          familyName,
          parentName,
          parentEmail,
          pin,
          avatar
        });
        return;
      }

      // Send verification link
      const actionCodeSettings = {
        url: window.location.origin + window.location.pathname,
        handleCodeInApp: false
      };
      await user.sendEmailVerification(actionCodeSettings);

      pendingRegistration = {
        familyName,
        parentName,
        parentEmail,
        pin,
        avatar,
        firebaseUser: user
      };

      showToast(`📩 Verification email sent to ${parentEmail}!`, 'success');
      startVerificationPolling();
      renderApp();
    } catch (err) {
      console.error('Registration / Email verification error:', err);
      showToast(err.message || 'Could not send verification email. Please check internet connection.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnText;
      }
    }
  } else {
    // Offline / Fallback mode
    completeFamilyRegistration({
      familyName,
      parentName,
      parentEmail,
      pin,
      avatar
    });
  }
}

function startVerificationPolling() {
  if (verificationPollingInterval) clearInterval(verificationPollingInterval);
  verificationPollingInterval = setInterval(async () => {
    if (!pendingRegistration) {
      clearInterval(verificationPollingInterval);
      verificationPollingInterval = null;
      return;
    }
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
          await user.reload();
          if (user.emailVerified) {
            if (verificationPollingInterval) {
              clearInterval(verificationPollingInterval);
              verificationPollingInterval = null;
            }
            showToast('🎉 Email verified successfully!', 'success');
            completeFamilyRegistration(pendingRegistration);
          }
        }
      }
    } catch (e) {
      console.warn('Verification polling check:', e);
    }
  }, 3500);
}

async function handleCheckEmailVerification() {
  if (!pendingRegistration) return;
  const btn = document.getElementById('check-verification-btn');
  const origText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Checking...';
  }

  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          showToast('🎉 Email verified successfully!', 'success');
          completeFamilyRegistration(pendingRegistration);
          return;
        }
      }
    }
    showToast('Email not yet verified. Please click the link received in your inbox.', 'warning');
  } catch (err) {
    console.error('Manual verification check error:', err);
    showToast('Could not verify status. Please check your connection.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }
}

async function handleResendVerificationEmail() {
  if (!pendingRegistration) return;
  const btn = document.getElementById('resend-verification-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Sending...';
  }

  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) {
        const actionCodeSettings = {
          url: window.location.origin + window.location.pathname,
          handleCodeInApp: false
        };
        await user.sendEmailVerification(actionCodeSettings);
        showToast(`📩 Fresh verification link sent to ${pendingRegistration.parentEmail}!`, 'success');
      }
    }
  } catch (err) {
    console.error('Resend email error:', err);
    showToast('Failed to resend. Please wait a moment before trying again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔄 Resend Verification Email';
    }
  }
}

function handleCancelPendingRegistration() {
  if (verificationPollingInterval) {
    clearInterval(verificationPollingInterval);
    verificationPollingInterval = null;
  }
  pendingRegistration = null;
  showToast('Registration cancelled. You can edit your details.', 'info');
  renderApp();
}

function completeFamilyRegistration(regData) {
  if (verificationPollingInterval) {
    clearInterval(verificationPollingInterval);
    verificationPollingInterval = null;
  }

  const { familyName, parentName, parentEmail, pin, avatar } = regData;

  const result = store.createFamily({
    name: familyName,
    parentName,
    parentEmail,
    pin,
    avatar
  });

  pendingRegistration = null;

  // Switch to newly created family and log in as Parent
  activeAuthFamilyCode = result.family.code;
  setStoredDeviceFamilyCode(result.family.code);
  store.setCurrentUser(result.parentUser);

  showToast(`🎉 Family "${result.family.name}" verified & created! Code: ${result.family.code}`, 'success');

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
          <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 18px;">
            Your dedicated workspace has been verified with <strong>${escapeHtml(parentEmail || '')}</strong> and initialized!
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
            📌 <strong>Next Step:</strong> You can now add your children profiles by clicking <strong>"➕ Add Child"</strong> in the top header. Share the code <strong>${result.family.code}</strong> with your kids so they can sign in from their phone, tablet, or PC without needing an email!
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

function renderEmailVerificationPendingCard() {
  if (!pendingRegistration) return '';
  const email = pendingRegistration.parentEmail;

  return `
    <div class="auth-card" style="text-align: center; max-width: 480px; margin: 0 auto;">
      <div style="font-size: 48px; margin-bottom: 8px;">📩</div>
      <h3 style="font-size: 20px; font-weight: 800; color: var(--slate-900); margin-bottom: 6px;">
        Verify Your Parent Email
      </h3>
      <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px; line-height: 1.5;">
        We have sent a verification link to your email to activate your family workspace:
      </p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 18px; display: inline-block; max-width: 100%;">
        <span style="font-size: 15px; font-weight: 800; color: #1d4ed8; word-break: break-all;">
          ✉️ ${escapeHtml(email)}
        </span>
      </div>

      <!-- Action Instructions -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 14px; text-align: left; margin-bottom: 20px; font-size: 13px; color: var(--slate-700); line-height: 1.6;">
        <div style="font-weight: 700; color: var(--slate-900); margin-bottom: 6px;">📋 Next Steps on Mobile / PC:</div>
        1. Open your <strong>Gmail / Email app</strong>.<br/>
        2. Click the verification link in the email.<br/>
        3. Switch back to this app — it will <strong>automatically detect</strong> verification!
      </div>

      <!-- Live Polling Indicator -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--slate-500); margin-bottom: 18px;">
        <span class="spinner" style="width: 14px; height: 14px; border: 2px solid #cbd5e1; border-top-color: var(--primary); border-radius: 50%; display: inline-block; animation: spin 1s linear infinite;"></span>
        <span>Checking verification status automatically...</span>
      </div>

      <!-- Primary Action: Manual Check Button -->
      <button 
        type="button" 
        id="check-verification-btn"
        class="btn btn-primary" 
        style="width: 100%; padding: 13px; font-size: 15px; font-weight: 700; margin-bottom: 10px;"
        onclick="handleCheckEmailVerification()"
      >
        ✅ I Have Verified My Email (Continue)
      </button>

      <!-- Secondary Actions: Resend & Cancel -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--slate-200); font-size: 13px;">
        <button 
          type="button" 
          id="resend-verification-btn"
          class="btn btn-outline-secondary" 
          style="padding: 6px 14px; font-size: 12px;"
          onclick="handleResendVerificationEmail()"
        >
          🔄 Resend Verification Email
        </button>
        <button 
          type="button" 
          class="btn btn-outline-secondary" 
          style="padding: 6px 14px; font-size: 12px; color: var(--slate-600);"
          onclick="handleCancelPendingRegistration()"
        >
          ✏️ Edit Details / Cancel
        </button>
      </div>
    </div>
  `;
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
      <div class="modal-card" style="max-width: 440px; text-align: center; border-top: 4px solid #ef4444;">
        <div class="modal-header" style="justify-content: center; position: relative; margin-bottom: 8px;">
          <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px; font-size: 20px;">
            🛡️ Platform Super Admin
          </h3>
          <button class="modal-close" style="position: absolute; right: 0;" onclick="closeModal('super-admin-login-modal')">✕</button>
        </div>

        <p style="font-size: 13.5px; color: var(--text-muted); margin: 4px 0 18px; line-height: 1.45;">
          Enter your authorized administrator credentials to manage platform workspaces, support tickets, and system settings.
        </p>

        <form onsubmit="handleSuperAdminLoginSubmit(event)" id="super-admin-login-form">
          <div class="form-group" style="margin-bottom: 14px; text-align: left;">
            <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px; color: var(--slate-700);">
              Admin Email Address
            </label>
            <input 
              type="email" 
              id="super-admin-email-input" 
              class="form-input" 
              style="padding: 10px 14px; font-size: 14.5px;" 
              placeholder="admin@kidsstudytracker.com" 
              value="${isDemo ? 'kidsstudytracker@gmail.com' : ''}"
              required 
              autofocus 
            />
          </div>

          <div class="form-group" style="margin-bottom: 18px; text-align: left;">
            <label style="display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 5px; color: var(--slate-700);">
              Admin Password
            </label>
            <input 
              type="password" 
              id="super-admin-password-input" 
              class="form-input" 
              style="padding: 10px 14px; font-size: 14.5px;" 
              placeholder="••••••••••••" 
              value="${isDemo ? 'admin123' : ''}"
              required 
            />
            ${isDemo ? `
              <div style="margin-top: 8px; padding: 8px 12px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; color: #92400e; text-align: left; line-height: 1.4;">
                💡 <strong>Demo Quick Admin:</strong><br>
                Email: <code>kidsstudytracker@gmail.com</code><br>
                Password: <code>admin123</code>
              </div>
            ` : ''}
          </div>

          <button type="submit" id="super-admin-login-submit-btn" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 700; background: #dc2626; border-color: #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);">
            🔐 Authenticate &amp; Unlock Console
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

async function handleSuperAdminLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('super-admin-email-input');
  const passInput = document.getElementById('super-admin-password-input');
  const submitBtn = document.getElementById('super-admin-login-submit-btn');

  if (!emailInput || !passInput) return;
  const email = emailInput.value.trim().toLowerCase();
  const pass = passInput.value;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Verifying Credentials...';
  }

  try {
    const isDemo = (typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo');

    // 1. Fetch current admins from cloud Firestore platform_admins
    const admins = await store.getPlatformAdmins();
    const matched = admins.find(a => a.email.toLowerCase() === email);

    if (!matched && email !== 'kidsstudytracker@gmail.com') {
      throw new Error('Access Denied: This email is not registered as a platform administrator.');
    }

    if (matched && matched.active === false) {
      throw new Error('This admin account has been deactivated. Please contact the platform owner.');
    }

    let authSuccess = false;

    // Check Cloud Password saved in platform_admins
    if (matched && matched.password && pass === matched.password) {
      authSuccess = true;
    } else if (isDemo && pass === 'admin123') {
      // In demo mode, admin123 is accepted for convenience
      authSuccess = true;
    } else if (matched && !matched.password && (pass === 'admin123' || store.verifySuperAdminPassword(pass))) {
      // Initial migration fallback for existing primary admin before password change
      authSuccess = true;
    } else if (typeof firebase !== 'undefined' && firebase.auth) {
      // Try Firebase Auth email/pass
      try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        authSuccess = true;
      } catch (authErr) {
        // Fall through
      }
    }

    if (!authSuccess) {
      throw new Error('Authentication failed: Invalid admin email or password.');
    }

    const adminProfile = matched ? {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role || 'Super Admin'
    } : {
      id: 'primary_owner',
      email: email,
      name: email.split('@')[0],
      role: 'Super Admin'
    };

    closeModal('super-admin-login-modal');
    store.setSuperAdminSession(true, adminProfile);
    showToast(`Welcome back, ${adminProfile.name}! 🛡️`, 'success');
    renderApp();
    return;
  } catch (err) {
    showToast(err.message || 'Login failed. Please check credentials.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🔐 Authenticate & Unlock Console';
    }
  }
}
