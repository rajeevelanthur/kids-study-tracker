/**
 * Kids Study Tracker - Student / Child Dashboard
 * - Monday-to-Sunday 7-Day Study Week View
 * - Weekly Star Wallet & Weekend Goal Progress Bar
 * - Interactive Activity Ring & "Up Next" Featured Study Task
 * - Trophy Cabinet Modal & Parent Praise Stickers
 * - Active, Completed & All Task Views with Seamless Navigation
 */

var childActiveTab = 'hub'; // 'hub' | 'tasks'
var childTaskViewMode = 'active'; // 'active' | 'completed' | 'all'

function setChildActiveTab(tab, taskMode = null) {
  childActiveTab = tab;
  if (taskMode) {
    childTaskViewMode = taskMode;
  }
  renderApp();
  if (tab === 'tasks') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function setChildTaskViewMode(mode) {
  childTaskViewMode = mode;
  renderApp();
}

function getStudyWeek7Days(mondayDate) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = [];
  const mon = new Date(mondayDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    days.push({
      index: i,
      name: dayNames[i],
      fullName: fullNames[i],
      date: d,
      dateNum: d.getDate(),
      dateStr: getFormattedDate(d),
      isWeekend: (i >= 5)
    });
  }
  return days;
}

function getChildStreakDays(allTasks) {
  if (!allTasks || allTasks.length === 0) return 0;
  const completedDates = new Set(
    allTasks
      .filter(t => t.status === 'completed' && t.date)
      .map(t => t.date)
  );
  let streak = 0;
  let checkDate = new Date();
  const todayFormatted = getFormattedDate(checkDate);

  if (completedDates.has(todayFormatted)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!completedDates.has(getFormattedDate(checkDate))) {
      return 0;
    }
  }

  for (let i = 0; i < 30; i++) {
    const dStr = getFormattedDate(checkDate);
    if (completedDates.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderChildView(container) {
  const currentUser = store.getCurrentUser();
  const currentFamily = store.getCurrentFamily();
  const taskData = getChildWeeklyTaskData(currentUser.id);
  const { currentWeek, carriedOverTasks, activeTasks, completedThisWeekTasks, dashboardAllTasks, submittedTasks, allTasks } = taskData;
  const reward = store.getRewardForChild(currentUser.id);
  const rewardHistory = store.getRewardHistoryForChild(currentUser.id);

  const weeklyPts = currentUser.weeklyPoints || 0;
  const targetPts = reward ? reward.targetPoints : 100;
  const progressPct = Math.min(100, Math.round((weeklyPts / targetPts) * 100));

  const streakDays = getChildStreakDays(allTasks);
  const week7Days = getStudyWeek7Days(currentWeek.monday);

  // Subject Study Focus Breakdown from completedThisWeekTasks
  const SLICE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#f97316', '#3b82f6', '#14b8a6', '#84cc16'];
  const subjectMap = {};
  (completedThisWeekTasks || []).forEach(t => {
    const key = t.subjectName || 'Other';
    if (!subjectMap[key]) {
      subjectMap[key] = {
        name: key,
        icon: t.subjectIcon || '📚',
        count: 0,
        points: 0
      };
    }
    subjectMap[key].count++;
    subjectMap[key].points += (t.points || 0);
  });
  const subjectStudyList = Object.values(subjectMap).sort((a, b) => b.count - a.count || b.points - a.points);
  const totalCompletedCount = completedThisWeekTasks.length;
  const topSubject = subjectStudyList[0] || null;

  // Build SVG Donut Slices
  let accumulatedOffset = 0;
  const circumference = 289.027; // 2 * PI * 46
  const donutSlicesSvg = subjectStudyList.map((s, idx) => {
    s.color = SLICE_COLORS[idx % SLICE_COLORS.length];
    const sliceLen = totalCompletedCount > 0 ? (s.count / totalCompletedCount) * circumference : 0;
    const strokeDash = `${sliceLen} ${circumference - sliceLen}`;
    const offset = -accumulatedOffset;
    accumulatedOffset += sliceLen;
    return `<circle cx="65" cy="65" r="46" fill="none" stroke="${s.color}" stroke-width="18" stroke-dasharray="${strokeDash}" stroke-dashoffset="${offset}" style="transition: all 0.4s ease;"></circle>`;
  }).join('');

  // Today's task metrics
  const todayTasks = (allTasks || []).filter(t => t.date === TODAY_STR);
  const todayCompleted = todayTasks.filter(t => t.status === 'completed');
  const todayPending = todayTasks.filter(t => t.status !== 'completed');
  const todayPct = todayTasks.length > 0 
    ? Math.round((todayCompleted.length / todayTasks.length) * 100) 
    : (completedThisWeekTasks.length > 0 ? 100 : 0);

  // Up Next immediate task
  const upNextTask = todayPending[0] || activeTasks[0] || null;

  let displayedTasks = activeTasks;
  if (childTaskViewMode === 'completed') {
    displayedTasks = completedThisWeekTasks;
  } else if (childTaskViewMode === 'all') {
    displayedTasks = dashboardAllTasks;
  }

  let html = `
    <div style="max-width: 780px; margin: 0 auto; padding: 20px 16px;">
      <!-- Student Top Header with Profile & Theme Switcher -->
      <header style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 28px;">🎓</span>
          <div>
            <h1 style="font-size: 17px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1.2;">Kids Study Tracker</h1>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
              ${currentFamily ? `🏡 ${escapeHtml(currentFamily.name)} • ` : ''}${currentUser.syllabus && currentUser.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala State'} (${getGradeLabel(currentUser.grade || 7)})
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="child-topbar-date" style="display: inline-flex; align-items: center; gap: 5px; background: var(--bg-surface-alt); border: 1px solid var(--border-color); padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; color: var(--text-main);" title="Today's Date">
            <span>📅</span>
            <span>${getTodayFormattedLong()}</span>
          </div>
          <button class="btn-theme-pill" onclick="openThemeModal()" title="Change Color Theme">
            🎨 <span class="theme-btn-text">Theme</span>
          </button>
          <button class="btn-theme-pill" onclick="openChildHelpModal()" title="How Kids Study Tracker Works">
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

      <!-- Main Navigation Tabs (My Dashboard vs All Tasks) -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-surface); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--border-color); gap: 6px;">
        <button type="button" class="child-nav-tab ${childActiveTab === 'hub' ? 'active' : ''}" onclick="setChildActiveTab('hub')">
          <span>📊 My Dashboard</span>
        </button>
        <button type="button" class="child-nav-tab ${childActiveTab === 'tasks' ? 'active' : ''}" onclick="setChildActiveTab('tasks')">
          <span>📋 All Tasks</span>
          ${activeTasks.length > 0 ? `<span class="child-nav-badge">${activeTasks.length}</span>` : `<span class="child-nav-badge-muted">${dashboardAllTasks.length}</span>`}
        </button>
      </div>

      ${childActiveTab === 'hub' ? `
        <!-- ============================================== -->
        <!-- TAB 1: MODERN CHILD DASHBOARD HUB              -->
        <!-- ============================================== -->

        <!-- Student Greeting Banner with Streak -->
        <div class="points-banner" style="margin-bottom: 16px;">
          <div class="points-top">
            <div>
              <div class="points-greeting">Hi, ${escapeHtml(currentUser.name)}! 👋</div>
              <div class="points-subtitle">${getGradeLabel(currentUser.grade)} • ${currentUser.syllabus && currentUser.syllabus.includes('CBSE') ? '🏛️ CBSE' : '🌴 Kerala State Syllabus'}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${streakDays > 0 ? `
                <div style="background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.35); padding: 6px 12px; border-radius: 99px; display: flex; align-items: center; gap: 6px; color: #ffffff; font-weight: 800; font-size: 13px;" title="Consecutive days studying!">
                  <span>🔥</span> <span>${streakDays}-Day Streak</span>
                </div>
              ` : `
                <div style="background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.35); padding: 6px 12px; border-radius: 99px; display: flex; align-items: center; gap: 6px; color: #ffffff; font-weight: 700; font-size: 12px;">
                  <span>⚡</span> <span>Study Time!</span>
                </div>
              `}
              <div class="points-score-box">
                <div class="points-number">⭐ ${weeklyPts}</div>
                <div class="points-label">Points this week</div>
              </div>
            </div>
          </div>

          <!-- Weekend Goal & Trophy Case Widget -->
          <div class="goal-progress-box" style="margin-top: 14px;">
            <div class="goal-desc">
              <span>🎯 Weekend Target: <strong>${reward ? escapeHtml(reward.prizeName) : 'Weekend Treat 🍦'}</strong></span>
              <span><strong>${weeklyPts}</strong> / ${targetPts} pts</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
            </div>
            <div class="goal-footer">
              <span>${progressPct}% complete</span>
              <span>${weeklyPts >= targetPts ? '🎉 Target Unlocked!' : `${targetPts - weeklyPts} more points to win!`}</span>
            </div>

            <!-- Integrated Trophy Cabinet Gateway -->
            <div class="trophy-cabinet-gateway">
              <div class="trophy-gateway-left">
                <span style="font-size: 18px; flex-shrink: 0;">🏆</span>
                <span class="trophy-gateway-title">Trophy Cabinet:</span>
                <span class="trophy-gateway-badge">
                  <span>${rewardHistory.length} Won</span>
                  <span>🎉</span>
                </span>
                ${rewardHistory.length > 0 ? `<span class="trophy-gateway-latest">(Latest: ${escapeHtml(rewardHistory[0].prizeName)})</span>` : ''}
              </div>
              <button type="button" class="btn-trophy-gateway" onclick="openChildTrophyModal()">
                <span>Open Trophy Case</span> 🥇
              </button>
            </div>
          </div>
        </div>

        <!-- 7-Day Weekly Study Journey Widget (Monday to Sunday) -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">📅</span>
              <div>
                <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0;">Weekly Study Journey</h3>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Monday – Sunday (${currentWeek.displayLabel})</span>
              </div>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 99px;">
              ⭐ ${completedThisWeekTasks.length} / ${dashboardAllTasks.length} Tasks Done
            </div>
          </div>

          <!-- 7-Day Strip -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; overflow-x: auto; padding-bottom: 4px;">
            ${week7Days.map(day => {
              const dayTasks = (allTasks || []).filter(t => t.date === day.dateStr);
              const dayDone = dayTasks.filter(t => t.status === 'completed');
              const isPast = day.dateStr < TODAY_STR;
              const isToday = day.dateStr === TODAY_STR;
              const isFuture = day.dateStr > TODAY_STR;

              let statusClass = 'future';
              let badgeText = dayTasks.length > 0 ? `${dayDone.length}/${dayTasks.length}` : (day.isWeekend ? '🌴' : '—');
              let statusBg = 'var(--bg-surface-alt)';
              let statusBorder = 'var(--border-color)';
              let textColor = 'var(--text-muted)';

              if (isPast) {
                if (dayTasks.length > 0 && dayDone.length === dayTasks.length) {
                  statusBg = '#ecfdf5';
                  statusBorder = '#a7f3d0';
                  textColor = '#047857';
                  badgeText = '✓ Done';
                } else if (dayTasks.length > 0 && dayDone.length < dayTasks.length) {
                  statusBg = '#fffbeb';
                  statusBorder = '#fde68a';
                  textColor = '#b45309';
                  badgeText = `${dayDone.length}/${dayTasks.length}`;
                } else {
                  badgeText = day.isWeekend ? '🌴 Rest' : '—';
                }
              } else if (isToday) {
                statusBg = 'var(--primary-light)';
                statusBorder = 'var(--primary)';
                textColor = 'var(--primary)';
                badgeText = dayTasks.length > 0 ? `${dayDone.length}/${dayTasks.length}` : 'Today';
              }

              return `
                <div style="background: ${statusBg}; border: ${isToday ? '2px solid var(--primary)' : `1px solid ${statusBorder}`}; border-radius: var(--radius-sm); padding: 8px 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 72px; transition: all 0.2s; box-shadow: ${isToday ? '0 0 0 3px var(--primary-glow)' : 'none'};">
                  <span style="font-size: 11px; font-weight: 800; color: ${textColor}; text-transform: uppercase; letter-spacing: 0.5px;">${day.name}</span>
                  <span style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 2px 0;">${day.dateNum}</span>
                  <span style="font-size: 10px; font-weight: 700; color: ${textColor}; background: rgba(0,0,0,0.04); padding: 2px 5px; border-radius: 99px; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${badgeText}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top: 10px; font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <span>💡 <em>Consistency is key! Daily studies help unlock weekend prizes faster.</em></span>
            <span style="font-weight: 700; color: var(--primary);">Weekly Momentum: ${completedThisWeekTasks.length} Done</span>
          </div>
        </div>

        <!-- Subject Study Focus Donut Chart Widget -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">📊</span>
              <div>
                <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0;">Subject Study Distribution</h3>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Time &amp; tasks spent per subject this week</span>
              </div>
            </div>
            ${topSubject ? `
              <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); background: var(--primary-light); border: 1px solid var(--border-color); padding: 3px 10px; border-radius: 99px;">
                ⭐ Top Focus: <strong>${escapeHtml(topSubject.name)}</strong> (${topSubject.count} closed)
              </div>
            ` : ''}
          </div>

          ${subjectStudyList.length === 0 ? `
            <div style="text-align: center; padding: 24px 12px; background: var(--bg-surface-alt); border-radius: var(--radius-sm); border: 1px dashed var(--border-color); font-size: 13px; color: var(--text-muted);">
              <span>📖 Complete your daily study tasks to unlock your Subject Pie Chart breakdown here!</span>
            </div>
          ` : `
            <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 20px; padding: 6px 0;">
              
              <!-- Left: Modern SVG Donut / Pie Chart -->
              <div style="position: relative; width: 130px; height: 130px; flex-shrink: 0;">
                <svg width="130" height="130" viewBox="0 0 130 130" style="transform: rotate(-90deg);">
                  <circle cx="65" cy="65" r="46" fill="none" stroke="var(--border-color)" stroke-width="18"></circle>
                  ${donutSlicesSvg}
                </svg>
                <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
                  <span style="font-size: 20px; font-weight: 800; color: var(--text-main); line-height: 1;">${totalCompletedCount}</span>
                  <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px;">Tasks Done</span>
                </div>
              </div>

              <!-- Right: Clean Color-Coded Subject Legend (Compact & Scalable) -->
              <div style="flex: 1; min-width: 200px; max-height: 190px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding-right: 4px;">
                ${subjectStudyList.map(s => {
                  const pct = totalCompletedCount > 0 ? Math.round((s.count / totalCompletedCount) * 100) : 0;
                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 3px 6px; border-radius: var(--radius-sm); background: var(--bg-surface-alt); min-height: 26px;">
                      <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;">
                        <span style="width: 8px; height: 8px; border-radius: 2px; background: ${s.color}; flex-shrink: 0;"></span>
                        <span style="font-size: 12px;">${s.icon}</span>
                        <span style="font-size: 11.5px; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(s.name)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                        <span style="font-size: 10.5px; font-weight: 600; color: var(--text-muted);">${s.count} (${pct}%)</span>
                        <span style="font-size: 10px; font-weight: 800; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 1px 5px; border-radius: 99px;">+${s.points} pts</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

            </div>
          `}
        </div>

        <!-- Today's Focus Deck (Split Grid: Activity Ring & Up Next Task) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 16px;">
          
          <!-- Card 1: Today's Activity Progress Ring -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 6px;">
                <span>🎯</span> <span>Today's Progress</span>
              </h3>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; padding: 10px 0;">
              <!-- Modern Circular Progress Meter -->
              <div style="position: relative; width: 88px; height: 88px; flex-shrink: 0;">
                <svg width="88" height="88" viewBox="0 0 88 88" style="transform: rotate(-90deg);">
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--border-color)" stroke-width="8"></circle>
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--primary)" stroke-width="8" stroke-dasharray="226.2" stroke-dashoffset="${226.2 * (1 - (todayPct / 100))}" stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease;"></circle>
                </svg>
                <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 17px; font-weight: 800; color: var(--text-main);">${todayPct}%</span>
                </div>
              </div>

              <div>
                <div style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
                  ${todayCompleted.length} of ${todayTasks.length} Completed
                </div>
                <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;">
                  ${todayPending.length === 0 && todayTasks.length > 0 
                    ? '🎉 All finished for today! Excellent job!' 
                    : `${todayPending.length} pending task(s) left for today.`}
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-weight: 700; color: #16a34a; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 7px; border-radius: 99px;">
                    ✓ ${todayCompleted.length} Done
                  </span>
                  <span style="font-size: 11px; font-weight: 700; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; padding: 1px 7px; border-radius: 99px;">
                    ⏳ ${todayPending.length} Pending
                  </span>
                </div>
              </div>
            </div>

            <button type="button" onclick="setChildActiveTab('tasks', 'active')" style="background: none; border: 1px dashed var(--primary); color: var(--primary); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12.5px; font-weight: 700; cursor: pointer; text-align: center; margin-top: 10px; transition: background 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='none'">
              View Today's Tasks Checklist ➔
            </button>
          </div>

          <!-- Card 2: "Up Next" Featured Study Task Card -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 6px;">
                <span>⚡</span> <span>Up Next Focus</span>
              </h3>
              ${upNextTask ? `
                <span style="font-size: 11px; font-weight: 800; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 99px;">
                  ⭐ +${upNextTask.points} Pts
                </span>
              ` : ''}
            </div>

            ${upNextTask ? `
              <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">
                  <span>${upNextTask.subjectIcon || '📚'}</span>
                  <span>${escapeHtml(upNextTask.subjectName)}</span>
                </div>
                <div style="font-size: 14.5px; font-weight: 800; color: var(--text-main); line-height: 1.35; margin-bottom: 6px;">
                  ${escapeHtml(upNextTask.title)}
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                  <span>📅 Due: <strong>${formatDisplayDate(upNextTask.date)}</strong></span>
                  ${upNextTask.taskTypeName ? `<span>• ${escapeHtml(upNextTask.taskTypeName)}</span>` : ''}
                </div>
              </div>

              ${upNextTask.status === 'pending' && upNextTask.revisionReason ? `
                <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: var(--radius-sm); padding: 9px 12px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="font-size: 18px; line-height: 1;">🔄</span>
                  <div style="font-size: 12px; text-align: left;">
                    <div style="font-weight: 800; color: #b45309; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Parent Requested Revision:</div>
                    <div style="color: #78350f; font-weight: 700; margin-top: 2px;">"${escapeHtml(upNextTask.revisionReason)}"</div>
                  </div>
                </div>
              ` : ''}

              ${upNextTask.status === 'submitted' ? `
                <div style="background: #faf5ff; border: 1px solid #d8b4fe; border-radius: var(--radius-sm); padding: 10px; font-size: 12.5px; color: #6b21a8; font-weight: 700; text-align: center;">
                  🔔 Submitted! Awaiting Parent Approval (+${upNextTask.points} pts)
                </div>
              ` : `
                <button type="button" class="btn btn-primary" onclick="handleChildSubmitTask('${upNextTask.id}')" style="width: 100%; padding: 11px; font-size: 13.5px; font-weight: 800; box-shadow: var(--shadow-sm);">
                  ✓ Complete &amp; Submit for Approval (+${upNextTask.points} pts)
                </button>
              `}
            ` : `
              <div style="text-align: center; padding: 26px 12px; background: var(--bg-surface-alt); border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
                <div style="font-size: 32px; margin-bottom: 6px;">🌟</div>
                <div style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">
                  All Caught Up!
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  You have completed all active study tasks. Great job!
                </div>
              </div>
            `}
          </div>
        </div>
      ` : `
        <!-- ============================================== -->
        <!-- TAB 2: DETAILED TASK SCHEDULE & CHECKLIST VIEW  -->
        <!-- ============================================== -->

        <!-- Navigation Bar to return to Dashboard -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <button type="button" class="btn btn-outline-primary" onclick="setChildActiveTab('hub')" style="padding: 6px 14px; font-size: 12.5px; font-weight: 700;">
            ⬅️ Back to Dashboard
          </button>
          <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">
            Week: ${currentWeek.displayLabel}
          </span>
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
      `}
    </div>
  `;

  container.innerHTML = html;
}

function handleChildSubmitTask(taskId) {
  const updated = store.submitTaskForApproval(taskId);
  if (updated) {
    try {
      triggerConfetti();
    } catch (e) {}
    showToast('Submitted for Parent Approval! 📬 Points will credit once approved.', 'success');
    renderApp();
  }
}

// ==========================================
// STUDENT HELP DIALOG
// ==========================================
function openChildHelpModal() {
  const modalHtml = `
    <div class="modal-overlay" id="child-help-modal" onclick="closeModalOnOutsideClick(event, 'child-help-modal')">
      <div class="modal-card" style="max-width: 440px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">⭐</span>
            <h3 class="modal-title" style="margin: 0;">How Kids Study Tracker Works!</h3>
          </div>
          <button class="modal-close" onclick="closeModal('child-help-modal')">✕</button>
        </div>

        <div style="font-size: 13px; line-height: 1.5; color: var(--text-main); display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 11px 13px;">
            <div style="font-weight: 800; color: var(--primary); margin-bottom: 3px;">1. My Dashboard &amp; All Tasks 📊</div>
            <div>Use <strong>"My Dashboard"</strong> to check your 7-Day Study Journey, streak, and subject focus. Tap <strong>"All Tasks"</strong> to see your full study checklist anytime!</div>
          </div>

          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 11px 13px;">
            <div style="font-weight: 800; color: #f59e0b; margin-bottom: 3px;">2. Build Daily Study Streaks 🔥</div>
            <div>Studying every day keeps your study streak alive and helps you earn more stars toward your weekend prize!</div>
          </div>

          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 11px 13px;">
            <div style="font-weight: 800; color: #16a34a; margin-bottom: 3px;">3. Submit for Approval 📬</div>
            <div>When you finish an assignment, tap <strong>"Submit for Parent Approval"</strong>. Your parents will review your work and award reward stars!</div>
          </div>

          <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 11px 13px;">
            <div style="font-weight: 800; color: #8b5cf6; margin-bottom: 3px;">4. Trophy Cabinet &amp; Weekend Prizes 🏆</div>
            <div>Reach your weekend star goal to unlock your prize! Click <strong>"Open Trophy Case"</strong> on your dashboard to see all your won rewards and praise stickers.</div>
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
