let notes = JSON.parse(localStorage.getItem('noted_notes') || '[]');
let activeNoteId = null;
let saveTimeout = null;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function saveNotes() {
  localStorage.setItem('noted_notes', JSON.stringify(notes));
}

function renderNotesList(filter = '') {
  const list = document.getElementById('notes-list');
  list.innerHTML = '';
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(filter.toLowerCase()) ||
    n.content.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item' + (note.id === activeNoteId ? ' active' : '');
    li.innerHTML = `
      <div class="note-item-title">${note.title || 'Untitled'}</div>
      <div class="note-item-preview">${note.content || 'No content'}</div>
      <div class="note-item-date">${formatDate(note.updatedAt)}</div>
    `;
    li.addEventListener('click', () => openNote(note.id));
    list.appendChild(li);
  });
}

function openNote(id) {
  activeNoteId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('empty-state').style.display = 'none';
  const editor = document.getElementById('editor');
  editor.classList.remove('hidden');

  document.getElementById('note-title').value = note.title;
  document.getElementById('note-content').value = note.content;
  document.getElementById('last-saved').textContent = 'Saved ' + formatDate(note.updatedAt);

  renderNotesList(document.getElementById('search-input').value);
}

function createNote() {
  const note = {
    id: generateId(),
    title: '',
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.unshift(note);
  saveNotes();
  renderNotesList();
  openNote(note.id);
  document.getElementById('note-title').focus();
}

function updateActiveNote() {
  if (!activeNoteId) return;
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;

  note.title = document.getElementById('note-title').value;
  note.content = document.getElementById('note-content').value;
  note.updatedAt = new Date().toISOString();
  saveNotes();

  document.getElementById('last-saved').textContent = 'Saved just now';
  renderNotesList(document.getElementById('search-input').value);
}

function deleteActiveNote() {
  if (!activeNoteId) return;
  notes = notes.filter(n => n.id !== activeNoteId);
  activeNoteId = null;
  saveNotes();
  renderNotesList();

  document.getElementById('editor').classList.add('hidden');
  document.getElementById('empty-state').style.display = '';
}

// Event listeners
document.getElementById('new-note-btn').addEventListener('click', createNote);
document.getElementById('delete-note-btn').addEventListener('click', deleteActiveNote);

document.getElementById('note-title').addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(updateActiveNote, 500);
});

document.getElementById('note-content').addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(updateActiveNote, 500);
});

document.getElementById('search-input').addEventListener('input', e => {
  renderNotesList(e.target.value);
});

// Init
renderNotesList();
if (notes.length > 0) openNote(notes[0].id);
