import { supabase } from '../../lib/supabase';
import { genId } from '../../lib/utils';

export async function loadAllLogs() {
  const { data, error } = await supabase.from('health_logs').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertLog(date, logData) {
  const { data: existing } = await supabase.from('health_logs').select('id').eq('date', date).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('health_logs').update({ data: logData }).eq('id', existing.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('health_logs').insert({ id: genId(), date, data: logData });
  if (error) throw error;
}

export async function deleteLog(date) {
  const { error } = await supabase.from('health_logs').delete().eq('date', date);
  if (error) throw error;
}
