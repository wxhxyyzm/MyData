import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFoyerPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    Promise.all([
      supabase.from('foyer_todos').select('id', { count: 'exact', head: true }).eq('done', false),
      supabase.from('foyer_notes').select('id', { count: 'exact', head: true }),
    ]).then(([todos, notes]) => {
      const tc = todos.count || 0;
      const nc = notes.count || 0;
      if (tc === 0 && nc === 0) { setPreview('还没有记录'); return; }
      const parts = [];
      if (tc > 0) parts.push(`${tc} 项待办`);
      if (nc > 0) parts.push(`${nc} 条灵感`);
      setPreview(parts.join(' · '));
    }).catch(() => setPreview(null));
  }, []);

  return preview;
}
