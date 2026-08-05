// Simple notepad app — beginner-friendly, no build step, no dependencies.
// Notes are stored in the browser's localStorage.

const STORAGE_KEY = "ainative.notes";

const input = document.getElementById("note-input");
const titleInput = document.getElementById("note-title");
const dateInput = document.getElementById("note-date");
const yesterdayBtn = document.getElementById("yesterday-btn");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("note-list");
const calendarMonth = document.getElementById("calendar-month");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarGrid = document.getElementById("calendar-grid");

let state = loadState();
let notes = state.notes;
let nextNumber = state.nextNumber;
let activeMonth = new Date();
activeMonth.setDate(1);

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      return {
        notes: stored.map((note, index) => ({ ...note, number: note.number || index + 1, title: note.title || "" })),
        nextNumber: stored.length + 1,
      };
    }

    if (stored && Array.isArray(stored.notes)) {
      return {
        notes: stored.notes.map((note) => ({ ...note, title: note.title || "" })),
        nextNumber: typeof stored.nextNumber === "number" ? stored.nextNumber : stored.notes.length + 1,
      };
    }
  } catch {
    // Continue to fallback.
  }

  return { notes: [], nextNumber: 1 };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, nextNumber }));
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getRelativeDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function addNote() {
  const title = titleInput.value.trim();
  const text = input.value.trim();
  if (!text) return;

  const date = dateInput.value || getTodayIso();
  notes.unshift({ id: Date.now(), number: nextNumber++, title, date, text });
  titleInput.value = "";
  input.value = "";
  dateInput.value = getTodayIso();
  saveState();
  render();
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveState();
  render();
}

function editNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  const updatedTitle = prompt("Edit title (optional):", note.title || "");
  if (updatedTitle === null) return;

  const updatedText = prompt("Edit note:", note.text);
  if (updatedText === null) return;

  note.title = updatedTitle.trim();
  note.text = updatedText.trim();
  saveState();
  render();
}

function formatMonth(date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function pad(number) {
  return number.toString().padStart(2, "0");
}

function getNotesByDate() {
  return notes.reduce((map, note) => {
    const listForDate = map[note.date] || [];
    listForDate.push(note);
    map[note.date] = listForDate;
    return map;
  }, {});
}

function renderCalendar() {
  calendarMonth.textContent = formatMonth(activeMonth);
  calendarGrid.innerHTML = "";

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayIso();
  const notesByDate = getNotesByDate();

  for (let i = 0; i < startDay; i += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar__day calendar__day--empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayNotes = notesByDate[date] || [];
    const cell = document.createElement("div");
    cell.className = "calendar__day";
    if (date === today) cell.classList.add("calendar__day--today");
    if (dayNotes.length > 0) cell.classList.add("calendar__day--has-notes");

    const label = document.createElement("span");
    label.textContent = day;
    cell.appendChild(label);

    cell.addEventListener("click", () => selectDate(date));

    if (dayNotes.length > 0) {
      const noteList = document.createElement("div");
      noteList.className = "calendar__note-list";
      dayNotes.forEach((note) => {
        const noteLabel = document.createElement("button");
        noteLabel.type = "button";
        noteLabel.className = "calendar__note-label";
        noteLabel.textContent = note.title ? `#${note.number} ${note.title}` : `#${note.number}`;
        noteLabel.addEventListener("click", (event) => {
          event.stopPropagation();
          scrollNoteToTop(note.id);
        });
        noteList.appendChild(noteLabel);
      });
      cell.appendChild(noteList);
    }

    calendarGrid.appendChild(cell);
  }
}

function selectDate(date) {
  dateInput.value = date;
  titleInput.focus();
}

function render() {
  list.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No notes yet. Add your first note above.";
    list.appendChild(empty);
  } else {
    const notesToDisplay = [...notes];
    for (const note of notesToDisplay) {
      const li = document.createElement("li");
      li.className = "note";

      const text = document.createElement("div");
      text.className = "note__text";

      const meta = document.createElement("div");
      meta.className = "note__meta";

      const title = document.createElement("div");
      title.className = "note__title";
      title.textContent = note.title ? `#${note.number} ${note.title}` : `#${note.number}`;

      const date = document.createElement("div");
      date.className = "note__date";
      date.textContent = note.date;

      const body = document.createElement("div");
      body.textContent = note.text;

      meta.append(title, date);
      text.append(meta, body);

      const actions = document.createElement("div");
      actions.className = "note__actions";

      const editBtn = document.createElement("button");
      editBtn.className = "note__btn note__btn--edit";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editNote(note.id));

      const delBtn = document.createElement("button");
      delBtn.className = "note__btn note__btn--delete";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteNote(note.id));

      actions.append(editBtn, delBtn);
      li.append(text, actions);
      list.appendChild(li);
    }
  }

  renderCalendar();
}

function scrollNoteToTop(id) {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return;

  const [note] = notes.splice(index, 1);
  notes.unshift(note);
  saveState();
  render();
}

function changeMonth(amount) {
  activeMonth.setMonth(activeMonth.getMonth() + amount);
  renderCalendar();
}

addBtn.addEventListener("click", addNote);
yesterdayBtn.addEventListener("click", () => {
  dateInput.value = getRelativeDate(-1);
  dateInput.focus();
});
prevMonthBtn.addEventListener("click", () => changeMonth(-1));
nextMonthBtn.addEventListener("click", () => changeMonth(1));
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
});

if (!dateInput.value) {
  dateInput.value = getTodayIso();
}

render();
