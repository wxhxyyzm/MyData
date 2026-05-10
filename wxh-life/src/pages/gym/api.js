import { supabase } from '../../lib/supabase';

export async function loadEntries() {
  const { data, error } = await supabase
    .from('workout_entries')
    .select('id, data')
    .order('id', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row.data, id: row.id }));
}

export async function insertEntry(entry) {
  const { error } = await supabase.from('workout_entries').insert({ id: entry.id, data: entry });
  if (error) throw error;
}

export async function updateEntry(entry) {
  const { error } = await supabase.from('workout_entries').update({ data: entry }).eq('id', entry.id);
  if (error) throw error;
}

export async function deleteEntryById(id) {
  const { error } = await supabase.from('workout_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function loadCustom() {
  const { data, error } = await supabase
    .from('workout_custom')
    .select('data')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  const parsed = data?.data || {};
  return {
    cardio: Array.isArray(parsed.cardio) ? parsed.cardio : [],
    strength: Array.isArray(parsed.strength) ? parsed.strength : [],
    locations: Array.isArray(parsed.locations) ? parsed.locations : [],
  };
}

export async function saveCustom(custom) {
  const { error } = await supabase
    .from('workout_custom')
    .upsert({ id: 1, data: custom, updated_at: new Date().toISOString() });
  if (error) throw error;
}
