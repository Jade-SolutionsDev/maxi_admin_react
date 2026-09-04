import { useTheme } from '../admin';
import { WINDOW_OPTIONS, type WindowDays } from './window';

interface WindowSelectorProps {
  value: WindowDays;
  onChange: (days: WindowDays) => void;
  /** Disables the control while a window switch is in flight. */
  disabled?: boolean;
}

/**
 * Window picker for the KPI row. The options mirror the API's own whitelist, so
 * a click can never produce a 400 — an arbitrary number in the query string is
 * what that whitelist exists to prevent.
 */
export default function WindowSelector({
  value,
  onChange,
  disabled = false,
}: WindowSelectorProps) {
  const { resolvedTheme: mode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Periodo de las estadísticas"
      className="flex gap-1"
    >
      {WINDOW_OPTIONS.map((days) => {
        const active = days === value;
        return (
          <button
            key={days}
            type="button"
            onClick={() => onChange(days)}
            disabled={disabled}
            aria-pressed={active}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: active
                ? '#10B981'
                : mode === 'dark'
                  ? '#1A2535'
                  : '#F1F5F9',
              color: active
                ? '#FFFFFF'
                : mode === 'dark'
                  ? '#94A3B8'
                  : '#64748B',
            }}
          >
            {days}D
          </button>
        );
      })}
    </div>
  );
}
