import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFoyerPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    Promise.all([
      supabase.from('foyer_notes').select('id', { count: 'exact', head: true }),
      supabase.from('foyer_lists').select('id', { count: 'exact', head: true }),
    ]).then(([notes, lists]) => {
      const nc = notes.count || 0;
      const lc = lists.count || 0;
      if (nc === 0 && lc === 0) { setPreview('还没有记录'); return; }
      setPreview(`${nc} 条灵感 · ${lc} 个清单`);
    }).catch(() => setPreview(null));
  }, []);

  return preview;
}
