/**
 * Kids Study & Rewards Tracker - Super Admin Management Console
 * - Full visibility of all registered families and their students
 * - Edit / Modify / Delete family and student records
 * - Provision new families directly
 * - Password-protected master console
 */

var superAdminSearchQuery = '';
var superAdminActiveTab = 'families'; // 'families' | 'support'
var superAdminTicketFilter = 'all'; // 'all' | 'open' | 'resolved'

function switchSuperAdminTab(tab) {
  superAdminActiveTab = tab;
  renderApp();
}

function setSuperAdminTicketFilter(filter) {
  superAdminTicketFilter = filter;
  renderApp();
}

function renderSuperAdminView(container) {
  const families = store.getFamilies();
  const users = store.getUsers();
  const tasks = store.getTasks();
  const supportTickets = store.getSupportTickets ? store.getSupportTickets() : [];
  const openTickets = supportTickets.filter(t => t.status !== 'resolved');

  const parents = users.filter(u => u.role === 'parent');
  const children = users.filter(u => u.role === 'child');

  // Filtered families based on search query
  const cleanQ = superAdminSearchQuery.trim().toLowerCase();
  const normQ = cleanQ.replace(/[-\s_]/g, '');
  const filteredFamilies = families.filter(f => {
    if (!cleanQ) return true;
    const matchName = (f.name || '').toLowerCase().includes(cleanQ);
    const codeNorm = (f.code || '').replace(/[-\s_]/g, '').toLowerCase();
    const matchCode = (f.code || '').toLowerCase().includes(cleanQ) || (normQ && codeNorm.includes(normQ));
    const matchEmail = (f.parentEmail || '').toLowerCase().includes(cleanQ);
    return matchName || matchCode || matchEmail;
  });

  container.innerHTML = `
    <div style="min-height: 100vh; background: var(--bg-app); padding: 24px 16px;">
      <div style="max-width: 1100px; margin: 0 auto;">

        <!-- Super Admin Navigation Header -->
        <header style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #1e1b4b, #4338ca); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              🛡️
            </div>
            <div>
              <h1 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1.2;">
                Platform Super Admin Console
              </h1>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                Master Multi-Family Control &amp; Support Portal
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="openSuperAdminAddFamilyModal()" style="font-size: 13px; padding: 7px 14px;">
              ➕ Add New Family
            </button>
            <button class="btn btn-outline-primary" onclick="openSuperAdminChangePasswordModal()" style="font-size: 13px; padding: 7px 14px;" title="Change master password">
              🔑 Password
            </button>
            <button class="btn btn-outline-secondary" onclick="exportSuperAdminBackup()" style="font-size: 13px; padding: 7px 14px;" title="Export entire platform database as JSON">
              📥 Backup JSON
            </button>
            <button class="btn btn-outline-danger" onclick="handleExitSuperAdmin()" style="font-size: 13px; padding: 7px 14px;">
              🚪 Exit Admin
            </button>
          </div>
        </header>

        <!-- Main Tab Switcher Bar -->
        <div style="display: flex; gap: 10px; margin-bottom: 22px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap;">
          <button 
            type="button" 
            class="btn ${superAdminActiveTab === 'families' ? 'btn-primary' : 'btn-outline-secondary'}" 
            style="font-size: 14px; font-weight: 700; padding: 10px 20px; display: flex; align-items: center; gap: 8px;"
            onclick="switchSuperAdminTab('families')"
          >
            <span>🏡</span>
            <span>Families &amp; Workspaces</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; font-weight: 800; ${superAdminActiveTab === 'families' ? 'background: rgba(255,255,255,0.25); color: #fff;' : 'background: var(--bg-surface-alt); color: var(--text-muted);'}">
              ${families.length}
            </span>
          </button>

          <button 
            type="button" 
            class="btn ${superAdminActiveTab === 'support' ? 'btn-primary' : 'btn-outline-secondary'}" 
            style="font-size: 14px; font-weight: 700; padding: 10px 20px; display: flex; align-items: center; gap: 8px;"
            onclick="switchSuperAdminTab('support')"
          >
            <span>🎧</span>
            <span>Support Desk &amp; Inquiries</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; font-weight: 800; ${openTickets.length > 0 ? 'background: #dc2626; color: #fff;' : (superAdminActiveTab === 'support' ? 'background: rgba(255,255,255,0.25); color: #fff;' : 'background: var(--bg-surface-alt); color: var(--text-muted);')}">
              ${openTickets.length > 0 ? `${openTickets.length} New` : supportTickets.length}
            </span>
          </button>
        </div>

        <!-- Render Current Tab -->
        ${superAdminActiveTab === 'families'
          ? renderSuperAdminFamiliesTab({ families, parents, children, tasks, filteredFamilies })
          : renderSuperAdminSupportDeskTab(supportTickets, openTickets)
        }

      </div>
    </div>
  `;
}

