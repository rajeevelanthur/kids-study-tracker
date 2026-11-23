/**
 * Kids Study & Rewards Tracker - Student / Child Dashboard
 * - Monday-to-Friday Study Week View
 * - Weekly Star Wallet & Weekend Goal Progress Bar
 * - Active, Completed & All Task Views
 * - One-Click Task Submission for Parent Approval
 */

var childTaskViewMode = 'active'; // 'active' | 'completed' | 'all'

function setChildTaskViewMode(mode) {
  childTaskViewMode = mode;
  renderApp();
}

function renderChildView(container) {
  const currentUser = store.getCurrentUser();
  const currentFamily = store.getCurrentFamily();
  const taskData = getChildWeeklyTaskData(currentUser.id);
  const { currentWeek, carriedOverTasks, activeTasks, completedThisWeekTasks, dashboardAllTasks, submittedTasks } = taskData;
  const reward = store.getRewardForChild(currentUser.id);
  const rewardHistory = store.getRewardHistoryForChild(currentUser.id);

  const weeklyPts = currentUser.weeklyPoints || 0;
  const targetPts = reward ? reward.targetPoints : 100;
  const progressPct = Math.min(100, Math.round((weeklyPts / targetPts) * 100));

  let displayedTasks = activeTasks;
  if (childTaskViewMode === 'completed') {
    displayedTasks = completedThisWeekTasks;
  } else if (childTaskViewMode === 'all') {
    displayedTasks = dashboardAllTasks;
  }

  let html = `
    <div style="max-width: 760px; margin: 0 auto; padding: 20px 16px;">
      <!-- Student Top Header with Theme Switcher -->
      <header style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 28px;">🎓</span>
          <div>
            <h1 style="font-size: 17px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1.2;">Study Tracker</h1>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
              ${currentFamily ? `🏡 ${escapeHtml(currentFamily.name)} • ` : ''}${currentUser.syllabus && currentUser.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala State'} (Class ${currentUser.grade || 7}) • <span style="color: ${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.color : '#047857'}; font-weight: 700;">${typeof CURRENT_ENV_CONFIG !== 'undefined' ? CURRENT_ENV_CONFIG.badge : '☁️ Cloud'}</span>
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <button class="btn-theme-pill" onclick="openThemeModal()" title="Change Color Theme">
            🎨 <span class="theme-btn-text">Theme</span>
          </button>
          <button class="btn-theme-pill" onclick="openChildTrophyModal()" style="border-color: #f59e0b; background: rgba(245, 158, 11, 0.12); color: #d97706; font-weight: 700;" title="View Won Trophies & Rewards">
            🏆 <span class="theme-btn-text">Trophies (${rewardHistory.length})</span>
          </button>
          <button class="btn-theme-pill" onclick="openChildHelpModal()" title="How Study Tracker Works">
            ❓ <span class="theme-btn-text">Help</span>
          </button>
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface-alt); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 99px;">
            <span style="font-size: 18px;">${currentUser.avatar || '🧒'}</span>
            <span style="font-size: 13px; font-weight: 700; color: var(--text-main);">${escapeHtml(currentUser.name)}</span>
          </div>
          <button class="btn btn-outline-primary" onclick="handleSignOut()" style="padding: 5px 12px; font-size: 12px; border-radius: var(--radius-sm);" title="Exit to Login">
            🚪 Exit
          </button>
        </div>
      </header>

      <!-- Cheerful Hero Banner -->
      <div class="points-banner">
        <div class="points-top">
          <div>
            <div class="points-greeting">Hi, ${escapeHtml(currentUser.name)}! 👋</div>
            <div class="points-subtitle">Class ${currentUser.grade} • ${currentUser.syllabus && currentUser.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala State Syllabus'}</div>
          </div>
          <div class="points-score-box">
            <div class="points-number">⭐ ${weeklyPts}</div>
            <div class="points-label">Points this week</div>
          </div>
        </div>

        <div class="goal-progress-box">
          <div class="goal-desc">
            <span>🎯 Weekend Goal: ${reward ? escapeHtml(reward.prizeName) : 'Weekend Treat'}</span>
            <span>${weeklyPts}/${targetPts} pts</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
          <div class="goal-footer">
            <span>${progressPct}% complete</span>
            <span>${weeklyPts >= targetPts ? '🎉 Target Unlocked!' : `${targetPts - weeklyPts} more points to win!`}</span>
          </div>

          <!-- Compact 1-Line Trophy Case Link -->
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255, 255, 255, 0.28); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #ffffff;">
              <span style="font-size: 18px;">🏆</span>
              <span>Trophy Case:</span>
              <span style="background: rgba(255, 255, 255, 0.22); padding: 2px 8px; border-radius: 99px; font-size: 11.5px;">
                ${rewardHistory.length} Won 🎉
              </span>
              ${rewardHistory.length > 0 ? `<span style="font-size: 12px; opacity: 0.92; font-weight: 500;">(Latest: ${escapeHtml(rewardHistory[0].prizeName)})</span>` : ''}
            </div>
            <button type="button" onclick="openChildTrophyModal()" style="background: #ffffff; color: var(--primary); border: none; border-radius: 99px; padding: 4px 13px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.12); transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
              <span>View All Trophies</span> 🥇
            </button>
          </div>
        </div>
      </div>

      <!-- Current Study Week Banner -->
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

      <!-- 3 Clean Clutter-Free View Switcher Pills for Student -->
      <div class="view-mode-bar">
        <button class="view-mode-pill ${childTaskViewMode === 'active' ? 'active' : ''}" onclick="setChildTaskViewMode('active')">
          ⚡ Active &amp; Pending (${activeTasks.length})
        </button>
        <button class="view-mode-pill ${childTaskViewMode === 'completed' ? 'active' : ''}" onclick="setChildTaskViewMode('completed')">
          ✅ This Week's Completed (${completedThisWeekTasks.length})
        </button>
        <button class="view-mode-pill ${childTaskViewMode === 'all' ? 'active' : ''}" onclick="setChildTaskViewMode('all')">
          📋 All Tasks (${dashboardAllTasks.length})
        </button>
      </div>

      ${childTaskViewMode === 'active' && submittedTasks.length > 0 ? `
        <div style="background: #faf5ff; border: 1px dashed #d8b4fe; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; font-size: 13px; color: #6b21a8; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">🔔</span>
          <div>
            <strong>${submittedTasks.length} task(s) submitted</strong> and waiting for your parent to approve. Points will be awarded upon approval!
          </div>
        </div>
      ` : ''}

      ${childTaskViewMode === 'active' && carriedOverTasks.length > 0 ? `
        <div style="background: var(--danger-light); border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px; font-size: 13px; color: #991b1b; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">⚠️</span>
          <div>
            <strong>${carriedOverTasks.length} unfinished task(s)</strong> carried over from previous week. Let's finish them!
          </div>
        </div>
      ` : ''}

      ${displayedTasks.length === 0 ? `
        <div class="empty-state" style="padding: 28px;">
          <div class="empty-state-icon">
            ${childTaskViewMode === 'completed' ? '🌟' : '🎉'}
          </div>
          <div class="empty-state-title">
            ${childTaskViewMode === 'completed' ? 'No completed tasks yet this week' : (childTaskViewMode === 'active' ? 'Awesome! No pending tasks right now' : 'No tasks assigned for this week')}
          </div>
          <p style="font-size: 14px; color: var(--text-muted);">
            ${childTaskViewMode === 'completed' ? 'Complete your study tasks and ask your parent to approve them!' : 'Check back when your parent assigns new tasks.'}
          </p>
        </div>
      ` : displayedTasks.map(t => renderTaskCard(t, false)).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function handleChildSubmitTask(taskId) {
  const updated = store.submitTaskForApproval(taskId);
  if (updated) {
    triggerConfetti();
    showToast('Submitted for Parent Approval! 📬 Points will credit once approved.', 'success');
    renderApp();
  }
}

// ==========================================
// STUDENT TROPHY CASE MODAL
// ==========================================
function openChildTrophyModal() {
  const currentUser = store.getCurrentUser();
  if (!currentUser) return;
  const rewardHistory = store.getRewardHistoryForChild(currentUser.id);

  try {
    triggerConfetti();
  } catch (e) {}

  const modalHtml = `
    <div class="modal-overlay" id="child-trophy-modal" onclick="closeModalOnOutsideClick(event, 'child-trophy-modal')">
      <div class="modal-card" style="max-width: 640px; width: 95%; max-height: 85vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 26px;">🏆</span>
            <div>
              <h3 class="modal-title" style="margin: 0; font-size: 17px; font-weight: 800;">My Trophy Case &amp; Won Rewards</h3>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                ${escapeHtml(currentUser.name)}'s Achievements (${rewardHistory.length} Total Won)
              </span>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal('child-trophy-modal')">✕</button>
        </div>

        <div style="padding: 16px 4px; overflow-y: auto; flex: 1;">
          ${rewardHistory.length === 0 ? `
            <div style="text-align: center; padding: 40px 16px;">
              <div style="font-size: 46px; margin-bottom: 12px;">🌟</div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
                Trophy Case Awaiting Your First Reward!
              </h4>
              <p style="font-size: 13.5px; color: var(--text-muted); max-width: 420px; margin: 0 auto; line-height: 1.5;">
                Complete your daily study tasks, earn weekly stars, and reach your weekend goal to unlock shiny trophies &amp; treats here!
              </p>
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
              ${rewardHistory.map((h, idx) => {
                const dateStr = h.rewardedAt ? new Date(h.rewardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (h.weekLabel || 'Past Week');
                const badgeIcon = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🎖️');
                return `
                  <div style="background: var(--bg-surface-alt); border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 14px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                      <span style="font-size: 24px;">${badgeIcon}</span>
                      <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 7px; border-radius: 99px;">
                        🎁 Handed Over
                      </span>
                    </div>
                    <div>
                      <div style="font-size: 14.5px; font-weight: 800; color: var(--text-main); line-height: 1.35; margin-bottom: 4px;">
                        ${escapeHtml(h.prizeName || 'Weekend Reward')}
                      </div>
                      <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                        📅 ${escapeHtml(h.weekLabel || 'Week Goal Completed')}
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                        Awarded on ${dateStr}
                      </div>
                    </div>
                    <div style="font-size: 12px; font-weight: 800; color: #d97706; padding-top: 6px; border-top: 1px dashed rgba(245, 158, 11, 0.3); display: flex; justify-content: space-between; align-items: center;">
                      <span>⭐ Stars Achieved:</span>
                      <span>${h.pointsAchieved || h.targetPoints || 100} / ${h.targetPoints || 100}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div style="display: flex; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--border-color); margin-top: 8px;">
          <button type="button" class="btn btn-primary" onclick="closeModal('child-trophy-modal')" style="width: auto; padding: 8px 22px; font-size: 13px;">
            Done &amp; Keep Studying ✨
          </button>
        </div>
      </div>
    </div>
  `;

  showModal(modalHtml);
}

// Student Help Dialog
function openChildHelpModal() {
  const modalHtml = `
    <div class="modal-overlay" id="child-help-modal" onclick="closeModalOnOutsideClick(event, 'child-help-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">⭐</span>
            <h3 class="modal-title" style="margin: 0;">How Study Tracker Works!</h3>
          </div>
          <button class="modal-close" onclick="closeModal('child-help-modal')">✕</button>
        </div>

        <div style="font-size: 13.5px; line-height: 1.5; color: var(--text-main); display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px;">
            <div style="font-weight: 800; color: var(--primary); margin-bottom: 4px;">1. Finish Your Daily Tasks 📚</div>
            <div>Look at today's checklist on your dashboard. Read lessons, complete written homework, or revise topics your parents assigned.</div>
          </div>

          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px;">
            <div style="font-weight: 800; color: #16a34a; margin-bottom: 4px;">2. Submit for Approval 📬</div>
            <div>When you finish an assignment, tap <strong>"Submit for Parent Approval"</strong>. Your parents will review your work!</div>
          </div>

          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px;">
            <div style="font-weight: 800; color: #d97706; margin-bottom: 4px;">3. Win Reward Stars &amp; Weekend Prizes 🏆</div>
            <div>Parents award you stars and encouragement stickers. Reach your weekend target stars to unlock your special weekend reward!</div>
          </div>
        </div>

        <div style="margin-top: 16px; text-align: center;">
          <button type="button" class="btn btn-primary" onclick="closeModal('child-help-modal')" style="width: 100%; padding: 10px; font-size: 13.5px; font-weight: 700;">
            🚀 Got It! Let's Study!
          </button>
        </div>
      </div>
    </div>
  `;

  showModal(modalHtml);
}
