import { useEffect, useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../admin';

interface KpiCardProps {
  value: string;
  subtitle: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function AnimatedNumber({ value, duration = 800 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState('0');
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const prefix = value.startsWith('$') ? '$' : '';
    const suffix = value.includes('%') ? '%' : value.includes('nuevos') ? ' nuevos' : '';
    const isCurrency = prefix === '$';

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;

      if (isCurrency) {
        setDisplay('$' + Math.round(current).toLocaleString());
      } else {
        setDisplay(Math.round(current).toLocaleString() + suffix);
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return <span>{display}</span>;
}

export default function KpiCard({ value, subtitle, trend, trendUp, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  const { resolvedTheme: mode } = useTheme();

  return (
    <div
      className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default"
      style={{
        backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${
            trendUp
              ? 'bg-[#ECFDF5] text-[#059669]'
              : 'bg-[#FEF2F2] text-[#DC2626]'
          }`}
        >
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <p
        className="text-[28px] font-bold mt-3 leading-tight tracking-tight"
        style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
      >
        <AnimatedNumber value={value} />
      </p>
      <p className="text-[13px] mt-1" style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>
        {subtitle}
      </p>
    </div>
  );
}