function renderSuperAdminFamiliesTab({ families, parents, children, tasks, filteredFamilies }) {
  return `
    <!-- Metric Stat Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 32px;">🏡</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: var(--text-main); line-height: 1;">${families.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Registered Families</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 32px;">👨‍👩‍👧‍👦</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: var(--text-main); line-height: 1;">${parents.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Parent Admins</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 32px;">🧒</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: var(--text-main); line-height: 1;">${children.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Active Students</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 32px;">📋</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: var(--text-main); line-height: 1;">${tasks.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Total Tasks Logged</div>
        </div>
      </div>
    </div>

    <!-- Phase 2: Cloud Database Status & Multi-Environment Manager -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 28px;">☁️</div>
        <div>
          <div style="font-size: 14px; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <span>Google Firebase Firestore</span>
            <span style="font-size: 11px; font-weight: 700; color: ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.color : '#059669'}; background: ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.bgColor : '#ecfdf5'}; border: 1px solid ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.borderColor : '#a7f3d0'}; padding: 2px 8px; border-radius: 99px;">
              ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.badge : '🟢 Live'}
            </span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Active Project: <code>${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.projectId : 'kids-study-tracker'}</code> (${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.name : 'Production'})
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        ${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? `
          <button type="button" class="btn btn-outline-secondary" onclick="handleSuperAdminLoadDemoData()" style="font-size: 12px; padding: 7px 14px; font-weight: 600;" title="Reload sample demo families and tasks for testing">
            📦 Reset Demo Data
          </button>
        ` : ''}
        <button type="button" class="btn btn-outline-danger" onclick="handleSuperAdminWipeCloudData()" style="font-size: 12px; padding: 7px 14px; font-weight: 700;" title="Permanently wipe data from active cloud database">
          🔥 Wipe Cloud Data
        </button>
      </div>
    </div>

    <!-- Search Bar with Live Filter & Search Button -->
    <form onsubmit="handleSuperAdminSearchSubmit(event)" style="background: var(--bg-surface); padding: 10px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-sm);">
      <span style="font-size: 18px; color: var(--text-muted);">🔍</span>
      <input 
        type="text" 
        id="sa-search-input"
        class="form-input" 
        style="border: none; background: transparent; padding: 8px 4px; font-size: 14px; flex: 1; outline: none; box-shadow: none;" 
        placeholder="Search families by Name, Family Code, or Parent Email (e.g. KIDS101, Rajeev)..." 
        value="${escapeHtml(superAdminSearchQuery)}" 
        oninput="handleSuperAdminLiveSearch(this.value)" 
      />
      <button 
        type="button" 
        id="sa-search-clear-btn"
        class="btn btn-outline-secondary" 
        style="padding: 5px 10px; font-size: 12px; display: ${superAdminSearchQuery ? 'inline-block' : 'none'};" 
        onclick="handleSuperAdminClearSearch()"
      >
        ✕ Clear
      </button>
      <button type="submit" class="btn btn-primary" style="padding: 6px 16px; font-size: 13px; font-weight: 700;">
        Search
      </button>
    </form>

    <!-- Families Management List -->
    <div id="super-admin-families-list">
      ${renderSuperAdminFamiliesListHtml(filteredFamilies)}
    </div>
  `;
}

