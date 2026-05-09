import { supabase } from '../../lib/supabase';
import { genId } from '../../lib/utils';

export async function loadProjects() {
  const { data, error } = await supabase
    .from('study_projects')
    .select('*')
    .order('archived', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateProject(id, patch) {
  const { error } = await supabase.from('study_projects').update(patch).eq('id', id);
  if (error) throw error;
}

export async function loadLogs(projectId) {
  const { data, error } = await supabase
    .from('study_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertLog(log) {
  const { error } = await supabase.from('study_logs').insert(log);
  if (error) throw error;
}

export async function deleteLog(id) {
  const { error } = await supabase.from('study_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function loadNotes(projectId) {
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertNote(note) {
  const { error } = await supabase.from('study_notes').insert(note);
  if (error) throw error;
}

export async function updateNote(id, patch) {
  const { error } = await supabase.from('study_notes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id) {
  const { error } = await supabase.from('study_notes').delete().eq('id', id);
  if (error) throw error;
}

export async function loadModuleMeta(projectId) {
  const { data, error } = await supabase.from('study_module_meta').select('*').eq('project_id', projectId);
  if (error) throw error;
  return data || [];
}

export async function upsertModuleMeta(meta) {
  const { data: existing } = await supabase
    .from('study_module_meta')
    .select('id')
    .eq('project_id', meta.project_id)
    .eq('module_id', meta.module_id)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('study_module_meta')
      .update({ subtitle: meta.subtitle, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  }
  const id = genId();
  const { error } = await supabase.from('study_module_meta').insert({ ...meta, id, updated_at: new Date().toISOString() });
  if (error) throw error;
  return id;
}
