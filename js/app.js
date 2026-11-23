/**
 * Kids Study & Rewards Tracker - Application Conductor & Router
 * - Global Application State
 * - Navigation & View Routing
 * - App Lifecycle Bootstrap
 */

// Global State
var activeTab = 'tasks'; // 'tasks' | 'add' | 'report' | 'reward' | 'settings'
var activeChildId = null;
var taskViewMode = 'active'; // 'active' (pending + submitted + overdue) | 'completed' | 'all'
var selectedSettingsGrade = 7;
var selectedSettingsSyllabus = 'kerala'; // 'kerala' | 'cbse'

// Report Filters State
var reportStartDate = '';
var reportEndDate = '';
var reportStatusFilter = 'all'; // 'all' | 'completed' | 'submitted' | 'pending' | 'overdue'
var reportSubjectFilter = 'all';
var reportPreset = 'all_time';   // 'all_time' | 'today' | 'this_week' | 'prev_week' | 'this_month'

// Navigation Routers
function syncSettingsWithActiveChild() {
  const child = store.getUserById(activeChildId);
  if (child) {
    if (child.grade) selectedSettingsGrade = child.grade;
    if (child.syllabus && child.syllabus.includes('CBSE')) {
      selectedSettingsSyllabus = 'cbse';
    } else {
      selectedSettingsSyllabus = 'kerala';
    }
  }
}

function switchTab(tab) {
  activeTab = tab;
  toggleMobileSidebar(false);
  if (tab !== 'add' && typeof pendingDuplicateTask !== 'undefined') {
    pendingDuplicateTask = null;
  }
  if (tab === 'settings') {
    syncSettingsWithActiveChild();
  }
  renderApp();
}

function selectChild(childId) {
  activeChildId = childId;
  syncSettingsWithActiveChild();
  renderApp();
}

// Master Render Function
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Super Admin View (Protected Master Console)
  if (store.isSuperAdminSession && store.isSuperAdminSession()) {
    renderSuperAdminView(root);
    return;
  }

  const currentUser = store.getCurrentUser();

  // Landing / PIN Login Screen if not logged in
  if (!currentUser) {
    renderLandingAuthPage(root);
    return;
  }

  // Active Child Selection for Parent Admin
  const children = store.getChildren();
  if (!activeChildId && children.length > 0) {
    activeChildId = children[0].id;
  } else if (children.length > 0 && !children.find(c => c.id === activeChildId)) {
    activeChildId = children[0].id;
  } else if (children.length === 0) {
    activeChildId = null;
  }

  // Route to Appropriate Portal
  if (currentUser.role === 'parent') {
    renderParentView(root);
  } else {
    renderChildView(root);
  }
}

// App Initialization Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getCurrentTheme());
    renderApp();
  });
} else {
  applyTheme(getCurrentTheme());
  renderApp();
}
