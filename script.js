// Simple notepad app — beginner-friendly, no build step, no dependencies.
// Notes are stored in the browser's localStorage.

const STORAGE_KEY = "ainative.notes";

const input = document.getElementById("note-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("note-list");

let notes = loadNotes();

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function addNote() {
  const text = input.value.trim();
  if (!text) return;
  notes.unshift({ id: Date.now(), text });
  input.value = "";
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  render();
}

function editNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  const updated = prompt("Edit note:", note.text);
  if (updated === null) return;
  note.text = updated.trim();
  saveNotes();
  render();
}

function render() {
  list.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No notes yet. Add your first note above.";
    list.appendChild(empty);
    return;
  }

  for (const note of notes) {
    const li = document.createElement("li");
    li.className = "note";

    const text = document.createElement("div");
    text.className = "note__text";
    text.textContent = note.text;

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

addBtn.addEventListener("click", addNote);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
});

render();
