import { getCalorieStatus, getCalorieTarget, getExercisePlan } from '../plans';
import { formatDate, getWeekday } from '../../../lib/utils';

export default function OverviewTab({ phase, dates, logMap, onSelectDate }) {
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));

  return (
    <div className="px-5 animate-in" style={{ paddingTop: 12, paddingBottom: 16 }}>
      {/* Targets */}
      <div className="card p-4 mb-3 mt-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>目标</div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{phase.targets}</div>
      </div>

      {/* Calories plan */}
      <div className="card p-4 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>热量安排</div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{phase.weeklyCalories}</div>
        <div className="mt-2 pt-2 text-xs" style={{ borderTop: '1px dashed var(--line)', color: 'var(--ink-faint)' }}>
          ⚠️ 饮食严格控制 · 运动建议为主，不必死磕
        </div>
      </div>

      {/* Color legend */}
      <div className="card p-3 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>格子颜色说明</div>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--ink-soft)' }}>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)', display: 'inline-block' }} />
            热量正常
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444', display: 'inline-block' }} />
            超标10%以上
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#eab308', display: 'inline-block' }} />
            过低（&lt;2/3）
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg)', border: '1px solid var(--line)', display: 'inline-block' }} />
            未打卡
          </span>
        </div>
      </div>

      {/* Week grids */}
      {weeks.map((week, wi) => {
        const calStatuses = week.map((d) => {
          const log = logMap[d];
          if (!log?.calories) return null;
          return getCalorieStatus(log.calories, getCalorieTarget(d));
        });
        const overCount = calStatuses.filter((s) => s === 'over').length;
        const underCount = calStatuses.filter((s) => s === 'under').length;
        const filled = week.filter((d) => logMap[d]).length;

        return (
          <div key={wi} className="card p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">第 {wi + 1} 周</span>
              <span className="mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                {formatDate(week[0])}–{formatDate(week[week.length - 1])} · {filled}/{week.length}天
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {week.map((d) => {
                const log = logMap[d];
                const hasLog = !!log;
                const calStatus = log?.calories ? getCalorieStatus(log.calories, getCalorieTarget(d)) : null;
                let bg, color, border;
                if (calStatus === 'over') {
                  bg = '#ef4444'; color = 'white'; border = '1px solid #ef4444';
                } else if (calStatus === 'under') {
                  bg = '#eab308'; color = 'white'; border = '1px solid #eab308';
                } else if (calStatus === 'ok') {
                  bg = 'var(--accent)'; color = 'white'; border = '1px solid var(--accent)';
                } else if (hasLog) {
                  bg = 'var(--accent-soft)'; color = 'var(--accent)'; border = '1px solid var(--accent)';
                } else {
                  bg = 'var(--bg)'; color = 'var(--ink-faint)'; border = '1px solid var(--line)';
                }
                return (
                  <button
                    key={d}
                    title={log?.calories ? `热量 ${log.calories} / 目标 ${getCalorieTarget(d)}` : '未打卡'}
                    onClick={() => onSelectDate(d)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600,
                      background: bg, color, border, cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.85 }}>{getWeekday(d).slice(1)}</span>
                    <span>{new Date(d + 'T00:00:00').getDate()}</span>
                  </button>
                );
              })}
            </div>
            {(overCount > 0 || underCount > 0) && (
              <div className="mt-2 text-xs" style={{ color: 'var(--ink-faint)' }}>
                {overCount > 0 && <span style={{ color: '#ef4444', marginRight: 12 }}>⚠️ 超标 {overCount} 天</span>}
                {underCount > 0 && <span style={{ color: '#eab308' }}>⚠️ 过低 {underCount} 天</span>}
              </div>
            )}
          </div>
        );
      })}

      {/* Exercise reference */}
      <div className="card p-4 mb-3">
        <div className="text-xs mono uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>每周运动建议</div>
        <div className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>仅供参考，不必严格执行</div>
        <div className="text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 2 }}>
          <div><b>周一</b> 爬坡快走 40–50min</div>
          <div><b>周二</b> 力量 20–25min + 爬坡 25–30min</div>
          <div><b>周三</b> 爬坡快走 40–50min</div>
          <div><b>周四</b> 力量 20–25min + 爬坡 20–25min</div>
          <div><b>周五</b> 爬坡长距离 45–55min</div>
          <div><b>周六</b> 自选运动 40–60min 🎉</div>
          <div><b>周日</b> 低强度恢复 散步/轻爬坡</div>
        </div>
      </div>
    </div>
  );
}