function renderSuperAdminSupportDeskTab(supportTickets, openTickets) {
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved');
  
  let displayedTickets = supportTickets;
  if (superAdminTicketFilter === 'open') {
    displayedTickets = openTickets;
  } else if (superAdminTicketFilter === 'resolved') {
    displayedTickets = resolvedTickets;
  }

  return `
    <!-- Support Helpdesk Stat Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px; border-left: 4px solid var(--primary);">
        <div style="font-size: 32px;">🎧</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: var(--text-main); line-height: 1;">${supportTickets.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Total Inquiries</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px; border-left: 4px solid #dc2626;">
        <div style="font-size: 32px;">📬</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: #dc2626; line-height: 1;">${openTickets.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Open / Needs Reply</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; align-items: center; gap: 14px; border-left: 4px solid #16a34a;">
        <div style="font-size: 32px;">✅</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: #16a34a; line-height: 1;">${resolvedTickets.length}</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Resolved Inquiries</div>
        </div>
      </div>
    </div>

    <!-- Filter Buttons Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; background: var(--bg-surface); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button 
          type="button" 
          class="btn ${superAdminTicketFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}" 
          style="padding: 6px 14px; font-size: 12px; font-weight: 700;"
          onclick="setSuperAdminTicketFilter('all')"
        >
          All Tickets (${supportTickets.length})
        </button>
        <button 
          type="button" 
          class="btn ${superAdminTicketFilter === 'open' ? 'btn-primary' : 'btn-outline-secondary'}" 
          style="padding: 6px 14px; font-size: 12px; font-weight: 700; ${superAdminTicketFilter === 'open' ? 'background: #dc2626; border-color: #dc2626; color: #fff;' : ''}"
          onclick="setSuperAdminTicketFilter('open')"
        >
          🟢 Open / Needs Reply (${openTickets.length})
        </button>
        <button 
          type="button" 
          class="btn ${superAdminTicketFilter === 'resolved' ? 'btn-primary' : 'btn-outline-secondary'}" 
          style="padding: 6px 14px; font-size: 12px; font-weight: 700; ${superAdminTicketFilter === 'resolved' ? 'background: #16a34a; border-color: #16a34a; color: #fff;' : ''}"
          onclick="setSuperAdminTicketFilter('resolved')"
        >
          ✅ Resolved (${resolvedTickets.length})
        </button>
      </div>

      <div style="font-size: 12px; color: var(--text-muted);">
        Destination Inbox: <strong>kidsstudytracker@gmail.com</strong>
      </div>
    </div>

    <!-- Support Tickets List -->
    ${displayedTickets.length === 0 ? `
      <div class="card" style="text-align: center; padding: 48px 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">📬</div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">No Tickets in this View</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">
          ${superAdminTicketFilter === 'open' ? 'Great job! There are no open support inquiries waiting for a reply.' : 'No support tickets recorded in this category.'}
        </p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${displayedTickets.map(t => `
          <div class="card" style="margin-bottom: 0; border-left: 4px solid ${t.status === 'resolved' ? '#16a34a' : '#dc2626'};">
            <!-- Ticket Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span style="font-size: 14px; font-weight: 900; color: var(--primary);">${escapeHtml(t.ticketNumber || 'TKT')}</span>
                <span class="family-code-badge" style="font-size: 12px;">${escapeHtml(t.familyCode || 'KIDS')}</span>
                <span style="font-size: 14px; font-weight: 800; color: var(--text-main);">${escapeHtml(t.familyName)}</span>
                <span style="font-size: 12px; color: var(--text-muted);">Parent: <strong>${escapeHtml(t.parentName)}</strong></span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; padding: 3px 10px; border-radius: 99px; font-weight: 700; ${t.status === 'resolved' ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #991b1b;'}">
                  ${t.status === 'resolved' ? '✅ Resolved' : '🟢 Open / Needs Reply'}
                </span>
                <a 
                  href="mailto:${escapeHtml(t.replyEmail)}?subject=Re:%20[KST%20Support%20${escapeHtml(t.ticketNumber)}]%20${encodeURIComponent(t.subject)}&body=${encodeURIComponent('\n\n--- Original Inquiry ---\nFrom: ' + t.parentName + ' (' + t.familyName + ' - ' + t.familyCode + ')\nCategory: ' + t.category + '\n\n' + t.message)}" 
                  class="btn btn-primary" 
                  style="padding: 5px 12px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;" 
                  target="_blank"
                >
                  ✉️ Reply via Gmail
                </a>
                <button 
                  class="btn btn-outline-secondary" 
                  style="padding: 5px 10px; font-size: 12px;" 
                  onclick="handleToggleTicketStatus('${t.id}')"
                  title="${t.status === 'resolved' ? 'Reopen Ticket' : 'Mark Ticket Resolved'}"
                >
                  ${t.status === 'resolved' ? '🔄 Reopen' : '✓ Resolve'}
                </button>
                <button 
                  class="btn btn-outline-danger" 
                  style="padding: 5px 10px; font-size: 12px;" 
                  onclick="handleDeleteSupportTicket('${t.id}')"
                  title="Delete Ticket Record"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Subject & Category -->
            <div style="margin-bottom: 10px;">
              <span style="font-size: 15px; font-weight: 800; color: var(--text-main);">${escapeHtml(t.subject)}</span>
              <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface-alt); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                ${escapeHtml(t.category)}
              </span>
            </div>

            <!-- Message Box -->
            <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 13px; color: var(--text-main); line-height: 1.6; white-space: pre-wrap; margin-bottom: 12px;">
              ${escapeHtml(t.message)}
            </div>

            <!-- Footer Details -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--text-muted); padding-top: 8px; border-top: 1px solid var(--border-color);">
              <div>
                Reply-To Address: <a href="mailto:${escapeHtml(t.replyEmail)}" style="color: var(--primary); font-weight: 700; text-decoration: none;">${escapeHtml(t.replyEmail)}</a>
              </div>
              <div>
                Received: <strong>${t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}</strong>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function renderSuperAdminFamiliesListHtml(familiesList) {
  if (familiesList.length === 0) {
    return `
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main);">No Families Found</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          ${superAdminSearchQuery ? `No matches found for "<strong>${escapeHtml(superAdminSearchQuery)}</strong>".` : 'No families registered in the system yet.'}
        </p>
        ${superAdminSearchQuery ? `
          <button class="btn btn-outline-primary" onclick="handleSuperAdminClearSearch()">Show All Families</button>
        ` : `
          <button class="btn btn-primary" onclick="openSuperAdminAddFamilyModal()">➕ Add New Family</button>
        `}
      </div>
    `;
  }
  return familiesList.map(f => renderSuperAdminFamilyCard(f)).join('');
}

function renderSuperAdminFamilyCard(family) {
  const familyUsers = store.getUsersForFamily(family.id);
  const parent = familyUsers.find(u => u.role === 'parent');
  const children = familyUsers.filter(u => u.role === 'child');
  const familyTasks = store.getTasks().filter(t => t.familyId === family.id);

  return `
    <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--primary);">
      <!-- Family Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid var(--border-color); margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 26px;">🏡</span>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main); margin: 0;">
                ${escapeHtml(family.name)}
              </h3>
              <span class="family-code-badge" style="font-size: 12px;">${family.code}</span>
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">
              Created: ${family.createdAt ? new Date(family.createdAt).toLocaleDateString() : 'N/A'} • Total Tasks: <strong>${familyTasks.length}</strong>
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <button class="btn btn-outline-primary" style="padding: 5px 12px; font-size: 12px;" onclick="openSuperAdminEditFamilyModal('${family.id}')" title="Edit family name or change code">
            ✏️ Edit Family
          </button>
          <button class="btn btn-outline-primary" style="padding: 5px 12px; font-size: 12px;" onclick="openSuperAdminAddChildModal('${family.id}')" title="Add student directly to this family">
            ➕ Add Student
          </button>
          <button class="btn btn-outline-danger" style="padding: 5px 12px; font-size: 12px;" onclick="handleSuperAdminDeleteFamily('${family.id}', '${escapeHtml(family.name)}')" title="Delete family and its data">
            🗑️ Delete Family
          </button>
        </div>
      </div>

      <!-- Parent Admin Row -->
      <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">${parent ? (parent.avatar || '👨‍👩‍👧‍👦') : '👤'}</span>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">
              Parent Admin: <strong>${parent ? escapeHtml(parent.name) : 'No Parent Assigned'}</strong>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>4-digit PIN: <strong style="color: var(--primary); font-family: monospace; font-size: 14px;">${parent ? (parent.pin || '1234') : 'N/A'}</strong></span>
              <span>•</span>
              <span>✉️ <strong>${escapeHtml(family.parentEmail || (parent ? parent.email : '') || 'No Email')}</strong></span>
            </div>
          </div>
        </div>

        ${parent ? `
          <button class="btn btn-outline-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="openSuperAdminEditUserModal('${parent.id}')">
            ✏️ Edit Parent PIN
          </button>
        ` : ''}
      </div>

      <!-- Students Grid / List -->
      <div>
        <div style="font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          Students in this Family (${children.length})
        </div>

        ${children.length === 0 ? `
          <div style="padding: 16px; background: var(--bg-surface-alt); border-radius: var(--radius-sm); border: 1px dashed var(--border-color); text-align: center; font-size: 13px; color: var(--text-muted);">
            No student profiles enrolled yet in this family.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            ${children.map(c => {
              const childTasks = familyTasks.filter(t => t.childId === c.id);
              return `
                <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 28px;">${c.avatar || '🧒'}</span>
                    <div>
                      <div style="font-size: 14px; font-weight: 800; color: var(--text-main);">
                        ${escapeHtml(c.name)} 
                        <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); padding: 1px 6px; border-radius: 99px;">
                          ${getGradeLabel(c.grade)} • ${c.syllabus && c.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala'}
                        </span>
                      </div>
                      <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                        PIN: <strong style="color: var(--primary); font-family: monospace;">${c.pin || '1234'}</strong> • 
                        ⭐ ${c.weeklyPoints || 0} pts • 
                        🏆 ${c.totalPoints || 0} total
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="btn btn-outline-primary" style="padding: 3px 8px; font-size: 11px;" onclick="openSuperAdminEditUserModal('${c.id}')" title="Edit name, grade, PIN, points">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-outline-danger" style="padding: 3px 8px; font-size: 11px;" onclick="handleSuperAdminDeleteUser('${c.id}', '${escapeHtml(c.name)}')" title="Delete student">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function updateSuperAdminFamiliesList() {
  const container = document.getElementById('super-admin-families-list');
  if (!container) return;
  const families = store.getFamilies();
  const cleanQ = superAdminSearchQuery.trim().toLowerCase();
  const normQ = cleanQ.replace(/[-\s_]/g, '');
  const filtered = families.filter(f => {
    if (!cleanQ) return true;
    const matchName = (f.name || '').toLowerCase().includes(cleanQ);
    const codeNorm = (f.code || '').replace(/[-\s_]/g, '').toLowerCase();
    const matchCode = (f.code || '').toLowerCase().includes(cleanQ) || (normQ && codeNorm.includes(normQ));
    const matchEmail = (f.parentEmail || '').toLowerCase().includes(cleanQ);
    return matchName || matchCode || matchEmail;
  });
  container.innerHTML = renderSuperAdminFamiliesListHtml(filtered);

  // Toggle clear button
  const clearBtn = document.getElementById('sa-search-clear-btn');
  if (clearBtn) {
    clearBtn.style.display = cleanQ ? 'inline-block' : 'none';
  }
}

function handleSuperAdminLiveSearch(query) {
  superAdminSearchQuery = query;
  updateSuperAdminFamiliesList();
}

function handleSuperAdminSearchSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('sa-search-input');
  if (input) {
    superAdminSearchQuery = input.value;
  }
  updateSuperAdminFamiliesList();
}

