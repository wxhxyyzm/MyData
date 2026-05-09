import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { daysBetween, todayStr } from '../lib/utils';

export function useBedroomPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    const today = todayStr();
    supabase
      .from('health_logs')
      .select('date')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setPreview(null);
          return;
        }
        if (!data || data.length === 0) {
          setPreview('还没开始记录');
          return;
        }

        if (data.some((log) => log.date === today)) {
          setPreview('今日已记录 ✓');
          return;
        }

        const lastDate = data[0].date;
        const days = daysBetween(lastDate, today);
        if (days === 1) setPreview('昨天有记录');
        else setPreview(`已 ${days} 天未记录`);
      });
  }, []);

  return preview;
}
