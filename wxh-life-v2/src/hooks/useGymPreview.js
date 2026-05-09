import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export function useGymPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    supabase
      .from('workout_entries')
      .select('id, data')
      .order('id', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          setPreview(null);
          return;
        }
        if (!data || data.length === 0) {
          setPreview('还没开始记录');
          return;
        }

        const entry = data[0].data;
        const dateLabel = formatDate(entry.date);
        const detail = entry.type === 'cardio'
          ? `${entry.name} ${entry.duration}min`
          : `${entry.name} ${entry.sets}x${entry.reps}`;
        setPreview(`上次训练 · ${dateLabel} ${detail}`);
      });
  }, []);

  return preview;
}
