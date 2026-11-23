/**
 * Kids Study & Rewards Tracker - Parent Dashboard Engine
 * - Classic Sidebar Navigation Layout (Daily Tasks, Assign Task, Detailed Reports, Weekend Prize, Curriculum & Settings)
 * - Task Creation & Editing Modals
 * - Child Profile Management Modals
 * - Kerala Syllabus Curriculum Manager (Standards 1-10)
 * - Task Categories Manager with Point Customization
 * - Parent Approval & Revision Request Workflow
 * - Deep Study Reports with Date Filters & CSV Export
 */

function getPageHeading(tab) {
  switch (tab) {
    case 'tasks': return 'Daily Tasks';
    case 'add': return 'Assign New Task';
    case 'report': return 'Detailed Reports';
    case 'reward': return 'Weekend Prize & Goals';
    case 'settings': return 'Curriculum & Categories';
    case 'help': return 'Help & User Guide';
    default: return 'Dashboard';
  }
}

function toggleMobileSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  if (typeof open === 'boolean') {
    if (open) {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    } else {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
  } else {
    sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open');
  }
}

function renderParentView(container) {
  const currentUser = store.getCurrentUser();
  const currentFamily = store.getCurrentFamily();
  const children = store.getChildren();
  let currentChild = children.find(c => c.id === activeChildId) || (children.length > 0 ? children[0] : null);
  if (currentChild) {
    activeChildId = currentChild.id;
  } else {
    activeChildId = null;
  }

  let tabContent = '';
  if (activeTab === 'tasks') {
    tabContent = renderParentTasksTab(currentChild);
  } else if (activeTab === 'add') {
    tabContent = renderParentAddTaskTab(currentChild);
  } else if (activeTab === 'report') {
    tabContent = renderParentDetailedReportsTab(currentChild);
  } else if (activeTab === 'reward') {
    tabContent = renderParentRewardsTab(currentChild);
  } else if (activeTab === 'settings') {
    tabContent = renderParentSettingsTab();
  } else if (activeTab === 'help') {
    tabContent = renderParentHelpTab();
  }

  container.innerHTML = `
    <div class="dashboard-layout">
      <!-- Mobile Backdrop -->
      <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>

      <!-- Left Sidebar Navigation -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-logo-icon">🎓</span>
          <div>
            <div class="sidebar-brand-name">Study Tracker</div>
            <div class="sidebar-brand-sub">Kerala &amp; CBSE</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-title">Navigation</div>
          
          <button class="nav-item ${activeTab === 'tasks' ? 'active' : ''}" onclick="switchTab('tasks')">
            <span class="nav-item-icon">📋</span>
            <span>Daily Tasks</span>
          </button>

          <button class="nav-item ${activeTab === 'add' ? 'active' : ''}" onclick="switchTab('add')">
            <span class="nav-item-icon">➕</span>
            <span>Assign Task</span>
          </button>

          <button class="nav-item ${activeTab === 'report' ? 'active' : ''}" onclick="switchTab('report')">
            <span class="nav-item-icon">📊</span>
            <span>Detailed Reports</span>
          </button>

          <button class="nav-item ${activeTab === 'reward' ? 'active' : ''}" onclick="switchTab('reward')">
            <span class="nav-item-icon">🏆</span>
            <span>Weekend Prize</span>
          </button>

          <div class="sidebar-section-title" style="margin-top: 14px;">Curriculum &amp; Settings</div>
          
          <button class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="switchTab('settings')">
            <span class="nav-item-icon">⚙️</span>
            <span>Curriculum &amp; Categories</span>
          </button>

          <div class="sidebar-section-title" style="margin-top: 14px;">Documentation &amp; Support</div>
          
          <button class="nav-item ${activeTab === 'help' ? 'active' : ''}" onclick="switchTab('help')">
            <span class="nav-item-icon">❓</span>
            <span>Help &amp; User Guide</span>
          </button>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="sidebar-user-info">
            <span class="sidebar-avatar">${currentUser ? (currentUser.avatar || '👨‍👩‍👧') : '👤'}</span>
            <div>
              <div class="sidebar-user-name">${currentUser ? escapeHtml(currentUser.name) : 'Parent'}</div>
              <div class="sidebar-user-role">${currentFamily ? escapeHtml(currentFamily.name) : 'Parent Admin'}</div>
            </div>
          </div>
          <button class="btn-sidebar-signout" onclick="handleSignOut()" title="Log out or switch user">
            🚪 Exit
          </button>
        </div>
      </aside>

      <!-- Main Wrapper -->
      <div class="main-wrapper">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMobileSidebar(true)" title="Open Menu">
              ☰
            </button>
            <div class="topbar-heading-group">
              <h2 class="page-heading">${getPageHeading(activeTab)}</h2>
              ${currentFamily ? `
                <div class="topbar-family-row">
                  <span class="topbar-family-name">🏡 ${escapeHtml(currentFamily.name)}</span>
                  <span class="family-code-badge">${currentFamily.code}</span>
                  ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? `
                    <span class="topbar-env-badge" style="color: ${CURRENT_ENV_CONFIG.color}; background: ${CURRENT_ENV_CONFIG.bgColor}; border: 1px solid ${CURRENT_ENV_CONFIG.borderColor};" title="Connected to ${CURRENT_ENV_CONFIG.projectId}">
                      ${CURRENT_ENV_CONFIG.badge}
                    </span>
                  ` : `
                    <span class="topbar-env-badge">☁️ Cloud Synced</span>
                  `}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="topbar-right">
            <button class="btn-theme-pill" onclick="openThemeModal()" title="Switch Color Theme">
              🎨 <span class="theme-btn-text">Theme</span>
            </button>

            <button class="btn-theme-pill ${activeTab === 'help' ? 'active' : ''}" onclick="switchTab('help')" title="Help &amp; User Guide">
              ❓ <span class="theme-btn-text">Help</span>
            </button>

            ${children.length > 0 ? `
              <div class="topbar-child-select-box">
                <span class="topbar-child-label">Child:</span>
                <select class="topbar-child-select" onchange="selectChild(this.value)">
                  ${children.map(c => `
                    <option value="${c.id}" ${c.id === (currentChild ? currentChild.id : '') ? 'selected' : ''}>
                      ${c.avatar || '🧒'} ${c.name} (Class ${c.grade})
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}

            <button class="btn btn-outline-primary btn-add-child-topbar" onclick="openAddChildModal()" title="Add a student profile">
              ➕ Add Child
            </button>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="dashboard-content">
          ${currentChild && activeTab !== 'settings' && activeTab !== 'help' ? `
            <div class="child-overview-banner">
              <div class="child-overview-left">
                <div class="child-avatar-big">${currentChild.avatar || '🧒'}</div>
                <div class="child-overview-info">
                  <div class="child-overview-name">${escapeHtml(currentChild.name)}</div>
                  <div class="child-overview-meta">Standard ${currentChild.grade} (Class ${currentChild.grade}) • ${currentChild.syllabus && currentChild.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala State Syllabus'}</div>
                </div>
              </div>
              <div class="child-overview-actions">
                <button class="btn btn-outline-primary" onclick="openEditChildModal('${currentChild.id}')" title="Edit child name, standard, PIN, avatar">
                  ✏️ Edit Profile
                </button>
                <button class="btn btn-primary" onclick="switchTab('add')">
                  ➕ Assign Task
                </button>
              </div>
            </div>
          ` : ''}

          ${tabContent}
        </main>
      </div>
    </div>
  `;
}

// Clean & Organized Task Tab (Active/Pending by default to prevent clutter)
function renderParentTasksTab(child) {
  if (!child) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🧒</div>
        <div class="empty-state-title">No child profiles found</div>
        <p>Click "Add Child" to add a student profile (Classes 1 - 10).</p>
      </div>
    `;
  }

  const taskData = getChildWeeklyTaskData(child.id);
  const { currentWeek, carriedOverTasks, activeTasks, completedThisWeekTasks, dashboardAllTasks, submittedTasks } = taskData;

  // Filter based on view mode (Active is default!)
  let displayedTasks = activeTasks;
  if (taskViewMode === 'completed') {
    displayedTasks = completedThisWeekTasks;
  } else if (taskViewMode === 'all') {
    displayedTasks = dashboardAllTasks;
  }

  return `
    <!-- Study Week Banner (Mon to Fri) -->
    <div class="study-week-banner">
      <div class="study-week-badge">
        <span class="week-icon">📅</span>
        <div>
          <span class="week-title">Current Study Week (Mon – Fri)</span>
          <span class="week-dates">${currentWeek.displayLabel}</span>
        </div>
      </div>
      <div class="week-stats-pill">
        ⭐ ${completedThisWeekTasks.length} / ${dashboardAllTasks.length} Done this week
      </div>
    </div>

    <!-- Alert Banner: Awaiting Parent Approval -->
    ${submittedTasks.length > 0 ? `
      <div style="background: #fdf4ff; border: 1.5px solid #d8b4fe; border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🔔</span>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: #6b21a8;">
              ${child.name} submitted ${submittedTasks.length} task(s) for your approval!
            </div>
            <div style="font-size: 12px; color: #7e22ce;">
              Review and approve to award their reward points.
            </div>
          </div>
        </div>
        <button class="btn btn-primary" style="width: auto; padding: 6px 12px; font-size: 12px; background: #9333ea;" onclick="setTaskViewMode('active')">
          Review Submissions
        </button>
      </div>
    ` : ''}

    <!-- Notice: Carried Over Tasks from previous weeks -->
    ${taskViewMode === 'active' && carriedOverTasks.length > 0 ? `
      <div style="background: var(--danger-light); border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚠️</span>
        <div style="font-size: 13px; color: #991b1b; font-weight: 600;">
          Notice: ${carriedOverTasks.length} unfinished task(s) carried over from previous week are still <strong>Pending</strong>!
        </div>
      </div>
    ` : ''}

    <!-- Clean Clutter-Free View Switcher Pills -->
    <div class="view-mode-bar">
      <button class="view-mode-pill ${taskViewMode === 'active' ? 'active' : ''}" onclick="setTaskViewMode('active')">
        ⚡ Active &amp; Pending (${activeTasks.length})
      </button>
      <button class="view-mode-pill ${taskViewMode === 'completed' ? 'active' : ''}" onclick="setTaskViewMode('completed')">
        ✅ This Week's Completed (${completedThisWeekTasks.length})
      </button>
      <button class="view-mode-pill ${taskViewMode === 'all' ? 'active' : ''}" onclick="setTaskViewMode('all')">
        📋 All Tasks (${dashboardAllTasks.length})
      </button>
    </div>

    ${taskViewMode === 'completed' ? `
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
        <span>ℹ️ Showing tasks completed during this study week. Older weeks' records are archived in</span>
        <button onclick="switchTab('report')" style="background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; text-decoration: underline; font-size: 12px; padding: 0;">Detailed Reports</button>.
      </div>
    ` : ''}

    ${displayedTasks.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          ${taskViewMode === 'completed' ? '🌟' : '🎉'}
        </div>
        <div class="empty-state-title">
          ${taskViewMode === 'completed' ? 'No completed tasks yet this week' : (taskViewMode === 'active' ? 'All caught up! No active pending tasks' : 'No tasks assigned for this week')}
        </div>
        <p style="font-size: 14px; color: var(--text-muted);">
          ${taskViewMode === 'active' ? 'Great job! Click "Assign Task" to schedule new study tasks for this week.' : 'Tasks completed and approved during this week will appear here.'}
        </p>
      </div>
    ` : displayedTasks.map(t => renderTaskCard(t, true)).join('')}
  `;
}

function setTaskViewMode(mode) {
  taskViewMode = mode;
  renderApp();
}

var pendingDuplicateTask = null;

function handleDuplicateTask(taskId) {
  const task = store.getTaskById(taskId);
  if (!task) return;
  pendingDuplicateTask = { ...task };
  activeChildId = task.childId;
  activeTab = 'add';
  toggleMobileSidebar(false);
  renderApp();
  showToast('Task details copied! Subject & Points pre-filled. 📋', 'info');
}

function clearDuplicateDraft() {
  pendingDuplicateTask = null;
  renderApp();
}

function renderParentAddTaskTab(child) {
  if (!child) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🧒</div>
        <div class="empty-state-title">No child profile selected</div>
        <p>Please add a student profile first by clicking "Add Child" in the top bar.</p>
      </div>
    `;
  }

  const subjects = store.getSubjectsForGrade(child.grade, child.syllabus);
  const categories = store.getCategories();

  // If there's a pending duplicate task for this child:
  const isDuplicating = pendingDuplicateTask && pendingDuplicateTask.childId === child.id;

  let defaultSubjectIdx = 0;
  if (isDuplicating && pendingDuplicateTask.subjectName) {
    const matchedIdx = subjects.findIndex(s => s.name.toLowerCase() === pendingDuplicateTask.subjectName.toLowerCase());
    if (matchedIdx !== -1) defaultSubjectIdx = matchedIdx;
  }

  let defaultCatId = categories[0] ? categories[0].id : 'homework';
  if (isDuplicating && pendingDuplicateTask.taskType) {
    defaultCatId = pendingDuplicateTask.taskType;
  }

  let defaultPoints = categories[0] ? categories[0].defaultPoints : 10;
  if (isDuplicating && pendingDuplicateTask.points) {
    defaultPoints = pendingDuplicateTask.points;
  }

  let defaultTitle = isDuplicating ? (pendingDuplicateTask.title || '') : '';

  return `
    <div class="card">
      <div class="section-head">
        <h3 class="section-title">Assign New Study Task</h3>
        <span style="font-size: 13px; color: var(--slate-600);">${escapeHtml(child.name)} (Class ${child.grade})</span>
      </div>

      ${isDuplicating ? `
        <div style="background: rgba(79, 70, 229, 0.08); border: 1px dashed var(--primary); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">📋</span>
            <span>
              <strong>Duplicating Task:</strong> Subject, Category &amp; Points pre-filled. Edit instructions and assign!
            </span>
          </div>
          <button type="button" onclick="clearDuplicateDraft()" style="background: none; border: none; color: var(--danger); font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline;">
            ✕ Clear Pre-fill
          </button>
        </div>
      ` : ''}

      <form onsubmit="handleCreateTask(event)">
        <input type="hidden" name="childId" value="${child.id}" />

        <div class="form-group">
          <label class="form-label">Task Date (Scheduled Date)</label>
          <input type="date" name="taskDate" class="form-input" value="${TODAY_STR}" required />
          <span style="font-size: 12px; color: var(--text-muted);">Tasks scheduled for Monday–Friday form the weekly study goal. If unfinished, they automatically carry over to the next week.</span>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="form-label" style="margin: 0;">Subject (Class ${child.grade} • ${child.syllabus && child.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala Syllabus'})</label>
            <a href="javascript:void(0)" onclick="switchTab('settings')" style="font-size: 12px; color: var(--primary); font-weight: 600;">
              ⚙️ Edit Subjects
            </a>
          </div>
          <select name="subjectIndex" class="form-select" required>
            ${subjects.map((s, idx) => `
              <option value="${idx}" ${idx === defaultSubjectIdx ? 'selected' : ''}>${s.icon || '📚'} ${s.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="form-label" style="margin: 0;">Task Category</label>
            <a href="javascript:void(0)" onclick="switchTab('settings')" style="font-size: 12px; color: var(--primary); font-weight: 600;">
              ⚙️ Edit Categories
            </a>
          </div>
          <select name="taskType" class="form-select" required onchange="handleTaskTypeChange(this)">
            ${categories.map(t => `
              <option value="${t.id}" data-pts="${t.defaultPoints}" ${t.id === defaultCatId ? 'selected' : ''}>${t.icon || '🏷️'} ${t.label} (Default: ${t.defaultPoints} pts)</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Task Instructions / Details</label>
          <textarea name="title" class="form-textarea" rows="3" placeholder="e.g. Read Lesson 3, complete exercise questions 1-5, or revise for unit test..." required>${escapeHtml(defaultTitle)}</textarea>
        </div>

        <!-- Editable Reward Points with prominent styling -->
        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="form-label" style="margin: 0;">Reward Points (Customizable)</label>
            <span style="font-size: 12px; color: var(--primary); font-weight: 700;">⭐ Editable Points</span>
          </div>
          <input type="number" id="task-points-input" name="points" class="form-input" value="${defaultPoints}" min="1" max="100" required />
          <span style="font-size: 12px; color: var(--slate-600);">You can set any custom points for this task. Points are awarded upon parent approval.</span>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn btn-primary">
            ✅ Assign Task
          </button>
          <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="switchTab('tasks')">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
}

// ==========================================
// ADMIN EDIT TASK MODAL (Working Resiliently)
// ==========================================
function openEditTaskModal(taskId) {
  const task = store.getTaskById(taskId);
  if (!task) {
    showToast('Task not found.', 'error');
    return;
  }
  const child = store.getUserById(task.childId) || { grade: 7 };
  const subjects = store.getSubjectsForGrade(child.grade, child.syllabus);
  const categories = store.getCategories();

  const modalHtml = `
    <div class="modal-overlay" id="edit-task-modal" onclick="closeModalOnOutsideClick(event, 'edit-task-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Active Task</h3>
          <button class="modal-close" onclick="closeModal('edit-task-modal')">✕</button>
        </div>

        <form onsubmit="handleSaveEditedTask(event, '${task.id}')">
          <div class="form-group">
            <label class="form-label">Task Date</label>
            <input type="date" name="taskDate" class="form-input" value="${task.date}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <select name="subjectIndex" class="form-select" required>
              ${subjects.map((s, idx) => `
                <option value="${idx}" ${s.name === task.subjectName ? 'selected' : ''}>${s.icon || '📚'} ${s.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Task Category</label>
            <select name="taskType" class="form-select" required onchange="handleTaskTypeChange(this, 'edit-task-points-input')">
              ${categories.map(c => `
                <option value="${c.id}" data-pts="${c.defaultPoints}" ${c.id === task.taskType ? 'selected' : ''}>${c.icon || '🏷️'} ${c.label} (Default: ${c.defaultPoints} pts)</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Task Instructions / Details</label>
            <textarea name="title" class="form-textarea" rows="3" required>${escapeHtml(task.title)}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Reward Points (Editable)</label>
            <input type="number" id="edit-task-points-input" name="points" class="form-input" value="${task.points}" min="1" max="100" required />
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary">
              💾 Save Changes
            </button>
            <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="closeModal('edit-task-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(modalHtml);
}

function handleSaveEditedTask(e, taskId) {
  e.preventDefault();
  const form = e.target;
  const task = store.getTaskById(taskId);
  if (!task) return;
  const child = store.getUserById(task.childId) || { grade: 7 };
  const subjects = store.getSubjectsForGrade(child.grade, child.syllabus);
  const categories = store.getCategories();

  const subject = subjects[parseInt(form.subjectIndex.value, 10)] || { name: task.subjectName, icon: task.subjectIcon };
  const cat = categories.find(c => c.id === form.taskType.value) || { id: task.taskType, label: task.taskTypeName };

  const updates = {
    date: form.taskDate.value,
    subjectName: subject.name,
    subjectIcon: subject.icon,
    taskType: cat.id,
    taskTypeName: cat.label,
    title: form.title.value.trim(),
    points: parseInt(form.points.value, 10) || 10
  };

  store.updateTask(taskId, updates);
  closeModal('edit-task-modal');
  showToast('Task updated successfully! ✅', 'success');
  renderApp();
}

// ==========================================
// ADMIN ADD & EDIT CHILD PROFILE MODALS
// ==========================================
function openAddChildModal() {
  const modalHtml = `
    <div class="modal-overlay" id="add-child-modal" onclick="closeModalOnOutsideClick(event, 'add-child-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">➕ Add Student Profile</h3>
          <button class="modal-close" onclick="closeModal('add-child-modal')">✕</button>
        </div>

        <form onsubmit="handleSaveNewChild(event)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" class="form-input" placeholder="e.g. Rahul, Meera" required autofocus />
          </div>

          <div class="form-group">
            <label class="form-label">Class / Standard (Classes 1 - 10)</label>
            <select name="grade" class="form-select" required>
              ${[1,2,3,4,5,6,7,8,9,10].map(g => `
                <option value="${g}" ${g === 5 ? 'selected' : ''}>Class ${g}</option>
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
            <label class="form-label">Avatar</label>
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
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('add-child-modal')">
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

function handleSaveNewChild(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const grade = parseInt(form.grade.value, 10);
  const syllabus = form.syllabus ? form.syllabus.value : 'Kerala State Syllabus';
  const avatar = form.avatar.value;
  const pin = form.pin.value.trim() || '1234';
  const cur = store.getCurrentUser();
  const familyId = cur ? cur.familyId : 'fam_101';

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
  activeChildId = newChild.id;

  closeModal('add-child-modal');
  showToast(`Student profile "${name}" (${syllabus.includes('CBSE') ? 'CBSE' : 'Kerala State'}) added! 🎉`, 'success');
  renderApp();
}

function openEditChildModal(childId) {
  const child = store.getUserById(childId);
  if (!child) {
    showToast('Child profile not found.', 'error');
    return;
  }

  const isCbse = child.syllabus && child.syllabus.includes('CBSE');

  const modalHtml = `
    <div class="modal-overlay" id="edit-child-modal" onclick="closeModalOnOutsideClick(event, 'edit-child-modal')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Profile: ${escapeHtml(child.name)}</h3>
          <button class="modal-close" onclick="closeModal('edit-child-modal')">✕</button>
        </div>

        <form onsubmit="handleSaveEditedChild(event, '${child.id}')">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" class="form-input" value="${escapeHtml(child.name)}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Class / Standard (Classes 1 - 10)</label>
            <select name="grade" class="form-select" required>
              ${[1,2,3,4,5,6,7,8,9,10].map(g => `
                <option value="${g}" ${g === child.grade ? 'selected' : ''}>Class ${g}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Curriculum / Syllabus Board</label>
            <select name="syllabus" class="form-select" required>
              <option value="Kerala State Syllabus" ${!isCbse ? 'selected' : ''}>🌴 Kerala State Syllabus</option>
              <option value="CBSE" ${isCbse ? 'selected' : ''}>🏛️ CBSE (Central Board)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Avatar</label>
            <select name="avatar" class="form-select">
              <option value="👦" ${child.avatar === '👦' ? 'selected' : ''}>👦 Boy</option>
              <option value="👧" ${child.avatar === '👧' ? 'selected' : ''}>👧 Girl</option>
              <option value="🧒" ${child.avatar === '🧒' ? 'selected' : ''}>🧒 Student</option>
              <option value="⭐" ${child.avatar === '⭐' ? 'selected' : ''}>⭐ Star</option>
              <option value="🚀" ${child.avatar === '🚀' ? 'selected' : ''}>🚀 Rocket</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">4-digit PIN</label>
            <input type="text" name="pin" class="form-input" value="${child.pin || '1234'}" maxlength="4" required />
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary">
              💾 Save Changes
            </button>
            <button type="button" class="btn btn-outline-danger" onclick="handleDeleteChildProfile('${child.id}', '${escapeHtml(child.name)}')">
              🗑️ Delete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(modalHtml);
}

function handleSaveEditedChild(e, childId) {
  e.preventDefault();
  const form = e.target;
  const updates = {
    name: form.name.value.trim(),
    grade: parseInt(form.grade.value, 10),
    syllabus: form.syllabus ? form.syllabus.value : 'Kerala State Syllabus',
    avatar: form.avatar.value,
    pin: form.pin.value.trim()
  };

  store.updateUser(childId, updates);
  closeModal('edit-child-modal');
  showToast('Profile updated successfully! ✅', 'success');
  renderApp();
}

function handleDeleteChildProfile(childId, childName) {
  showConfirmDialog({
    title: 'Delete Child Profile?',
    message: `Are you sure you want to permanently delete profile "${childName}" and all associated study tasks? This action cannot be undone.`,
    icon: '⚠️',
    confirmText: 'Delete Profile',
    isDanger: true,
    onConfirm: () => {
      store.deleteUser(childId);
      activeChildId = null;
      closeModal('edit-child-modal');
      showToast(`Profile "${childName}" was deleted.`, 'info');
      renderApp();
    }
  });
}
// HIGHLY ORGANIZED DETAILED REPORTING TAB
// ==========================================
function renderParentDetailedReportsTab(child) {
  if (!child) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-title">No child profile selected</div>
        <p>Please select or add a student profile to view academic performance reports.</p>
      </div>
    `;
  }

  const allTasks = store.getTasksForChild(child.id);
  const subjects = store.getSubjectsForGrade(child.grade, child.syllabus);

  // Apply Date Range Filter
  let filtered = allTasks.filter(t => {
    if (reportStartDate && t.date < reportStartDate) return false;
    if (reportEndDate && t.date > reportEndDate) return false;
    return true;
  });

  // Apply Status Filter
  if (reportStatusFilter === 'completed') {
    filtered = filtered.filter(t => t.status === 'completed');
  } else if (reportStatusFilter === 'submitted') {
    filtered = filtered.filter(t => t.status === 'submitted');
  } else if (reportStatusFilter === 'pending') {
    filtered = filtered.filter(t => t.status === 'pending');
  } else if (reportStatusFilter === 'overdue') {
    filtered = filtered.filter(t => t.status === 'pending' && t.date < TODAY_STR);
  }

  // Apply Subject Filter
  if (reportSubjectFilter !== 'all') {
    filtered = filtered.filter(t => t.subjectName === reportSubjectFilter);
  }

  // Calculate Metrics on filtered tasks
  const total = filtered.length;
  const completed = filtered.filter(t => t.status === 'completed').length;
  const submitted = filtered.filter(t => t.status === 'submitted').length;
  const pending = filtered.filter(t => t.status === 'pending').length;
  const overdue = filtered.filter(t => t.status === 'pending' && t.date < TODAY_STR).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pointsEarned = filtered.filter(t => t.status === 'completed').reduce((sum, t) => sum + (parseInt(t.points, 10) || 0), 0);

  return `
    <!-- Organized Report Hero Header -->
    <div class="report-hero-header">
      <div class="report-hero-top">
        <div>
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">
            Academic Performance Report
          </div>
          <h2 class="report-hero-title">${child.name}</h2>
          <div class="report-hero-sub">
            Standard ${child.grade} • ${child.syllabus || 'Kerala State Syllabus'}
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline-primary" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.4); width: auto;" onclick="exportReportsCSV('${child.id}')" title="Download Excel/CSV Spreadsheet">
            📥 Export to CSV
          </button>
          <button class="btn btn-outline-primary" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.4); width: auto;" onclick="window.print()" title="Print or save as PDF">
            🖨️ Print Report
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="stats-grid">
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: #ffffff;">${total}</div>
          <div class="stat-label" style="color: #cbd5e1;">Total Tasks</div>
        </div>
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: #34d399;">${completed}</div>
          <div class="stat-label" style="color: #cbd5e1;">Approved / Done</div>
        </div>
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: #c084fc;">${submitted}</div>
          <div class="stat-label" style="color: #cbd5e1;">Awaiting Approval</div>
        </div>
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: ${overdue > 0 ? '#f87171' : '#ffffff'};">${overdue}</div>
          <div class="stat-label" style="color: #cbd5e1;">Overdue Pending</div>
        </div>
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: #fbbf24;">${rate}%</div>
          <div class="stat-label" style="color: #cbd5e1;">Approved Rate</div>
        </div>
        <div class="stat-box" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="stat-value" style="color: #fbbf24;">⭐ ${pointsEarned}</div>
          <div class="stat-label" style="color: #cbd5e1;">Points Earned</div>
        </div>
      </div>
    </div>

    <!-- Organized Interactive Filter Card -->
    <div class="report-filters-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--slate-900);">
          🔍 Filter Report Records
        </h4>
        <button class="btn" style="width: auto; padding: 4px 10px; font-size: 12px; background: var(--slate-100); color: var(--slate-700);" onclick="resetReportFilters()">
          Reset Filters
        </button>
      </div>

      <div class="report-filters-grid">
        <!-- Date From -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">From Date:</label>
          <input type="date" class="form-input" value="${reportStartDate}" onchange="handleReportDateChange('start', this.value)" />
        </div>

        <!-- Date To -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">To Date:</label>
          <input type="date" class="form-input" value="${reportEndDate}" onchange="handleReportDateChange('end', this.value)" />
        </div>

        <!-- Status Filter -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Task Status:</label>
          <select class="form-select" onchange="handleReportStatusChange(this.value)">
            <option value="all" ${reportStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="completed" ${reportStatusFilter === 'completed' ? 'selected' : ''}>✅ Approved & Completed Only</option>
            <option value="submitted" ${reportStatusFilter === 'submitted' ? 'selected' : ''}>🔔 Awaiting Approval Only</option>
            <option value="pending" ${reportStatusFilter === 'pending' ? 'selected' : ''}>⏳ Pending (Not Submitted)</option>
            <option value="overdue" ${reportStatusFilter === 'overdue' ? 'selected' : ''}>⚠️ Overdue Only</option>
          </select>
        </div>

        <!-- Subject Filter -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Subject:</label>
          <select class="form-select" onchange="handleReportSubjectChange(this.value)">
            <option value="all" ${reportSubjectFilter === 'all' ? 'selected' : ''}>All Subjects</option>
            ${subjects.map(s => `
              <option value="${s.name}" ${reportSubjectFilter === s.name ? 'selected' : ''}>${s.icon || ''} ${s.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="preset-pills-bar">
        <span style="font-size: 12px; font-weight: 600; color: var(--text-muted); align-self: center;">Quick Presets:</span>
        <button class="preset-pill ${reportPreset === 'this_week' ? 'active' : ''}" onclick="applyReportDatePreset('this_week')">
          📅 This Study Week (Mon–Fri)
        </button>
        <button class="preset-pill ${reportPreset === 'prev_week' ? 'active' : ''}" onclick="applyReportDatePreset('prev_week')">
          ⏮️ Previous Week
        </button>
        <button class="preset-pill ${reportPreset === 'this_month' ? 'active' : ''}" onclick="applyReportDatePreset('this_month')">
          🗓️ This Month
        </button>
        <button class="preset-pill ${reportPreset === 'all_time' ? 'active' : ''}" onclick="applyReportDatePreset('all_time')">
          📚 All-Time History
        </button>
      </div>
    </div>

    <!-- Detailed Tasks Table -->
    <div class="card" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-900);">
          Itemized Task List (${filtered.length} of ${allTasks.length} tasks matching)
        </h4>
      </div>

      <div class="report-table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>Assigned Date</th>
              <th>Subject</th>
              <th>Task Instructions</th>
              <th>Category</th>
              <th>Points</th>
              <th>Status & Timeline</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding: 28px; color: var(--slate-600);">
                  No tasks found matching the selected filters.
                </td>
              </tr>
            ` : filtered.map(t => {
              const isComp = t.status === 'completed';
              const isSubmitted = t.status === 'submitted';
              const isOverdue = !isComp && !isSubmitted && t.date < TODAY_STR;
              return `
                <tr style="background: ${isComp ? '#f0fdf4' : (isSubmitted ? '#faf5ff' : (isOverdue ? '#fff5f5' : '#ffffff'))};">
                  <td style="white-space:nowrap; font-weight:700; color:var(--slate-800);">
                    ${formatDisplayDate(t.date)}
                  </td>
                  <td style="font-weight:600; white-space:nowrap;">
                    ${t.subjectIcon || '📚'} ${t.subjectName}
                  </td>
                  <td>${t.title}</td>
                  <td>
                    <span class="task-type-badge">${t.taskTypeName || t.taskType}</span>
                  </td>
                  <td>
                    <strong>⭐ ${t.points}</strong>
                  </td>
                  <td>
                    ${isComp ? `
                      <span class="badge-status completed">✓ Approved</span>
                      <div style="font-size: 11px; color: var(--success-dark); margin-top: 4px; font-weight:600;">
                        Approved on: ${formatDisplayDateTime(t.completedAt)}
                      </div>
                    ` : (
                      isSubmitted ? `
                        <span class="badge-status submitted">🔔 Awaiting Approval</span>
                        <div style="font-size: 11px; color: #6b21a8; margin-top: 4px; font-weight:600;">
                          Submitted on: ${formatDisplayDateTime(t.submittedAt)}
                        </div>
                      ` : (
                        isOverdue ? `
                          <span class="badge-status overdue">⚠️ Overdue</span>
                          <div style="font-size: 11px; color: var(--danger); margin-top: 4px; font-weight:600;">
                            Pending since ${formatDisplayDate(t.date)}
                          </div>
                        ` : `
                          <span class="badge-status pending-today">⏳ Pending Today</span>
                        `
                      )
                    )}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleReportDateChange(type, val) {
  if (type === 'start') reportStartDate = val;
  if (type === 'end') reportEndDate = val;
  reportPreset = 'custom';
  renderApp();
}

function handleReportStatusChange(val) {
  reportStatusFilter = val;
  renderApp();
}

function handleReportSubjectChange(val) {
  reportSubjectFilter = val;
  renderApp();
}

function applyReportDatePreset(preset) {
  reportPreset = preset;
  const currentWeek = getCurrentStudyWeek();

  if (preset === 'all_time') {
    reportStartDate = '';
    reportEndDate = '';
  } else if (preset === 'this_week') {
    reportStartDate = currentWeek.mondayStr;
    reportEndDate = currentWeek.fridayStr;
  } else if (preset === 'prev_week') {
    const prevMon = new Date(currentWeek.monday);
    prevMon.setDate(currentWeek.monday.getDate() - 7);
    const prevFri = new Date(prevMon);
    prevFri.setDate(prevMon.getDate() + 4);
    reportStartDate = getFormattedDate(prevMon);
    reportEndDate = getFormattedDate(prevFri);
  } else if (preset === 'this_month') {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    reportStartDate = getFormattedDate(firstDay);
    reportEndDate = TODAY_STR;
  }

  renderApp();
}

function resetReportFilters() {
  reportStartDate = '';
  reportEndDate = '';
  reportStatusFilter = 'all';
  reportSubjectFilter = 'all';
  reportPreset = 'all_time';
  renderApp();
}

function exportReportsCSV(childId) {
  const child = store.getUserById(childId);
  if (!child) return;
  const allTasks = store.getTasksForChild(child.id);

  let filtered = allTasks.filter(t => {
    if (reportStartDate && t.date < reportStartDate) return false;
    if (reportEndDate && t.date > reportEndDate) return false;
    return true;
  });
  if (reportStatusFilter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
  else if (reportStatusFilter === 'submitted') filtered = filtered.filter(t => t.status === 'submitted');
  else if (reportStatusFilter === 'pending') filtered = filtered.filter(t => t.status === 'pending');
  else if (reportStatusFilter === 'overdue') filtered = filtered.filter(t => t.status === 'pending' && t.date < TODAY_STR);
  if (reportSubjectFilter !== 'all') filtered = filtered.filter(t => t.subjectName === reportSubjectFilter);

  const headers = ['Task Date', 'Subject', 'Category', 'Task Title', 'Points', 'Status', 'Submitted At', 'Approved At'];
  const rows = filtered.map(t => [
    t.date,
    `"${(t.subjectName || '').replace(/"/g, '""')}"`,
    `"${(t.taskTypeName || t.taskType || '').replace(/"/g, '""')}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.points || 10,
    t.status,
    t.submittedAt || '',
    t.completedAt || ''
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Study_Report_${child.name}_Class_${child.grade}_${TODAY_STR}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Academic report exported to CSV! 📥', 'success');
}

// ==========================================
// SETTINGS TAB: SUBJECTS & CATEGORIES MANAGEMENT
// ==========================================
function changeSettingsSyllabus(syllabusType) {
  selectedSettingsSyllabus = syllabusType;
  renderApp();
}

function renderParentSettingsTab() {
  const currentFamily = store.getCurrentFamily();
  const isCbse = selectedSettingsSyllabus === 'cbse';
  const boardName = isCbse ? 'CBSE (Central Board)' : 'Kerala State Syllabus';
  const subjects = store.getSubjectsForGrade(selectedSettingsGrade, selectedSettingsSyllabus);
  const categories = store.getCategories();

  return `
    <!-- Family Workspace Info Banner -->
    <div class="card settings-family-card" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-color: #c4b5fd; margin-bottom: 20px;">
      <div class="settings-family-banner">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.5px;">Family Workspace Details</div>
          <h3 style="font-size: 18px; font-weight: 800; color: #4c1d95; margin: 2px 0 6px;">
            🏡 ${currentFamily ? escapeHtml(currentFamily.name) : "Family Workspace"}
          </h3>
          <p style="font-size: 13px; color: #5b21b6; margin: 0;">
            Share this Family Code with your kids so they can sign in from their phone, tablet, or browser.
          </p>
        </div>
        <div class="settings-family-code-box">
          <span style="font-size: 11px; font-weight: 700; color: #6d28d9; display: block;">FAMILY CODE</span>
          <span style="font-size: 22px; font-weight: 900; color: #5b21b6; letter-spacing: 1.5px;">${currentFamily ? currentFamily.code : 'KIDS101'}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">
        <h3 class="section-title">⚙️ Admin Curriculum & Category Settings</h3>
      </div>
      <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px;">
        As Parent Admin, you can customize subjects for both Kerala State Syllabus and CBSE (Classes 1 to 10), as well as task categories and default points.
      </p>

      <!-- Section 1: Subjects by Board & Grade -->
      <div class="settings-section">
        <!-- Board Selection Pills -->
        <div class="settings-board-row">
          <div class="settings-board-col">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Select Curriculum Board</span>
            <div class="settings-board-pills">
              <button 
                type="button" 
                class="family-pill-btn ${!isCbse ? 'active' : ''}" 
                onclick="changeSettingsSyllabus('kerala')"
              >
                🌴 Kerala State Syllabus
              </button>
              <button 
                type="button" 
                class="family-pill-btn ${isCbse ? 'active' : ''}" 
                onclick="changeSettingsSyllabus('cbse')"
              >
                🏛️ CBSE (Central Board)
              </button>
            </div>
          </div>

          <div class="settings-grade-col">
            <label style="font-size: 13px; font-weight: 600;">Select Grade:</label>
            <select class="form-select settings-grade-select" onchange="changeSettingsGrade(this.value)">
              ${[1,2,3,4,5,6,7,8,9,10].map(g => `
                <option value="${g}" ${g === selectedSettingsGrade ? 'selected' : ''}>Class ${g}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="settings-active-catalog-banner">
          <span>Active Catalog: <strong>${boardName} • Class ${selectedSettingsGrade}</strong></span>
          <span style="font-weight: 700; color: var(--primary);">${subjects.length} Subjects</span>
        </div>

        <div class="item-list-table-wrapper">
          <table class="item-list-table">
            <thead>
              <tr>
                <th style="width: 50px;">Icon</th>
                <th>Subject Name</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(s => `
                <tr>
                  <td style="font-size: 20px;">${s.icon || '📚'}</td>
                  <td style="font-weight: 600; color: var(--slate-900);">${escapeHtml(s.name)}</td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn" style="width:auto; padding:4px 8px; font-size:12px; background:var(--slate-200); color:var(--slate-800);" onclick="openEditSubjectModal(${selectedSettingsGrade}, '${s.id}', '${selectedSettingsSyllabus}')">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-outline-danger" onclick="handleDeleteSubject(${selectedSettingsGrade}, '${s.id}', '${selectedSettingsSyllabus}')">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="settings-actions-row">
          <button class="btn btn-primary" onclick="openAddSubjectModal(${selectedSettingsGrade}, '${selectedSettingsSyllabus}')">
            ➕ Add Subject to ${isCbse ? 'CBSE' : 'Kerala'} Class ${selectedSettingsGrade}
          </button>
          <button class="btn btn-secondary-slate" onclick="handleResetSubjectsForGrade(${selectedSettingsGrade}, '${selectedSettingsSyllabus}')">
            🔄 Reset ${isCbse ? 'CBSE' : 'Kerala'} Class ${selectedSettingsGrade} to Defaults
          </button>
        </div>
      </div>

      <!-- Section 2: Task Categories Manager -->
      <div class="settings-section">
        <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-900); margin-bottom: 8px;">
          2. Task Categories & Default Points (Editable)
        </h4>

        <div class="item-list-table-wrapper">
          <table class="item-list-table">
            <thead>
              <tr>
                <th style="width: 50px;">Icon</th>
                <th>Category Name</th>
                <th>Default Points</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(c => `
                <tr>
                  <td style="font-size: 20px;">${c.icon || '🏷️'}</td>
                  <td style="font-weight: 600; color: var(--slate-900);">${c.label}</td>
                  <td><strong>⭐ ${c.defaultPoints} pts</strong></td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn" style="width:auto; padding:4px 8px; font-size:12px; background:var(--slate-200); color:var(--slate-800);" onclick="openEditCategoryModal('${c.id}')">
                      ✏️ Edit Points & Name
                    </button>
                    <button class="btn btn-outline-danger" onclick="handleDeleteCategory('${c.id}')">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="settings-actions-row">
          <button class="btn btn-primary" onclick="openAddCategoryModal()">
            ➕ Add New Category
          </button>
          <button class="btn btn-secondary-slate" onclick="handleResetCategories()">
            🔄 Reset Categories
          </button>
        </div>
      </div>

      <!-- Section 3: Data Backup & Migration (Export / Import) -->
      <div class="settings-section">
        <h4 style="font-size: 15px; font-weight: 700; color: var(--slate-900); margin-bottom: 6px;">
          3. Local Backup &amp; Device Portability (Cloud-Ready)
        </h4>
        <p style="font-size: 12.5px; color: var(--slate-600); margin-bottom: 14px;">
          Download a complete backup file (.json) to safeguard student tasks, reward points, and custom curriculum. You can import this file to restore or sync data onto other laptops or mobile devices.
        </p>

        <div class="settings-actions-row">
          <button class="btn btn-primary" onclick="handleExportBackup()">
            💾 Download Backup (.json)
          </button>
          
          <label class="btn btn-secondary-slate" style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0;">
            📂 Restore from Backup File
            <input type="file" accept=".json" onchange="handleImportBackup(event)" style="display: none;" />
          </label>
        </div>
      </div>
    </div>
  `;
}

function handleExportBackup() {
  const jsonStr = store.exportBackup();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KidsStudyTracker_Backup_${TODAY_STR}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Data backup downloaded successfully! 💾', 'success');
}

function handleImportBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      showConfirmDialog({
        title: 'Restore Data Backup?',
        message: 'This will restore tasks, student profiles, and custom syllabus from the selected backup file. Continue?',
        icon: '⚠️',
        confirmText: 'Restore Backup',
        isDanger: true,
        onConfirm: () => {
          store.importBackup(data);
          showToast('Data restored successfully! ✅', 'success');
          renderApp();
        }
      });
    } catch (err) {
      showToast('Invalid backup file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function changeSettingsGrade(val) {
  selectedSettingsGrade = parseInt(val, 10);
  renderApp();
}

// ==========================================
// IN-APP SUBJECT MODALS & HANDLERS
// ==========================================
function openAddSubjectModal(grade, syllabusType = 'kerala') {
  const isCbse = syllabusType === 'cbse';
  const boardName = isCbse ? 'CBSE' : 'Kerala State';
  const modalHtml = `
    <div class="modal-overlay" id="add-subject-modal" onclick="closeModalOnOutsideClick(event, 'add-subject-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">➕ Add Subject (${boardName} Class ${grade})</h3>
          <button class="modal-close" onclick="closeModal('add-subject-modal')">✕</button>
        </div>
        <form onsubmit="handleSaveNewSubject(event, ${grade}, '${syllabusType}')">
          <div class="form-group">
            <label class="form-label">Subject Name</label>
            <input type="text" name="name" class="form-input" placeholder="e.g. Sanskrit, Coding, Environmental Studies" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Icon / Emoji</label>
            <input type="text" name="icon" class="form-input" value="📚" style="font-size: 18px;" required>
            <small style="color: var(--text-muted); font-size: 11px;">Pick an emoji icon like 📖, 🔬, 📐, ✍️, 🎨, 💻</small>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;">
            <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="closeModal('add-subject-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="width: auto;">
              ➕ Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  showModal(modalHtml);
}

function handleSaveNewSubject(e, grade, syllabusType = 'kerala') {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const icon = form.icon.value.trim() || '📚';
  if (!name) return;

  store.addSubject(grade, {
    id: 'sub_' + Date.now(),
    name,
    icon,
    color: '#4f46e5'
  }, syllabusType);
  closeModal('add-subject-modal');
  showToast(`Subject "${name}" added to Class ${grade}! ✅`);
  renderApp();
}

function openEditSubjectModal(grade, subjectId, syllabusType = 'kerala') {
  const subjects = store.getSubjectsForGrade(grade, syllabusType);
  const subj = subjects.find(s => s.id === subjectId);
  if (!subj) return;

  const modalHtml = `
    <div class="modal-overlay" id="edit-subject-modal" onclick="closeModalOnOutsideClick(event, 'edit-subject-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Subject: ${escapeHtml(subj.name)}</h3>
          <button class="modal-close" onclick="closeModal('edit-subject-modal')">✕</button>
        </div>
        <form onsubmit="handleSaveEditedSubject(event, ${grade}, '${subj.id}', '${syllabusType}')">
          <div class="form-group">
            <label class="form-label">Subject Name (Class ${grade})</label>
            <input type="text" name="name" class="form-input" value="${escapeHtml(subj.name)}" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Icon / Emoji</label>
            <input type="text" name="icon" class="form-input" value="${escapeHtml(subj.icon || '📚')}" style="font-size: 18px;" required>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;">
            <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="closeModal('edit-subject-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="width: auto;">
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  showModal(modalHtml);
}

function handleSaveEditedSubject(e, grade, subjectId, syllabusType = 'kerala') {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const icon = form.icon.value.trim() || '📚';
  if (!name) return;

  store.updateSubject(grade, subjectId, { name, icon }, syllabusType);
  closeModal('edit-subject-modal');
  showToast(`Subject "${name}" updated! ✅`);
  renderApp();
}

function handleDeleteSubject(grade, subjectId, syllabusType = 'kerala') {
  const subjects = store.getSubjectsForGrade(grade, syllabusType);
  const subj = subjects.find(s => s.id === subjectId);
  const name = subj ? subj.name : 'this subject';

  showConfirmDialog({
    title: 'Delete Subject?',
    message: `Are you sure you want to remove "${name}" from Class ${grade} curriculum?`,
    icon: '🗑️',
    confirmText: 'Delete Subject',
    isDanger: true,
    onConfirm: () => {
      store.deleteSubject(grade, subjectId, syllabusType);
      showToast(`Subject "${name}" deleted from Class ${grade}.`, 'info');
      renderApp();
    }
  });
}

function handleResetSubjectsForGrade(grade, syllabusType = 'kerala') {
  const isCbse = syllabusType === 'cbse';
  const boardName = isCbse ? 'CBSE' : 'Kerala State Syllabus';
  showConfirmDialog({
    title: `Reset ${boardName} Class ${grade} Subjects?`,
    message: `This will reset all subjects for Class ${grade} back to the official default ${boardName} catalog. Custom added subjects for this class will be cleared.`,
    icon: '🔄',
    confirmText: 'Reset to Defaults',
    isDanger: true,
    onConfirm: () => {
      store.resetSubjectsForGrade(grade, syllabusType);
      showToast(`Class ${grade} (${boardName}) subjects reset to defaults! 🔄`);
      renderApp();
    }
  });
}

// ==========================================
// IN-APP CATEGORY MODALS & HANDLERS
// ==========================================
function openAddCategoryModal() {
  const modalHtml = `
    <div class="modal-overlay" id="add-category-modal" onclick="closeModalOnOutsideClick(event, 'add-category-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">➕ Add Task Category</h3>
          <button class="modal-close" onclick="closeModal('add-category-modal')">✕</button>
        </div>
        <form onsubmit="handleSaveNewCategory(event)">
          <div class="form-group">
            <label class="form-label">Category Name</label>
            <input type="text" name="label" class="form-input" placeholder="e.g. Handwriting, Project, Spell Bee, Quran" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Default Reward Points</label>
            <input type="number" name="points" class="form-input" min="1" max="100" value="10" required>
            <small style="color: var(--text-muted); font-size: 11px;">Points awarded for completing tasks in this category</small>
          </div>
          <div class="form-group">
            <label class="form-label">Icon / Emoji</label>
            <input type="text" name="icon" class="form-input" value="🏷️" style="font-size: 18px;" required>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;">
            <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="closeModal('add-category-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="width: auto;">
              ➕ Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  showModal(modalHtml);
}

function handleSaveNewCategory(e) {
  e.preventDefault();
  const form = e.target;
  const label = form.label.value.trim();
  const defaultPoints = parseInt(form.points.value, 10) || 10;
  const icon = form.icon.value.trim() || '🏷️';
  if (!label) return;

  store.addCategory({
    id: 'cat_' + Date.now(),
    label,
    icon,
    defaultPoints
  });
  closeModal('add-category-modal');
  showToast(`Category "${label}" added! ✅`);
  renderApp();
}

function openEditCategoryModal(id) {
  const categories = store.getCategories();
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  const modalHtml = `
    <div class="modal-overlay" id="edit-category-modal" onclick="closeModalOnOutsideClick(event, 'edit-category-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">✏️ Edit Category: ${escapeHtml(cat.label)}</h3>
          <button class="modal-close" onclick="closeModal('edit-category-modal')">✕</button>
        </div>
        <form onsubmit="handleSaveEditedCategory(event, '${cat.id}')">
          <div class="form-group">
            <label class="form-label">Category Name</label>
            <input type="text" name="label" class="form-input" value="${escapeHtml(cat.label)}" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Default Reward Points</label>
            <input type="number" name="points" class="form-input" min="1" max="100" value="${cat.defaultPoints || 10}" required>
            <small style="color: var(--text-muted); font-size: 11px;">Points awarded for completing tasks in this category</small>
          </div>
          <div class="form-group">
            <label class="form-label">Icon / Emoji</label>
            <input type="text" name="icon" class="form-input" value="${escapeHtml(cat.icon || '🏷️')}" style="font-size: 18px;" required>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;">
            <button type="button" class="btn" style="background: var(--slate-200); color: var(--slate-700); width: auto;" onclick="closeModal('edit-category-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="width: auto;">
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  showModal(modalHtml);
}

function handleSaveEditedCategory(e, id) {
  e.preventDefault();
  const form = e.target;
  const label = form.label.value.trim();
  const defaultPoints = parseInt(form.points.value, 10) || 10;
  const icon = form.icon.value.trim() || '🏷️';
  if (!label) return;

  store.updateCategory(id, { label, defaultPoints, icon });
  closeModal('edit-category-modal');
  showToast(`Category "${label}" updated! ✅`);
  renderApp();
}

function handleDeleteCategory(id) {
  const categories = store.getCategories();
  const cat = categories.find(c => c.id === id);
  const label = cat ? cat.label : 'this category';

  showConfirmDialog({
    title: 'Delete Category?',
    message: `Are you sure you want to delete category "${label}"?`,
    icon: '🗑️',
    confirmText: 'Delete Category',
    isDanger: true,
    onConfirm: () => {
      store.deleteCategory(id);
      showToast(`Category "${label}" deleted.`, 'info');
      renderApp();
    }
  });
}

function handleResetCategories() {
  showConfirmDialog({
    title: 'Reset Categories?',
    message: 'Reset all task categories back to the default catalog (Homework, Project, Revision, Reading, Extracurricular)?',
    icon: '🔄',
    confirmText: 'Reset to Defaults',
    isDanger: true,
    onConfirm: () => {
      store.resetCategories();
      showToast('Task categories reset to defaults.', 'info');
      renderApp();
    }
  });
}

function renderParentRewardsTab(child) {
  if (!child) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <div class="empty-state-title">No child profile selected</div>
        <p>Please select or add a student profile to configure weekend reward goals.</p>
      </div>
    `;
  }

  const currentReward = store.getRewardForChild(child.id);
  const rewardHistory = store.getRewardHistoryForChild(child.id);
  const weeklyPts = child.weeklyPoints || 0;
  const targetPts = currentReward ? currentReward.targetPoints : 100;
  const progressPct = Math.min(100, Math.round((weeklyPts / targetPts) * 100));
  const isAchieved = weeklyPts >= targetPts;

  return `
    <div class="card" style="border-top: 4px solid var(--primary);">
      <div class="section-head">
        <h3 class="section-title">Weekend Prize & Goals</h3>
        <span style="font-size: 13px; font-weight: 600; color: var(--primary);">${escapeHtml(child.name)}</span>
      </div>

      <div style="background: var(--slate-100); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 14px; font-weight: 700; color: var(--slate-800);">Active Weekend Goal:</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="task-points-pill">⭐ ${weeklyPts} / ${targetPts} Points</span>
            <button type="button" class="btn btn-outline-danger" onclick="handleResetWeeklyStars('${child.id}', '${escapeHtml(child.name)}')" style="font-size: 11px; padding: 4px 9px; border-radius: var(--radius-sm);" title="Reset weekly points to 0 at any time">
              🔄 Reset Stars
            </button>
          </div>
        </div>
        <p style="font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 10px;">
          ${currentReward ? escapeHtml(currentReward.prizeName) : 'No reward set yet'}
        </p>
        <div class="progress-bar-container" style="background: var(--slate-300);">
          <div class="progress-bar-fill" style="width: ${progressPct}%; background: ${isAchieved ? '#10b981' : '#4f46e5'};"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-top: 4px; color: var(--slate-600);">
          <span>${progressPct}% Completed</span>
          <span>${isAchieved ? '🎯 Target Achieved!' : `${targetPts - weeklyPts} points remaining`}</span>
        </div>
      </div>

      ${isAchieved ? `
        <div style="background: var(--success-light); border: 1px solid #a7f3d0; border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 4px;">🏆🎉</div>
          <h4 style="font-size: 15px; font-weight: 700; color: #065f46;">Target Reached! Weekend Reward Earned!</h4>
          <p style="font-size: 13px; color: #047857; margin-bottom: 12px;">You can hand over the prize and reset the weekly points for next week.</p>
          <button class="btn btn-success" onclick="handleClaimReward('${child.id}')" style="width: auto; padding: 8px 18px; margin: 0 auto;">
            🎁 Mark Reward Given & Reset Week
          </button>
        </div>
      ` : ''}

      <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--slate-900);">Update Weekend Goal / Prize</h4>
      <form onsubmit="handleSaveReward(event)">
        <input type="hidden" name="childId" value="${child.id}" />

        <div class="form-group">
          <label class="form-label">Promised Weekend Reward / Prize</label>
          <input type="text" name="prizeName" class="form-input" value="${currentReward ? escapeHtml(currentReward.prizeName) : 'Weekend Ice Cream & Park Outing 🍦'}" placeholder="e.g. Favorite Dinner, New Book, Trip to Beach..." required />
        </div>

        <div class="form-group">
          <label class="form-label">Target Points for This Week</label>
          <input type="number" name="targetPoints" class="form-input" value="${targetPts}" min="20" max="500" required />
        </div>

        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
          💾 Save Weekend Reward Goal
        </button>
      </form>
    </div>

    <!-- Weekend Prize & Reward History Grid -->
    <div class="card" style="margin-top: 18px;">
      <div class="section-head" style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📜</span>
          <h3 class="section-title">Prize &amp; Reward History</h3>
        </div>
        <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
          ${rewardHistory.length} Record${rewardHistory.length === 1 ? '' : 's'}
        </span>
      </div>

      ${rewardHistory.length === 0 ? `
        <div style="text-align: center; padding: 24px 16px; background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <div style="font-size: 28px; margin-bottom: 6px;">🎁</div>
          <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">No prizes awarded yet for ${escapeHtml(child.name)}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
            When target stars are reached and you click "Mark Reward Given", awarded prizes will be recorded here!
          </div>
        </div>
      ` : `
        <div class="report-table-wrapper" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow-x: auto;">
          <table class="report-table" style="min-width: 580px; width: 100%; margin: 0;">
            <thead>
              <tr style="background: var(--bg-surface-alt);">
                <th style="padding: 10px 14px; color: var(--text-main);">🏆 Prize Awarded</th>
                <th style="padding: 10px 14px; color: var(--text-main);">📅 Week / Date</th>
                <th style="padding: 10px 14px; color: var(--text-main); text-align: center;">⭐ Stars Reached</th>
                <th style="padding: 10px 14px; color: var(--text-main); text-align: center;">Status</th>
                <th style="padding: 10px 14px; color: var(--text-main); text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rewardHistory.map(h => {
                const dateStr = h.rewardedAt ? new Date(h.rewardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (h.weekLabel || 'Past Week');
                return `
                  <tr>
                    <td style="padding: 12px 14px; font-weight: 700; color: var(--primary);">
                      ${escapeHtml(h.prizeName || 'Weekend Reward')}
                    </td>
                    <td style="padding: 12px 14px; font-size: 12px; color: var(--text-muted);">
                      <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(h.weekLabel || 'Week Goal Completed')}</div>
                      <div style="font-size: 11px;">Awarded on ${dateStr}</div>
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                      <span class="task-points-pill" style="font-size: 12px; font-weight: 700;">
                        ⭐ ${h.pointsAchieved || h.targetPoints || 100} / ${h.targetPoints || 100}
                      </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: center;">
                      <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 99px; font-size: 11px; font-weight: 700;">
                        🎁 Handed Over
                      </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: right;">
                      <button class="btn btn-outline-danger" onclick="handleDeleteRewardHistory('${h.id}', '${escapeHtml(h.prizeName || 'Prize')}')" style="padding: 4px 8px; font-size: 11px;" title="Delete this entry">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// ==========================================

function handleTaskTypeChange(selectElem, targetInputId = 'task-points-input') {
  const selectedOption = selectElem.options[selectElem.selectedIndex];
  if (!selectedOption) return;
  const pts = selectedOption.getAttribute('data-pts');
  const pointsInput = document.getElementById(targetInputId);
  if (pointsInput && pts) {
    pointsInput.value = pts;
  }
}

function handleCreateTask(e) {
  e.preventDefault();
  const form = e.target;
  const childId = form.childId.value;
  const child = store.getUserById(childId);
  const subjects = store.getSubjectsForGrade(child.grade, child.syllabus);
  const subject = subjects[parseInt(form.subjectIndex.value, 10)] || subjects[0];
  const categories = store.getCategories();
  const taskTypeObj = categories.find(t => t.id === form.taskType.value) || categories[0];

  const newTask = {
    id: 't_' + Date.now(),
    childId: childId,
    subjectName: subject.name,
    subjectIcon: subject.icon,
    taskType: taskTypeObj.id,
    taskTypeName: taskTypeObj.label,
    title: form.title.value.trim(),
    points: parseInt(form.points.value, 10) || 10,
    date: form.taskDate.value || TODAY_STR,
    status: 'pending',
    submittedAt: null,
    completedAt: null
  };

  store.addTask(newTask);
  pendingDuplicateTask = null;
  activeTab = 'tasks';
  taskViewMode = 'active';
  showToast('Study task assigned successfully! 📋', 'success');
  renderApp();
}

function handleDeleteTask(taskId) {
  showConfirmDialog({
    title: 'Delete Task?',
    message: 'Are you sure you want to permanently delete this study task?',
    icon: '🗑️',
    confirmText: 'Delete Task',
    isDanger: true,
    onConfirm: () => {
      store.deleteTask(taskId);
      showToast('Task deleted successfully.', 'info');
      renderApp();
    }
  });
}

// ==========================================
// PARENT TASK APPROVAL MODAL & STICKERS
// ==========================================
const ENCOURAGEMENT_STICKERS = [
  { icon: '⭐', label: 'Star Student!' },
  { icon: '🚀', label: 'Super Fast!' },
  { icon: '✍️', label: 'Neat Work!' },
  { icon: '💯', label: '100% Perfect!' },
  { icon: '🧠', label: 'Brilliant!' },
  { icon: '🏆', label: 'Champion!' }
];

const QUICK_REMARK_TEMPLATES = [
  'Excellent handwriting! ⭐',
  'Super fast and focused! 🚀',
  'Very neat and accurate work! ✍️',
  'Proud of your effort! Keep it up! 🌟',
  'Great job finishing on time! 👏'
];

function handleParentApproveTask(taskId) {
  openParentApproveModal(taskId);
}

function openParentApproveModal(taskId) {
  const task = store.getTaskById(taskId);
  if (!task) return;
  const child = store.getUserById(task.childId) || { name: 'Student' };

  const modalHtml = `
    <div class="modal-overlay" id="parent-approve-modal" onclick="closeModalOnOutsideClick(event, 'parent-approve-modal')">
      <div class="modal-card" style="max-width: 520px; width: 95%;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 26px;">⭐</span>
            <div>
              <h3 class="modal-title" style="margin: 0; font-size: 17px; font-weight: 800;">Approve Task &amp; Send Sticker</h3>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">For ${escapeHtml(child.name)}</span>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal('parent-approve-modal')">✕</button>
        </div>

        <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; margin: 14px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--primary);">${escapeHtml(task.subjectName)}</span>
            <span class="task-points-pill" style="font-size: 12px; font-weight: 700;">+${task.points} Points</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">${escapeHtml(task.title)}</div>
        </div>

        <form onsubmit="handleSaveTaskApproval(event, '${task.id}')">
          <!-- 1. Choose Digital Sticker -->
          <div class="form-group">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>1. Choose a Digital Reward Sticker 🎨</span>
              <span id="selected-sticker-badge" style="font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 99px;">
                ⭐ Star Student!
              </span>
            </label>
            <input type="hidden" name="sticker" id="approve-sticker-icon" value="⭐" />
            <input type="hidden" name="stickerText" id="approve-sticker-text" value="Star Student!" />

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px;">
              ${ENCOURAGEMENT_STICKERS.map((s, idx) => `
                <div class="sticker-select-card" 
                     id="sticker-opt-${idx}"
                     onclick="selectApprovalSticker('${s.icon}', '${escapeHtml(s.label)}', ${idx})"
                     style="cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-color)'}; background: ${idx === 0 ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)'}; border-radius: var(--radius-sm); padding: 8px 6px; text-align: center; transition: all 0.15s ease;">
                  <div style="font-size: 26px; line-height: 1; margin-bottom: 4px;">${s.icon}</div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-main); line-height: 1.2;">${s.label}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 2. Encouragement Note / Remark -->
          <div class="form-group" style="margin-top: 14px;">
            <label class="form-label">
              2. Encouragement Note for ${escapeHtml(child.name)} 💬
            </label>
            <input type="text" 
                   id="approve-remark-input" 
                   name="remark" 
                   class="form-input" 
                   value="Excellent work! Proud of you! ⭐" 
                   placeholder="e.g. Excellent handwriting!, Super fast!" 
                   maxlength="150" />
            
            <!-- Quick Suggestion Chips -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
              ${QUICK_REMARK_TEMPLATES.map(tmpl => `
                <button type="button" 
                        onclick="setApprovalRemark('${escapeHtml(tmpl)}')" 
                        style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: 99px; padding: 3px 9px; font-size: 11px; color: var(--text-muted); cursor: pointer; transition: all 0.15s;"
                        onmouseover="this.style.borderColor='var(--primary)'; this.style.color='var(--primary)';"
                        onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-muted)';">
                  + ${tmpl}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1; padding: 10px 18px; font-size: 13.5px; font-weight: 700;">
              ✨ Approve &amp; Award +${task.points} Pts
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="closeModal('parent-approve-modal')">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(modalHtml);
}

function selectApprovalSticker(icon, label, selectedIdx) {
  const iconInput = document.getElementById('approve-sticker-icon');
  const textInput = document.getElementById('approve-sticker-text');
  const badge = document.getElementById('selected-sticker-badge');
  if (iconInput) iconInput.value = icon;
  if (textInput) textInput.value = label;
  if (badge) badge.innerText = `${icon} ${label}`;

  ENCOURAGEMENT_STICKERS.forEach((_, idx) => {
    const card = document.getElementById(`sticker-opt-${idx}`);
    if (card) {
      if (idx === selectedIdx) {
        card.style.borderColor = 'var(--primary)';
        card.style.background = 'rgba(79, 70, 229, 0.08)';
      } else {
        card.style.borderColor = 'var(--border-color)';
        card.style.background = 'var(--bg-surface)';
      }
    }
  });
}

function setApprovalRemark(text) {
  const input = document.getElementById('approve-remark-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function handleSaveTaskApproval(e, taskId) {
  e.preventDefault();
  const form = e.target;
  const sticker = form.sticker.value;
  const stickerText = form.stickerText.value;
  const remark = form.remark.value;

  const updated = store.approveTask(taskId, { sticker, stickerText, remark });
  closeModal('parent-approve-modal');
  if (updated) {
    triggerConfetti();
    showToast(`Task approved! ⭐ ${updated.points} points & sticker awarded!`, 'success');
    renderApp();
  }
}

function handleParentRejectTask(taskId) {
  showConfirmDialog({
    title: 'Request Revision?',
    message: 'Send this task back to the student as pending so they can complete or revise their work?',
    icon: '↩️',
    confirmText: 'Send for Revision',
    isDanger: false,
    onConfirm: () => {
      store.rejectTask(taskId);
      showToast('Task sent back to student for revision.', 'info');
      renderApp();
    }
  });
}

function handleSaveReward(e) {
  e.preventDefault();
  const form = e.target;
  const childId = form.childId.value;
  const prizeName = form.prizeName.value.trim();
  const targetPoints = parseInt(form.targetPoints.value, 10);

  if (!targetPoints || targetPoints < 10) {
    showToast('Please enter a valid target points value (min 10 points).', 'warning');
    return;
  }

  store.saveRewardGoal(childId, prizeName, targetPoints);
  showToast(`Weekend Reward Goal updated (${targetPoints} pts)! 🎯`, 'success');
  renderApp();
}

function handleClaimReward(childId) {
  showConfirmDialog({
    title: 'Claim Weekend Reward? 🎉',
    message: 'Mark this weekend reward as awarded and reset weekly points for a fresh new study week?',
    icon: '🎁',
    confirmText: 'Award Reward',
    isDanger: false,
    onConfirm: () => {
      store.markRewardGiven(childId);
      triggerConfetti();
      showToast('Weekend reward marked as awarded! 🌟', 'success');
      renderApp();
    }
  });
}

function handleResetWeeklyStars(childId, childName) {
  showConfirmDialog({
    title: 'Reset Weekly Stars? 🔄',
    message: `Are you sure you want to reset ${childName}'s weekly stars to 0? (Lifetime total points will be preserved).`,
    icon: '⭐',
    confirmText: 'Yes, Reset Stars',
    isDanger: true,
    onConfirm: () => {
      store.resetChildWeeklyPoints(childId);
      showToast(`Weekly stars reset to 0 for ${childName}.`, 'info');
      renderApp();
    }
  });
}

function handleDeleteRewardHistory(rewardId, prizeName) {
  showConfirmDialog({
    title: 'Delete History Entry? 🗑️',
    message: `Remove "${prizeName}" from the prize history?`,
    icon: '🗑️',
    confirmText: 'Delete',
    isDanger: true,
    onConfirm: () => {
      store.deleteRewardHistory(rewardId);
      showToast('Prize history record removed.', 'info');
      renderApp();
    }
  });
}

// ==========================================
// PARENT HELP & USER GUIDE TAB (In-App)
// ==========================================
function renderParentHelpTab() {
  const currentFamily = store.getCurrentFamily();
  const familyCode = currentFamily ? currentFamily.code : 'KIDS101';

  return `
    <!-- Help Hero Banner -->
    <div class="help-hero-card">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Documentation &amp; User Manual</div>
      <h2 style="font-size: 20px; font-weight: 800; margin: 4px 0 6px; color: #ffffff;">❓ Help &amp; Learning Center</h2>
      <p style="font-size: 13px; margin: 0; opacity: 0.95; line-height: 1.4;">
        Everything you need to know about setting up routines, awarding reward points, approving homework, and installing the app on your phones.
      </p>
    </div>

    <!-- Topic 1: Quick Start & Family Workspace -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">👨‍👩‍👧</span>
        <h3 class="help-topic-title">1. Getting Started &amp; Student Setup</h3>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        Connect your entire household with one private workspace code and personal student PINs.
      </p>

      <div class="help-step-list">
        <div class="help-step-item">
          <span class="help-step-num">1</span>
          <div>
            <strong>Family Code:</strong> Your private family code is <code style="background: var(--bg-surface-alt); padding: 2px 7px; border-radius: 4px; font-weight: 800; color: var(--primary); border: 1px solid var(--border-color);">${familyCode}</code>. Share this code with your kids so they can sign in from their phone, tablet, or PC.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">2</span>
          <div>
            <strong>Adding Children:</strong> Click <strong>"➕ Add Child"</strong> in the top bar to create a profile. Set their Name, Avatar, Standard (Classes 1–10), Syllabus (Kerala State or CBSE), and a secret 4-digit student PIN.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">3</span>
          <div>
            <strong>Student Login:</strong> Open this app on the child's device, enter the Family Code (<code style="color: var(--primary); font-weight: 700;">${familyCode}</code>) and their 4-digit PIN. They will see a cheerful dashboard with their daily checklist!
          </div>
        </div>
      </div>
    </div>

    <!-- Topic 2: Daily Study Routine & Carryover -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">📋</span>
        <h3 class="help-topic-title">2. Assigning Daily Tasks &amp; Habits</h3>
      </div>
      <div class="help-step-list">
        <div class="help-step-item">
          <span class="help-step-num">1</span>
          <div>
            <strong>Assign Task:</strong> Go to the <strong>"➕ Assign Task"</strong> tab. Pick the subject, study category (Reading, Homework, Revision), write specific instructions, and set the reward points (default 10 pts).
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">2</span>
          <div>
            <strong>Duplicate Routine Tasks:</strong> For recurring daily homework (like Daily Math Practice), click the <strong>"📋 Duplicate"</strong> button on any task card to instantly schedule it again without retyping.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">3</span>
          <div>
            <strong>Automatic Carryover:</strong> If a task is not finished on the assigned date, it automatically carries over to the next day as <em>"⚠️ Carried Over"</em> until it is completed.
          </div>
        </div>
      </div>
    </div>

    <!-- Topic 3: Student Submission & Parent Approval -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">📬</span>
        <h3 class="help-topic-title">3. Student Submission &amp; Parent Approval</h3>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        Maintain high study standards with two-way verification before points are credited to the student's wallet.
      </p>
      <div class="help-step-list">
        <div class="help-step-item">
          <span class="help-step-num">1</span>
          <div>
            <strong>Child Submits:</strong> After finishing reading or writing, the student clicks <em>"📬 Submit for Parent Approval"</em> on their phone.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">2</span>
          <div>
            <strong>Parent Approves:</strong> On the Parent Dashboard, review their work and click <strong>"✅ Approve (+Points)"</strong>. You can award encouraging digital stickers (⭐ 🌟 🏆 🚀 💯) and write a proud remark.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">3</span>
          <div>
            <strong>Needs Revision:</strong> If homework is messy or incomplete, click <strong>"🔄 Needs Revision"</strong>. It will be sent back to the child's pending list with a friendly revision note.
          </div>
        </div>
      </div>
    </div>

    <!-- Topic 4: Weekend Prizes & Goals -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">🏆</span>
        <h3 class="help-topic-title">4. Weekend Prizes, Target Stars &amp; Trophies</h3>
      </div>
      <div class="help-step-list">
        <div class="help-step-item">
          <span class="help-step-num">1</span>
          <div>
            <strong>Set Target Stars:</strong> In the <strong>"🏆 Weekend Prize"</strong> tab, enter an agreed weekend reward (e.g., <em>"Beach Outing &amp; Ice Cream"</em>) and the goal stars needed (e.g., <em>100 points</em>).
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">2</span>
          <div>
            <strong>Target Unlocked:</strong> When the student earns 100 points during the week, festive confetti fires on their screen with the message <em>"Target Unlocked!"</em>.
          </div>
        </div>
        <div class="help-step-item">
          <span class="help-step-num">3</span>
          <div>
            <strong>Mark Reward Given:</strong> Over the weekend, click <em>"🎁 Mark Reward Given"</em> to permanently record the prize in the child's <strong>📜 Trophy Case</strong>.
          </div>
        </div>
      </div>
    </div>

    <!-- Topic 5: Mobile App Installation (PWA) -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">📱</span>
        <h3 class="help-topic-title">5. Install as Mobile App (Android &amp; iOS)</h3>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        You don't need app stores. This web app installs directly onto your phone screen with full offline caching!
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 10px;">
        <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px;">
          <div style="font-weight: 700; color: #16a34a; font-size: 14px; margin-bottom: 6px;">🤖 Android (Google Chrome)</div>
          <ol style="padding-left: 18px; font-size: 12.5px; color: var(--text-main); line-height: 1.5; margin: 0;">
            <li>Open the site in Google Chrome.</li>
            <li>Tap the 3-dots menu (<strong>⋮</strong>) in the top-right corner.</li>
            <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li>Tap <strong>Install</strong> to add the icon to your home screen.</li>
          </ol>
        </div>

        <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px;">
          <div style="font-weight: 700; color: #2563eb; font-size: 14px; margin-bottom: 6px;">🍎 iPhone &amp; iPad (Safari)</div>
          <ol style="padding-left: 18px; font-size: 12.5px; color: var(--text-main); line-height: 1.5; margin: 0;">
            <li>Open the site in Apple Safari.</li>
            <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            <li>Tap <strong>Add</strong> in the top-right corner.</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Topic 6: Frequently Asked Questions (FAQ) -->
    <div class="help-topic-card">
      <div class="help-topic-header">
        <span style="font-size: 22px;">❓</span>
        <h3 class="help-topic-title">6. Frequently Asked Questions (FAQ)</h3>
      </div>

      <div class="help-faq-item">
        <div class="help-faq-q">Q: What if my child forgets their 4-digit PIN?</div>
        <div class="help-faq-a">A: Parents can easily view and change any child's PIN at any time. Go to the Parent Dashboard, choose the child from the topbar, click <strong>"✏️ Edit Profile"</strong> on their banner, enter a new 4-digit PIN, and save.</div>
      </div>

      <div class="help-faq-item">
        <div class="help-faq-q">Q: Can both father and mother access the tracker from separate phones?</div>
        <div class="help-faq-a">A: Yes! Both parents can sign in using the same <strong>Family Code</strong> and <strong>Parent PIN</strong> on their phones. All updates synchronize in real time through Google Firebase cloud sync.</div>
      </div>

      <div class="help-faq-item">
        <div class="help-faq-q">Q: How do I change the color theme?</div>
        <div class="help-faq-a">A: Click the <strong>"🎨 Theme"</strong> button in the top bar. You can choose from 6 beautiful color palettes: Classic Indigo, Emerald Forest, Sunset Amber, Ocean Breeze, Sweet Candy, or Midnight Dark.</div>
      </div>

      <div class="help-faq-item">
        <div class="help-faq-q">Q: How can I back up my family's records?</div>
        <div class="help-faq-a">A: Go to <strong>"Curriculum &amp; Categories"</strong> ➡️ <em>Section 3: Local Backup</em>. Click <strong>"💾 Download Backup (.json)"</strong> to save an offline copy of all tasks, student profiles, and reward records.</div>
      </div>
    </div>
  `;
}
