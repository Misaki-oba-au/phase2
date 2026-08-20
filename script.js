const STORAGE_KEY = "ai-task-manager.data";
const STATUS_ORDER = ["TODO", "Doing", "Waiting", "Delegated", "Review", "Done"];
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, Next: 3 };

const state = loadState();
let currentView = "This Week";
let selectedDate = todayIso();
let activeMonth = new Date(`${selectedDate}T12:00:00`);
activeMonth.setDate(1);
let calendarFilter = "all";

const elements = {
  taskList: document.getElementById("task-list"), taskForm: document.getElementById("task-form"),
  taskTitle: document.getElementById("task-title"), taskOutcome: document.getElementById("task-outcome"),
  taskOwner: document.getElementById("task-owner"), taskPriority: document.getElementById("task-priority"),
  taskDue: document.getElementById("task-due"), taskEstimate: document.getElementById("task-estimate"),
  taskStatus: document.getElementById("task-status"), taskNext: document.getElementById("task-next"),
  taskFollowUp: document.getElementById("task-follow-up"), taskDependency: document.getElementById("task-dependency"),
  projectFilter: document.getElementById("project-filter"), priorityFilter: document.getElementById("priority-filter"),
  statusFilter: document.getElementById("status-filter"), search: document.getElementById("task-search"),
  taskCount: document.getElementById("task-count"), capacity: document.getElementById("capacity-value"),
  calendarMonth: document.getElementById("calendar-month"), calendarGrid: document.getElementById("calendar-grid"),
  projectList: document.getElementById("project-list"), memberList: document.getElementById("member-list"),
  projectForm: document.getElementById("project-form"), projectName: document.getElementById("project-name"),
  memberForm: document.getElementById("member-form"), memberName: document.getElementById("member-name"),
  reportOutput: document.getElementById("report-output")
  , memberPanel: document.getElementById("member-panel"), memberPanelTitle: document.getElementById("member-panel-title"), memberPanelContent: document.getElementById("member-panel-content")
  , calendarLoad: document.getElementById("calendar-load")
};

