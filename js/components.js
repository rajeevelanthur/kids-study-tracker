/**
 * Kids Study Tracker - Reusable UI Components
 * - Common Task Card Renderer (Parent View vs Child View)
 */

function renderTaskCard(task, isParent) {
  const isCompleted = task.status === 'completed';
  const isSubmitted = task.status === 'submitted';
  const currentWeek = getCurrentStudyWeek();
  const isCarriedOver = !isCompleted && task.date < currentWeek.mondayStr;
  const isOverdue = !isCompleted && !isSubmitted && task.date < TODAY_STR;

  return `
    <div class="task-card ${isCompleted ? 'completed' : ''} ${isSubmitted ? 'submitted' : ''} ${isOverdue ? 'overdue' : ''}" id="task-${task.id}">
      <div class="task-card-header">
        <span class="task-subject">
          <span>${task.subjectIcon || '📚'}</span>
          <span>${task.subjectName}</span>
        </span>

        <div class="task-card-header-badges">
          ${isCompleted ? `
            <span class="badge-status completed">✓ Approved</span>
          ` : (
            isSubmitted ? `
              <span class="badge-status submitted">🔔 Awaiting Approval</span>
            ` : (
              task.revisionReason ? `
                <span class="badge-status" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a;">🔄 Revision Needed</span>
              ` : (
                isCarriedOver ? `
                  <span class="badge-status overdue">⚠️ Carried Over (${formatDisplayDate(task.date)})</span>
                ` : (
                  isOverdue ? `
                    <span class="badge-status overdue">⚠️ Pending from ${formatDisplayDate(task.date)}</span>
                  ` : `
                    <span class="badge-status pending-today">⏳ Due Today</span>
                  `
                )
              )
            )
          )}
          <span class="task-points-pill">
            ⭐ +${task.points} Pts
          </span>
        </div>
      </div>

      <!-- Task Title (Strictly no strikethrough) -->
      <div class="task-title">
        ${task.title}
      </div>

      ${!isCompleted && !isSubmitted && task.revisionReason ? `
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: var(--radius-sm); padding: 9px 12px; margin: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 20px; line-height: 1;">🔄</span>
          <div style="flex: 1; font-size: 12.5px;">
            <div style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
              Parent Requested Revision:
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 2px;">
              "${escapeHtml(task.revisionReason)}"
            </div>
          </div>
        </div>
      ` : ''}

      <div class="task-date-info">
        <span>📅 Assigned for: <strong>${formatDisplayDate(task.date)}</strong></span>
        ${isCarriedOver ? `<span style="color: var(--danger); font-weight: 700;">(Previous Week Task)</span>` : ''}
      </div>

      ${isSubmitted && task.submittedAt ? `
        <div class="task-submitted-info">
          <span>📬 Submitted by student on ${formatDisplayDateTime(task.submittedAt)}</span>
        </div>
      ` : ''}

      ${isCompleted && task.completedAt ? `
        <div class="task-completed-info">
          <span>✅ Parent Approved on: ${formatDisplayDateTime(task.completedAt)}</span>
        </div>
      ` : ''}

      ${isCompleted && (task.sticker || task.parentRemark) ? `
        <div style="background: linear-gradient(135deg, rgba(254, 243, 199, 0.55) 0%, rgba(253, 230, 138, 0.28) 100%); border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 9px 12px; margin: 8px 0 6px 0; display: flex; align-items: flex-start; gap: 10px;">
          <div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));">
            ${task.sticker || '⭐'}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Parent's Sticker:</span>
              <span style="font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 7px; border-radius: 99px;">
                ${escapeHtml(task.stickerText || 'Great Job!')}
              </span>
            </div>
            ${task.parentRemark ? `
              <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 3px; font-style: italic;">
                "${escapeHtml(task.parentRemark)}"
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Parent Approval Control Bar if Task is Submitted -->
      ${isParent && isSubmitted ? `
        <div class="parent-approval-box">
          <span style="font-size: 13px; font-weight: 700; color: #6b21a8;">
            Student finished this task! Ready to approve?
          </span>
          <div style="display: flex; gap: 8px;">
            <button class="btn-approve" onclick="openParentApproveModal('${task.id}')">
              ✅ Approve (+${task.points} pts)
            </button>
            <button class="btn-reject" onclick="handleParentRejectTask('${task.id}')" title="Ask child to redo task">
              🔄 Needs Revision
            </button>
          </div>
        </div>
      ` : ''}

      <div class="task-meta">
        <span class="task-type-badge">
          🏷️ ${task.taskTypeName || task.taskType}
        </span>

        ${isParent ? `
          <div class="task-actions-group">
            <button class="btn" style="width: auto; padding: 4px 10px; font-size: 12px; background: var(--bg-surface-alt); color: var(--text-main); border: 1px solid var(--border-color);" onclick="handleDuplicateTask('${task.id}')" title="Copy subject and details to Assign Task form">
              📋 Duplicate
            </button>
            ${!isCompleted ? `
              <button class="btn" style="width: auto; padding: 4px 10px; font-size: 12px; background: var(--slate-100); color: var(--slate-800); border: 1px solid var(--slate-300);" onclick="openEditTaskModal('${task.id}')">
                ✏️ Edit Task
              </button>
            ` : ''}
            <button class="btn-outline-danger" style="padding: 4px 10px; font-size: 12px;" onclick="handleDeleteTask('${task.id}')">
              🗑️ Delete
            </button>
          </div>
        ` : (
          !isCompleted && !isSubmitted ? `
            <button class="btn btn-submit-approval" style="width: auto;" onclick="handleChildSubmitTask('${task.id}')">
              📬 Submit for Parent Approval (+${task.points} pts)
            </button>
          ` : (
            isSubmitted ? `
              <span style="color: #6b21a8; font-weight: 700; font-size: 13px;">
                ⏳ Sent to Parent (Pending Approval)
              </span>
            ` : `
              <span style="color: var(--success-dark); font-weight: 700; font-size: 13px;">
                ✓ Points Awarded
              </span>
            `
          )
        )}
      </div>
    </div>
  `;
}