function handleSuperAdminClearSearch() {
  superAdminSearchQuery = '';
  const input = document.getElementById('sa-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  updateSuperAdminFamiliesList();
}

function handleSuperAdminSearch(query) {
  superAdminSearchQuery = query;
  updateSuperAdminFamiliesList();
}

function handleExitSuperAdmin() {
  store.setSuperAdminSession(false);
  showToast('Exited Super Admin Console 👋', 'info');
  renderApp();
}

// ==========================================
// SUPER ADMIN MODALS & ACTIONS
// ==========================================

// 1. Edit Family Modal
function openSuperAdminEditFamilyModal(familyId) {
  const family = store.getFamilyById(familyId);
  if (!family) return;
  const familyUsers = store.getUsersForFamily(familyId);
  const parent = familyUsers.find(u => u.role === 'parent');
  const parentEmail = family.parentEmail || (parent ? parent.email : '') || '';

  const modalHtml = `
    <div class="modal-overlay" id="sa-edit-family-modal" onclick="closeModalOnOutsideClick(event, 'sa-edit-family-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Family: ${escapeHtml(family.name)}</h3>
          <button class="modal-close" onclick="closeModal('sa-edit-family-modal')">✕</button>
        </div>

        <form onsubmit="handleSuperAdminSaveFamily(event, '${family.id}')">
          <div class="form-group">
            <label class="form-label">Family Name</label>
            <input type="text" name="name" class="form-input" value="${escapeHtml(family.name)}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Family Code (Unique 6-8 chars)</label>
            <input type="text" name="code" class="form-input" style="text-transform: uppercase; font-weight: 700; letter-spacing: 1px;" value="${family.code}" required />
            <small style="color: var(--text-muted); font-size: 11px;">Must be unique across all families (e.g. KIDS101).</small>
          </div>

          <div class="form-group">
            <label class="form-label">Parent Email Address <span style="color: #dc2626;">*</span></label>
            <input type="email" name="parentEmail" class="form-input" value="${escapeHtml(parentEmail)}" placeholder="e.g. parent@gmail.com" required />
            <small style="color: var(--text-muted); font-size: 11px;">Mandatory for customer support, communications, and PIN recovery.</small>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              💾 Save Changes
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('sa-edit-family-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminSaveFamily(e, familyId) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const code = form.code.value.trim().toUpperCase();
  const parentEmail = form.parentEmail.value.trim();

  if (!parentEmail || !parentEmail.includes('@')) {
    showToast('Please enter a valid email address.', 'warning');
    return;
  }

  // Validate unique code
  const existingWithCode = store.getFamilyByCode(code);
  if (existingWithCode && existingWithCode.id !== familyId) {
    showToast(`Family Code "${code}" is already used by another family!`, 'error');
    return;
  }

  store.updateFamily(familyId, { name, code, parentEmail });

  // Also update parent user's email if present
  const familyUsers = store.getUsersForFamily(familyId);
  const parent = familyUsers.find(u => u.role === 'parent');
  if (parent) {
    store.updateUser(parent.id, { email: parentEmail });
  }

  closeModal('sa-edit-family-modal');
  showToast(`Family details updated successfully! ✅`, 'success');
  renderApp();
}

function handleSuperAdminDeleteFamily(familyId, familyName) {
  showConfirmDialog({
    title: `Delete Family: ${familyName}?`,
    message: `Are you sure you want to permanently delete "${familyName}"? This will remove all parent accounts, student profiles, and all assigned study tasks for this family. This action cannot be undone.`,
    icon: '🗑️',
    confirmText: 'Yes, Delete Family',
    isDanger: true,
    onConfirm: () => {
      store.deleteFamily(familyId);
      showToast(`Family "${familyName}" and all related tasks were deleted.`, 'info');
      renderApp();
    }
  });
}

// 2. Edit User Modal (Parent or Student)
function openSuperAdminEditUserModal(userId) {
  const user = store.getUserById(userId);
  if (!user) return;

  const isChild = user.role === 'child';

  const modalHtml = `
    <div class="modal-overlay" id="sa-edit-user-modal" onclick="closeModalOnOutsideClick(event, 'sa-edit-user-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Profile: ${escapeHtml(user.name)} (${isChild ? 'Student' : 'Parent'})</h3>
          <button class="modal-close" onclick="closeModal('sa-edit-user-modal')">✕</button>
        </div>

        <form onsubmit="handleSuperAdminSaveUser(event, '${user.id}')">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" class="form-input" value="${escapeHtml(user.name)}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Avatar</label>
            <select name="avatar" class="form-select">
              <option value="👦" ${user.avatar === '👦' ? 'selected' : ''}>👦 Boy</option>
              <option value="👧" ${user.avatar === '👧' ? 'selected' : ''}>👧 Girl</option>
              <option value="🧒" ${user.avatar === '🧒' ? 'selected' : ''}>🧒 Student</option>
              <option value="👨‍👩‍👧‍👦" ${user.avatar === '👨‍👩‍👧‍👦' ? 'selected' : ''}>👨‍👩‍👧‍👦 Family / Parent</option>
              <option value="👨" ${user.avatar === '👨' ? 'selected' : ''}>👨 Father</option>
              <option value="👩" ${user.avatar === '👩' ? 'selected' : ''}>👩 Mother</option>
              <option value="⭐" ${user.avatar === '⭐' ? 'selected' : ''}>⭐ Star</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">4-digit PIN</label>
            <input type="text" name="pin" class="form-input" value="${user.pin || '1234'}" maxlength="4" required />
          </div>

          ${isChild ? `
            <div class="form-group">
              <label class="form-label">Class / Standard (Classes 1 to 12 / Plus Two)</label>
              <select name="grade" class="form-select" required>
                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(g => `
                  <option value="${g}" ${g === user.grade ? 'selected' : ''}>${getGradeLabel(g)}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Curriculum / Syllabus Board</label>
              <select name="syllabus" class="form-select" required>
                <option value="Kerala State Syllabus" ${(!user.syllabus || !user.syllabus.includes('CBSE')) ? 'selected' : ''}>🌴 Kerala State Syllabus</option>
                <option value="CBSE" ${(user.syllabus && user.syllabus.includes('CBSE')) ? 'selected' : ''}>🏛️ CBSE (Central Board)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Total Points / Stars</label>
              <input type="number" name="totalPoints" class="form-input" value="${user.totalPoints || 0}" min="0" required />
            </div>
          ` : ''}

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              💾 Save Profile
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('sa-edit-user-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminSaveUser(e, userId) {
  e.preventDefault();
  const form = e.target;
  const user = store.getUserById(userId);
  if (!user) return;

  const updates = {
    name: form.name.value.trim(),
    avatar: form.avatar.value,
    pin: form.pin.value.trim() || '1234'
  };

  if (user.role === 'child' && form.grade) {
    updates.grade = parseInt(form.grade.value, 10);
    updates.syllabus = form.syllabus ? form.syllabus.value : (user.syllabus || 'Kerala State Syllabus');
    updates.totalPoints = parseInt(form.totalPoints.value, 10) || 0;
  }

  store.updateUser(userId, updates);
  closeModal('sa-edit-user-modal');
  showToast(`Profile updated successfully! ✅`, 'success');
  renderApp();
}

function handleSuperAdminDeleteUser(userId, userName) {
  showConfirmDialog({
    title: `Delete Student: ${userName}?`,
    message: `Are you sure you want to permanently delete student "${userName}" and all their assigned study tasks?`,
    icon: '🗑️',
    confirmText: 'Yes, Delete Student',
    isDanger: true,
    onConfirm: () => {
      store.deleteUser(userId);
      showToast(`Student "${userName}" and their tasks were deleted.`, 'info');
      renderApp();
    }
  });
}

// 3. Add Family Directly Modal
function openSuperAdminAddFamilyModal() {
  const modalHtml = `
    <div class="modal-overlay" id="sa-add-family-modal" onclick="closeModalOnOutsideClick(event, 'sa-add-family-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">➕ Provision New Family</h3>
          <button class="modal-close" onclick="closeModal('sa-add-family-modal')">✕</button>
        </div>

        <form onsubmit="handleSuperAdminCreateFamily(event)">
          <div class="form-group">
            <label class="form-label">Family Name</label>
            <input type="text" name="familyName" class="form-input" placeholder="e.g. Menon's Family" required />
          </div>

          <div class="form-group">
            <label class="form-label">Parent / Admin Name</label>
            <input type="text" name="parentName" class="form-input" placeholder="e.g. Ramesh Menon" required />
          </div>

          <div class="form-group">
            <label class="form-label">Parent Email Address <span style="color: #dc2626;">*</span></label>
            <input type="email" name="parentEmail" class="form-input" placeholder="e.g. ramesh.parent@gmail.com" required />
            <small style="color: var(--text-muted); font-size: 11px;">Mandatory for customer support, communications, and PIN recovery.</small>
          </div>

          <div class="form-group">
            <label class="form-label">Parent 4-digit PIN</label>
            <input type="text" name="pin" class="form-input" value="${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? '1234' : ''}" placeholder="e.g. 1234" maxlength="4" required />
          </div>

          <div class="form-group">
            <label class="form-label">Parent Avatar</label>
            <select name="avatar" class="form-select">
              <option value="👨‍👩‍👧‍👦">👨‍👩‍👧‍👦 Family / Parents</option>
              <option value="👨">👨 Father</option>
              <option value="👩">👩 Mother</option>
              <option value="⭐">⭐ Star</option>
            </select>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              ✨ Create Family
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('sa-add-family-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminCreateFamily(e) {
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

  const result = store.createFamily({
    name: familyName,
    parentName,
    parentEmail,
    pin,
    avatar
  });

  closeModal('sa-add-family-modal');
  showToast(`Family "${result.family.name}" created with Code: ${result.family.code}! 🎉 (Parent: ${parentEmail})`, 'success');
  renderApp();
}

// 4. Add Child to Family Modal
function openSuperAdminAddChildModal(familyId) {
  const family = store.getFamilyById(familyId);
  if (!family) return;

  const modalHtml = `
    <div class="modal-overlay" id="sa-add-child-modal" onclick="closeModalOnOutsideClick(event, 'sa-add-child-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">➕ Add Student to ${escapeHtml(family.name)}</h3>
          <button class="modal-close" onclick="closeModal('sa-add-child-modal')">✕</button>
        </div>

        <form onsubmit="handleSuperAdminSaveChild(event, '${family.id}')">
          <div class="form-group">
            <label class="form-label">Student Name</label>
            <input type="text" name="name" class="form-input" placeholder="e.g. Diya, Sanjay" required />
          </div>

          <div class="form-group">
            <label class="form-label">Class / Standard (Classes 1 to 12 / Plus Two)</label>
            <select name="grade" class="form-select" required>
              ${[1,2,3,4,5,6,7,8,9,10,11,12].map(g => `
                <option value="${g}" ${g === 5 ? 'selected' : ''}>${getGradeLabel(g)}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Curriculum / Syllabus Board</label>
            <select name="syllabus" class="form-select" required>
              <option value="Kerala State Syllabus" selected>🌴 Kerala State Syllabus</option>
              <option value="CBSE">🏛️ CBSE (Central Board)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Student Avatar</label>
            <select name="avatar" class="form-select">
              <option value="👦">👦 Boy</option>
              <option value="👧">👧 Girl</option>
              <option value="🧒" selected>🧒 Student</option>
              <option value="⭐">⭐ Star</option>
              <option value="🚀">🚀 Rocket</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">4-digit PIN</label>
            <input type="text" name="pin" class="form-input" value="${(typeof CURRENT_ENV_KEY !== 'undefined' && CURRENT_ENV_KEY === 'demo') ? '1234' : ''}" placeholder="e.g. 1234" maxlength="4" required />
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              ✨ Add Student
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('sa-add-child-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminSaveChild(e, familyId) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const grade = parseInt(form.grade.value, 10);
  const avatar = form.avatar.value;
  const pin = form.pin.value.trim() || '1234';

  const syllabus = form.syllabus ? form.syllabus.value : 'Kerala State Syllabus';

  const newChild = {
    id: 'user_' + Date.now(),
    familyId,
    name,
    role: 'child',
    grade,
    syllabus,
    avatar,
    pin,
    weeklyPoints: 0,
    totalPoints: 0
  };

  store.addUser(newChild);
  store.saveRewardGoal(newChild.id, 'Weekend Treat & Prize 🎬🍿', 100);

  closeModal('sa-add-child-modal');
  showToast(`Student "${name}" added to family! 🧒`, 'success');
  renderApp();
}

// 5. Change Super Admin Password Modal
function openSuperAdminChangePasswordModal() {
  const modalHtml = `
    <div class="modal-overlay" id="sa-change-pass-modal" onclick="closeModalOnOutsideClick(event, 'sa-change-pass-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">🔑 Change Super Admin Password</h3>
          <button class="modal-close" onclick="closeModal('sa-change-pass-modal')">✕</button>
        </div>

        <form onsubmit="handleSuperAdminSavePassword(event)">
          <div class="form-group">
            <label class="form-label">New Master Password</label>
            <input type="password" name="newPassword" class="form-input" placeholder="Enter new master password" required />
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              💾 Save New Password
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('sa-change-pass-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.getElementById('modal-container') || document.body;
  const temp = document.createElement('div');
  temp.innerHTML = modalHtml;
  container.appendChild(temp.firstElementChild);
}

function handleSuperAdminSavePassword(e) {
  e.preventDefault();
  const form = e.target;
  const newPass = form.newPassword.value.trim();
  if (newPass.length < 4) {
    showToast('Password must be at least 4 characters long.', 'warning');
    return;
  }
  store.setSuperAdminPassword(newPass);
  closeModal('sa-change-pass-modal');
  showToast('Super Admin Password updated successfully! 🔑', 'success');
}

// 6. Platform Backup Export
function exportSuperAdminBackup() {
  const jsonStr = store.exportBackup();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KidsStudyTracker_SuperAdmin_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Full Platform Backup exported! 📥', 'success');
}

// 7. Phase 2: Wipe All Cloud Test Data for Fresh Production Launch
function handleSuperAdminWipeCloudData() {
  showConfirmDialog({
    title: 'Wipe All Cloud Test Data? 🔥',
    message: 'WARNING: This will permanently delete all families, students, tasks, and reward histories from Google Firebase Firestore and reset to a 100% fresh, clean database for real users. Are you sure you want to proceed?',
    icon: '⚠️',
    confirmText: 'Yes, Wipe Everything',
    isDanger: true,
    onConfirm: async () => {
      showToast('Wiping cloud database... please wait.', 'info');
      try {
        await store.wipeAllCloudData();
        showToast('Cloud database completely wiped! Ready for clean start. ✨', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        showToast('Error wiping cloud data: ' + e.message, 'error');
      }
    }
  });
}

// 8. Phase 2: Explicitly Load Demo Test Data if desired
function handleSuperAdminLoadDemoData() {
  showConfirmDialog({
    title: 'Load Demo Test Data? 📦',
    message: 'This will seed sample test families (Rajeev, Anand), students, tasks, and reward goals into your cloud database for testing purposes. Do you want to proceed?',
    icon: 'ℹ️',
    confirmText: 'Yes, Load Demo Data',
    isDanger: false,
    onConfirm: async () => {
      showToast('Seeding demo data into cloud... please wait.', 'info');
      try {
        await store.seedDemoData();
        showToast('Demo test data successfully loaded! 🚀', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        showToast('Error loading demo data: ' + e.message, 'error');
      }
    }
  });
}

// 9. Support Ticket Management Handlers
function handleToggleTicketStatus(ticketId) {
  const tickets = store.getSupportTickets ? store.getSupportTickets() : [];
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const newStatus = ticket.status === 'resolved' ? 'open' : 'resolved';
  store.updateSupportTicket(ticketId, { status: newStatus });
  showToast(`Ticket status changed to ${newStatus === 'resolved' ? 'Resolved ✅' : 'Open 🟢'}`, 'success');
  renderApp();
}

function handleDeleteSupportTicket(ticketId) {
  showConfirmDialog({
    title: 'Delete Support Ticket?',
    message: 'Are you sure you want to delete this support request record? This cannot be undone.',
    icon: '🗑️',
    confirmText: 'Yes, Delete',
    isDanger: true,
    onConfirm: () => {
      store.deleteSupportTicket(ticketId);
      showToast('Support ticket deleted.', 'info');
      renderApp();
    }
  });
}