function todayIso() { return new Date().toISOString().slice(0, 10); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && (saved.initialized || (saved.tasks && saved.tasks.length))) {
      const hydrated = normalizeTaskKinds(addCalendarTasks({ tasks: saved.tasks || [], projects: saved.projects || [], members: saved.members || [] }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...hydrated, initialized: true }));
      return hydrated;
    }
  } catch (error) { console.warn("Unable to load saved tasks", error); }
  const initial = normalizeTaskKinds(addCalendarTasks({ tasks: createInitialTasks(), projects: ["Consignment Program", "Operations", "Product", "People"], members: ["Sarah", "Corporate", "松浦さん / Legal", "Setara", "関係者", "朴さん"] }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initial, initialized: true }));
  return initial;
}
function createInitialTasks() {
  const tasks = [
    ["Consignment Program推進", "Consignment Programを1年間継続して推進する", "琳琳", "P0", "2027-08-20", "Doing", "継続して全体推進", "", "", 1],
    ["Consignment Agreement英語版", "英語版Agreementを承認済みにする", "琳琳", "P0", "2026-08-31", "TODO", "Draft → 松浦さん/Legal → Jobcan", "", "松浦さん / Legal", 2],
    ["Jobcan申請・承認完了", "Jobcan申請を承認完了まで追跡する", "琳琳 / Corporate", "P0", "2026-08-31", "TODO", "Agreementレビュー後すぐ申請。申請で終わらず承認完了まで追跡", "", "Consignment Agreement英語版", 1.5],
    ["最低限のTest Operation Flow", "9月Pilotで実際に使える最小Flowを完成させる", "琳琳", "P0", "2026-08-26", "TODO", "9月Pilotで使える最小Flowを定義・確認", "", "", 3],
    ["Product Sample Sheet更新", "RB資料へ更新内容を反映する", "琳琳 / Sarah Input", "P0", "2026-08-26", "TODO", "午前中に更新してRB資料へ反映", "", "SarahからのInput", 2],
    ["商品Status / 費用 / 管理区分案", "Status・費用・管理区分のProposalを作成する", "琳琳", "P0", "2026-08-26", "TODO", "Proposal化 → RB確認", "", "", 2],
    ["RB Deck / 関連資料", "RB Deckと関連資料のDraftを確定する", "琳琳", "P0", "2026-08-26", "TODO", "午前中にDraft確定、午後にFinal", "", "", 3],
    ["Rocky候補Review", "Rocky候補を関係者とレビューする", "琳琳 / 関係者", "P1", "2026-08-25", "TODO", "火曜Review", "", "関係者", 1.5],
    ["EC更新 / 画像Quality / MenuのRB準備", "RB向けの報告と確認事項を整理する", "琳琳 / Setara", "P1", "2026-08-26", "TODO", "RB報告・確認事項化", "", "Setara", 2],
    ["朴さんWeekly Agenda準備", "Weekly Agendaの判断・報告事項を整理する", "琳琳", "P1", "2026-08-25", "TODO", "18:00前に判断・報告事項を整理", "", "朴さん", 1],
    ["琳琳×Sarah Delegated確認", "Product Operationに関するDelegated事項を確認する", "琳琳 / Sarah", "P1", "2026-08-25", "Delegated", "Product Operationのみ確認", "", "Sarah", 0.5],
    ["Delegated Task回収", "各Ownerの未提出タスクを回収する", "各Owner → 琳琳", "P1", "2026-08-25", "Delegated", "未提出は当日Follow-up", "2026-08-25", "各Owner", 1],
    ["Follow-up枠", "Delegated事項の確認をまとめて処理する", "琳琳", "P1", "2026-08-26", "TODO", "25日・26日のFollow-upを30分でまとめて処理", "2026-08-25", "Delegated Task回収", 0.5]
  ];
  return tasks.map((task, index) => ({ id: 1724100000000 + index, title: task[0], outcome: task[1], owner: task[2], priority: task[3], due: task[4], status: task[5], nextAction: task[6], followUp: task[7], dependency: task[8], estimate: task[9], project: "Consignment Program", createdAt: todayIso() }));
}
function addCalendarTasks(base) {
  const schedule = [
    ["08:00–08:30 Follow-up 30分", "Agreement / Legal / Jobcan、Sarah、Setara / Devなど8/25回収期限案件を一括確認", "琳琳", "2026-08-25", "Doing", "回収期限案件をまとめて確認", 0.5],
    ["09:00–10:00 琳琳×Sarah Weekly", "Delegated Product Task回収・不足確認", "琳琳 / Sarah", "2026-08-25", "Doing", "Product Taskの不足を確認", 1],
    ["10:00–11:00 Product Sample Sheet + Proposal", "Product Sample Sheetと商品Status / 費用 / 管理区分Proposalを作成", "琳琳", "2026-08-25", "TODO", "Sample SheetとProposalを同じ時間帯で作成", 1],
    ["11:00–12:00 S&L Right-Brain Tasks Discussion", "Rocky候補Reviewをこの固定MTG内で実施", "琳琳 / 関係者", "2026-08-25", "Doing", "Rocky候補をReview", 1],
    ["13:00–13:30 EC Op MTG", "画像Quality / Menu / 更新状況の情報回収", "琳琳 / Setara", "2026-08-25", "Doing", "RB整理に必要な情報を回収", 0.5],
    ["13:30–14:30 Consignment Test Operation Flow", "9月Pilotで使える最小Flowを作成", "琳琳", "2026-08-25", "TODO", "最小Flowを実際に使える形にする", 1],
    ["14:30–15:30 EC更新・画像Quality・Menu修正", "EC更新内容をRB用に整理", "琳琳 / Setara", "2026-08-25", "TODO", "EC Op MTGの回収情報をRB向けに整理", 1],
    ["15:30–16:30 RB Deck Draft作成", "Consignment / Product / Rocky / ECの回収情報をRB Deckへ反映", "琳琳", "2026-08-25", "TODO", "RB Deck Draftを作成", 1],
    ["16:30–17:00 朴さんWeekly Agenda準備", "判断・報告事項を整理", "琳琳", "2026-08-25", "TODO", "18:00前にAgendaを完成", 0.5],
    ["17:00–18:00 Buffer", "Delegated未回収やRB Deck遅れに使用。問題なければ前倒し終了", "琳琳", "2026-08-25", "TODO", "未回収・遅延がある場合だけ使用", 1],
    ["18:00–18:30 朴さんWeekly", "固定Weekly meeting", "琳琳 / 朴さん", "2026-08-25", "Doing", "整理した判断・報告事項を共有", 0.5],
    ["08:00–09:00 RB Deck / 関連資料 Draft確定", "午前確定のDeadlineを守る", "琳琳", "2026-08-26", "TODO", "RB Deck Draftと関連資料を確定", 1],
    ["09:00–10:00 UMAUMA Consignment & Network Weekly", "固定Weekly meeting。Tasklist / Mailは重複のため削除", "琳琳", "2026-08-26", "Doing", "Consignment Weeklyを固定優先", 1],
    ["10:00–10:30 Follow-up 30分", "Agreement / Jobcan / 残Delegatedを確認", "琳琳", "2026-08-26", "TODO", "残案件だけをまとめてFollow-up", 0.5],
    ["10:30–11:00 在庫MTG", "固定Inventory meeting", "琳琳", "2026-08-26", "Doing", "必要な在庫事項を確認", 0.5],
    ["11:00–12:00 RB関連資料 Final Content Check", "Product Sample Sheet / Test Flow / Status / Rocky / EC更新を確認", "琳琳", "2026-08-26", "TODO", "RB関連資料の不足を洗い出す", 1],
    ["13:00–13:15 All Member", "固定All Member meeting", "琳琳", "2026-08-26", "Doing", "共有事項を確認", 0.25],
    ["13:15–14:15 Agreement / Jobcan進捗＋RB資料不足対応", "Agreement / Jobcan進捗とRB資料の不足を処理", "琳琳", "2026-08-26", "TODO", "不足対応を完了", 1],
    ["14:30–15:30 Monthly Expense", "固定Monthly Expense meeting", "琳琳", "2026-08-26", "Doing", "Expense事項を確認", 1],
    ["15:30–16:30 RB Deck最終調整", "午後の1時間でRB Deckを最終調整", "琳琳", "2026-08-26", "TODO", "RB Deck最終調整を完了", 1],
    ["16:30–17:30 RB Deck最終QA / 翌朝確認ポイント", "必要な場合だけ使うBuffer。順調なら前倒し終了", "琳琳", "2026-08-26", "TODO", "8/27朝に確認だけでMTGへ入れる状態", 1]
  ];
  const existingTitles = new Set(base.tasks.map((task) => task.title));
  const calendarTasks = schedule.filter((task) => !existingTitles.has(task[0])).map((task, index) => ({ id: 1724200000000 + index, title: task[0], outcome: task[1], owner: task[2], project: "Consignment Program", priority: "P0", due: task[3], status: task[4], nextAction: task[5], followUp: "", dependency: "", estimate: task[6], fixed: true, createdAt: todayIso() }));
  return { ...base, tasks: [...base.tasks, ...calendarTasks], projects: base.projects.includes("Consignment Program") ? base.projects : ["Consignment Program", ...base.projects] };
}
function getTaskKind(task) {
  if (task.kind) return task.kind;
  return task.fixed && /Weekly|MTG|Discussion|Member|Expense/.test(task.title) ? "meeting" : "self";
}
function normalizeTaskKinds(base) {
  return { ...base, tasks: base.tasks.map((task) => ({ ...task, priority: task.priority === "Next" ? "P3" : task.priority, kind: getTaskKind(task) })) };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, initialized: true })); }
