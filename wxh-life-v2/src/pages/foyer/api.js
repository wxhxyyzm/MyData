import { supabase } from '../../lib/supabase';
import { genId } from '../../lib/utils';

// ── Notes ──────────────────────────────────────────────
export async function loadNotes() {
  const { data, error } = await supabase
    .from('foyer_notes')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertNote({ content, date, mood, tags, keyword }) {
  const note = { id: genId(), content, date, mood: mood || null, tags: tags || [], keyword: keyword || null, created_at: new Date().toISOString() };
  const { error } = await supabase.from('foyer_notes').insert(note);
  if (error) throw error;
  return note;
}

export async function updateNote(id, patch) {
  const { error } = await supabase.from('foyer_notes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id) {
  const { error } = await supabase.from('foyer_notes').delete().eq('id', id);
  if (error) throw error;
}

// ── Lists ──────────────────────────────────────────────
export async function loadLists() {
  const { data, error } = await supabase
    .from('foyer_lists')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertList({ title, emoji, is_pinned = false }) {
  const list = { id: genId(), title, emoji: emoji || '📋', is_pinned, created_at: new Date().toISOString() };
  const { error } = await supabase.from('foyer_lists').insert(list);
  if (error) throw error;
  return list;
}

export async function deleteList(id) {
  const { error } = await supabase.from('foyer_lists').delete().eq('id', id);
  if (error) throw error;
}

// ── Todos ──────────────────────────────────────────────
export async function loadTodos(listId) {
  const { data, error } = await supabase
    .from('foyer_todos')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function loadAllTodoCounts() {
  const { data, error } = await supabase.from('foyer_todos').select('list_id, done');
  if (error) return {};
  const counts = {};
  (data || []).forEach(({ list_id, done }) => {
    if (!counts[list_id]) counts[list_id] = { total: 0, done: 0 };
    counts[list_id].total++;
    if (done) counts[list_id].done++;
  });
  return counts;
}

export async function loadPendingPreviews() {
  const { data, error } = await supabase
    .from('foyer_todos')
    .select('id, list_id, text')
    .eq('done', false)
    .order('created_at', { ascending: true });
  if (error) return {};
  const map = {};
  (data || []).forEach((todo) => {
    if (!map[todo.list_id]) map[todo.list_id] = [];
    if (map[todo.list_id].length < 5) map[todo.list_id].push(todo);
  });
  return map;
}

export async function insertTodo(listId, text) {
  const todo = { id: genId(), list_id: listId, text, done: false, created_at: new Date().toISOString() };
  const { error } = await supabase.from('foyer_todos').insert(todo);
  if (error) throw error;
  return todo;
}

export async function updateTodo(id, patch) {
  const { error } = await supabase.from('foyer_todos').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTodo(id) {
  const { error } = await supabase.from('foyer_todos').delete().eq('id', id);
  if (error) throw error;
}
