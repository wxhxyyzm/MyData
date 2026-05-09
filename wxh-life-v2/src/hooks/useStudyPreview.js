import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { daysBetween, todayStr } from '../lib/utils';

export function useStudyPreview() {
  const [preview, setPreview] = useState(undefined);

  useEffect(() => {
    supabase
      .from('study_logs')
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

        const today = todayStr();
        const todayLogs = data.filter((log) => log.date === today);
        if (todayLogs.length > 0) {
          setPreview(`今日已打卡 · ${todayLogs.length} 项`);
          return;
        }

        const lastDate = data[0].date;
        const days = daysBetween(lastDate, today);
        if (days === 1) setPreview('上次打卡 · 昨天');
        else if (days < 7) setPreview(`上次打卡 · ${days}天前`);
        else setPreview(`已停滞 ${days} 天`);
      });
  }, []);

  return preview;
}