function formatDate(date) { return date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"; }
function getWeekStart(date) { const result = new Date(`${date}T12:00:00`); result.setDate(result.getDate() - result.getDay()); return result.toISOString().slice(0, 10); }
function getWeekEnd(date) { const result = new Date(`${getWeekStart(date)}T12:00:00`); result.setDate(result.getDate() + 6); return result.toISOString().slice(0, 10); }
function addDays(date, days) { const result = new Date(`${date}T12:00:00`); result.setDate(result.getDate() + days); return result.toISOString().slice(0, 10); }
function inCurrentWeek(task) { return task.due >= selectedDate && task.due <= addDays(selectedDate, 7); }
function escapeHtml(value) { return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }

function getVisibleTasks() {
  let tasks = state.tasks.filter((task) => {
    if (currentView === "This Week") return inCurrentWeek(task) && task.status !== "Done";
    if (currentView === "Delegated / Waiting") return ["Delegated", "Waiting"].includes(task.status);
    if (currentView === "Next Week") return task.due > addDays(selectedDate, 7) && task.due <= addDays(selectedDate, 14) && task.status !== "Done";
    return task.status === "Done";
  });
  const search = elements.search.value.trim().toLowerCase();
  if (search) tasks = tasks.filter((task) => `${task.title} ${task.outcome} ${task.nextAction}`.toLowerCase().includes(search));
  if (elements.projectFilter.value) tasks = tasks.filter((task) => task.project === elements.projectFilter.value);
  if (elements.priorityFilter.value) tasks = tasks.filter((task) => task.priority === elements.priorityFilter.value);
  if (elements.statusFilter.value) tasks = tasks.filter((task) => task.status === elements.statusFilter.value);
  return tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) || (a.due || "").localeCompare(b.due || ""));
}
function taskTemplate(task) {
  return `<article class="task-card task-card--${task.priority.toLowerCase()} ${task.status === "Done" ? "task-card--done" : ""}" data-id="${task.id}">
    <div class="task-card__top"><span class="priority priority--${task.priority.toLowerCase()}">${task.priority}</span><span class="task-card__project">${escapeHtml(task.project || "Unassigned project")}</span><button class="icon-button" data-action="delete" title="Delete task">×</button></div>
    <h3>${escapeHtml(task.title)}</h3><p class="task-card__outcome">${escapeHtml(task.outcome || "Define the outcome for this task")}</p>
    <div class="task-card__meta"><span>◷ ${formatDate(task.due)}</span><span>${task.estimate || 0}h</span><span>Owner: ${escapeHtml(task.owner || "You")}</span></div>
    <div class="task-card__details"><span><b>Next:</b> ${escapeHtml(task.nextAction || "Decide next action")}</span>${task.followUp ? `<span><b>Follow-up:</b> ${formatDate(task.followUp)}</span>` : ""}${task.dependency ? `<span><b>Dependency:</b> ${escapeHtml(task.dependency)}</span>` : ""}</div>
    <div class="task-card__bottom"><select data-action="status" aria-label="Task status">${STATUS_ORDER.map((status) => `<option ${status === task.status ? "selected" : ""}>${status}</option>`).join("")}</select><button class="text-button" data-action="edit">Edit task</button></div>
  </article>`;
}
function renderTasks() {
  const tasks = getVisibleTasks();
  elements.taskList.innerHTML = tasks.length ? tasks.map(taskTemplate).join("") : `<div class="empty-state"><strong>No tasks in this view</strong><span>Add a task or change the filters to keep momentum.</span></div>`;
  elements.taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  const scheduled = state.tasks.filter((task) => task.due === selectedDate && task.status !== "Done").reduce((sum, task) => sum + Number(task.estimate || 0), 0);
  elements.capacity.textContent = `${Math.max(0, 8 - scheduled).toFixed(1)}h available today`;
  renderCalendar();
}
function renderCalendar() {
  elements.calendarMonth.textContent = activeMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const year = activeMonth.getFullYear(), month = activeMonth.getMonth(), firstDay = new Date(year, month, 1).getDay(), days = new Date(year, month + 1, 0).getDate();
  elements.calendarGrid.innerHTML = Array.from({ length: firstDay + days }, (_, index) => {
    if (index < firstDay) return `<div class="calendar-day calendar-day--empty"></div>`;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(index - firstDay + 1).padStart(2, "0")}`;
    const tasks = state.tasks.filter((task) => task.due === date && (calendarFilter === "all" || getTaskKind(task) === calendarFilter));
    return `<button class="calendar-day ${date === selectedDate ? "calendar-day--selected" : ""}" data-date="${date}"><b>${index - firstDay + 1}</b>${tasks.slice(0, 2).map((task) => `<small>${escapeHtml(task.title)}</small>`).join("")}</button>`;
  }).join("");
  const dayTasks = state.tasks.filter((task) => task.due === selectedDate && task.status !== "Done");
  const meetingHours = dayTasks.filter((task) => getTaskKind(task) === "meeting").reduce((sum, task) => sum + Number(task.estimate || 0), 0);
  const selfHours = dayTasks.filter((task) => getTaskKind(task) === "self").reduce((sum, task) => sum + Number(task.estimate || 0), 0);
  elements.calendarLoad.textContent = `${formatHours(meetingHours)} meetings  ·  ${formatHours(selfHours)} self tasks  ·  ${formatHours(Math.max(0, 8 - meetingHours - selfHours))} open`;
}
function formatHours(hours) { return `${Number(hours).toFixed(hours % 1 ? 2 : 0)}h`; }
function populateOptions() {
  elements.projectFilter.innerHTML = `<option value="">All projects</option>${state.projects.map((project) => `<option>${escapeHtml(project)}</option>`).join("")}`;
  elements.taskOwner.innerHTML = `<option value="">You</option>${state.members.map((member) => `<option>${escapeHtml(member)}</option>`).join("")}`;
  elements.memberList.innerHTML = state.members.length ? state.members.map((member) => `<li><button class="member-link" data-member="${escapeHtml(member)}">${escapeHtml(member)}</button></li>`).join("") : "<li class='muted'>No delegated owners yet</li>";
  elements.projectList.innerHTML = state.projects.map((project) => `<li>${escapeHtml(project)}</li>`).join("");
}
function taskLine(task) { return `<li><b>${escapeHtml(task.title)}</b><small>${formatDate(task.due)} · ${escapeHtml(task.nextAction || task.outcome || "No next action")}</small></li>`; }
function renderMemberPanel(member) {
  const related = state.tasks.filter((task) => `${task.owner} ${task.dependency} ${task.title} ${task.outcome}`.toLowerCase().includes(member.toLowerCase()));
  const waitingForThem = related.filter((task) => String(task.owner || "").toLowerCase().includes(member.toLowerCase()) && ["Delegated", "Waiting"].includes(task.status) && task.status !== "Done");
  const waitingForYou = related.filter((task) => String(task.dependency || "").toLowerCase().includes(member.toLowerCase()) && task.status !== "Done");
  const touchpoints = related.filter((task) => getTaskKind(task) === "meeting" && task.due >= selectedDate && task.status !== "Done").sort((a, b) => a.due.localeCompare(b.due));
  elements.memberPanelTitle.textContent = member;
  elements.memberPanelContent.innerHTML = `<p class="member-panel__intro">Shared context for your next conversation.</p><div class="member-panel__section"><h3>Waiting for ${escapeHtml(member)}</h3><ul>${waitingForThem.length ? waitingForThem.map(taskLine).join("") : "<li class='muted'>Nothing currently waiting</li>"}</ul></div><div class="member-panel__section"><h3>${escapeHtml(member)} waiting for you</h3><ul>${waitingForYou.length ? waitingForYou.map(taskLine).join("") : "<li class='muted'>No response requested</li>"}</ul></div><div class="member-panel__section"><h3>Next touchpoint / meeting</h3><ul>${touchpoints.length ? touchpoints.slice(0, 3).map(taskLine).join("") : "<li class='muted'>No upcoming meeting saved</li>"}</ul></div>`;
  elements.memberPanel.classList.remove("hidden");
}
function addTask(event) {
  event.preventDefault();
  const task = { id: Date.now(), title: elements.taskTitle.value.trim(), outcome: elements.taskOutcome.value.trim(), owner: elements.taskOwner.value, project: elements.projectFilter.value || "Operations", priority: elements.taskPriority.value, due: elements.taskDue.value || selectedDate, estimate: elements.taskEstimate.value || 1, status: elements.taskStatus.value, nextAction: elements.taskNext.value.trim(), followUp: elements.taskFollowUp.value, dependency: elements.taskDependency.value.trim(), kind: "self", createdAt: todayIso() };
  if (!task.title) return;
  state.tasks.unshift(task); saveState(); event.target.reset(); elements.taskDue.value = selectedDate; renderTasks();
}
function handleTaskAction(event) {
  const control = event.target.closest("[data-action]"), card = event.target.closest("[data-id]");
  if (!control || !card) return;
  const task = state.tasks.find((item) => item.id === Number(card.dataset.id));
  if (!task) return;
  if (control.dataset.action === "delete" && confirm("Delete this task?")) state.tasks = state.tasks.filter((item) => item.id !== task.id);
  if (control.dataset.action === "status") task.status = control.value;
  if (control.dataset.action === "edit") {
    elements.taskTitle.value = task.title; elements.taskOutcome.value = task.outcome; elements.taskOwner.value = task.owner; elements.taskPriority.value = task.priority; elements.taskDue.value = task.due; elements.taskEstimate.value = task.estimate; elements.taskStatus.value = task.status; elements.taskNext.value = task.nextAction; elements.taskFollowUp.value = task.followUp; elements.taskDependency.value = task.dependency;
    state.tasks = state.tasks.filter((item) => item.id !== task.id); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  saveState(); renderTasks();
}
function addCollectionItem(event, collection, input) { event.preventDefault(); const value = input.value.trim(); if (!value || state[collection].includes(value)) return; state[collection].push(value); input.value = ""; saveState(); populateOptions(); }
function renderReport() {
  const done = state.tasks.filter((task) => task.status === "Done"), active = state.tasks.filter((task) => task.status !== "Done");
  elements.reportOutput.textContent = `Completed Today\n- ${done.filter((task) => task.due === selectedDate).map((task) => task.title).join("\n- ") || "Nothing logged yet"}\n\nProgress\n- ${active.slice(0, 3).map((task) => `${task.title} (${task.priority}) - Next: ${task.nextAction || "Continue"}`).join("\n- ") || "No active tasks"}\n\nTomorrow\n- Review the next priority tasks and confirm follow-ups.`;
}

elements.taskForm.addEventListener("submit", addTask);
elements.taskList.addEventListener("click", handleTaskAction);
elements.taskList.addEventListener("change", handleTaskAction);
[elements.projectFilter, elements.priorityFilter, elements.statusFilter, elements.search].forEach((element) => element.addEventListener("input", renderTasks));
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { currentView = button.dataset.view; document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button)); document.getElementById("list-title").textContent = currentView; renderTasks(); }));
document.getElementById("prev-month").addEventListener("click", () => { activeMonth.setMonth(activeMonth.getMonth() - 1); renderCalendar(); });
document.getElementById("next-month").addEventListener("click", () => { activeMonth.setMonth(activeMonth.getMonth() + 1); renderCalendar(); });
elements.calendarGrid.addEventListener("click", (event) => { const day = event.target.closest("[data-date]"); if (day) { selectedDate = day.dataset.date; elements.taskDue.value = selectedDate; renderTasks(); } });
elements.projectForm.addEventListener("submit", (event) => addCollectionItem(event, "projects", elements.projectName));
elements.memberForm.addEventListener("submit", (event) => addCollectionItem(event, "members", elements.memberName));
elements.memberList.addEventListener("click", (event) => { const button = event.target.closest("[data-member]"); if (button) renderMemberPanel(button.dataset.member); });
document.getElementById("member-panel-close").addEventListener("click", () => elements.memberPanel.classList.add("hidden"));
document.querySelectorAll("[data-calendar-filter]").forEach((button) => button.addEventListener("click", () => { calendarFilter = button.dataset.calendarFilter; document.querySelectorAll("[data-calendar-filter]").forEach((item) => item.classList.toggle("active", item === button)); renderCalendar(); }));
document.getElementById("report-button").addEventListener("click", renderReport);
document.getElementById("today-button").addEventListener("click", () => { selectedDate = todayIso(); activeMonth = new Date(`${selectedDate}T12:00:00`); activeMonth.setDate(1); elements.taskDue.value = selectedDate; renderTasks(); });

populateOptions();
elements.taskDue.value = selectedDate;
renderTasks();
