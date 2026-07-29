import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

/**
 * Shared building blocks for the login screen's dark "pill" style. The login
 * form is bespoke (not shadcn inputs), so these mirror the shared ui inputs
 * in the pill look instead of reusing them.
 */

const PILL_CLASS =
  'flex items-center dark:bg-[#1A2535] bg-[#1E293B] border-transparent rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981]';
const INPUT_CLASS =
  'login-input bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] text-[#E2E8F0]';
const LABEL_CLASS =
  'block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]';

interface PillFieldProps extends Omit<React.ComponentProps<'input'>, 'className'> {
  label: string;
  icon: ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>;
  /** Extra classes for the <input> (e.g. code-tracking). */
  inputClassName?: string;
  /** Optional element after the input (e.g. the password visibility toggle). */
  trailing?: ReactNode;
}

/** Labelled pill input with a leading icon. */
export function PillField({
  label,
  icon: Icon,
  inputClassName = '',
  trailing,
  ...inputProps
}: PillFieldProps) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className={PILL_CLASS}>
        <Icon size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
        <input className={`${INPUT_CLASS} ${inputClassName}`} {...inputProps} />
        {trailing}
      </div>
    </div>
  );
}

/** One-time-code variant: numeric keyboard, wide letter-spacing. */
export function CodeField(props: Omit<PillFieldProps, 'inputClassName' | 'type'>) {
  return (
    <PillField
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="123456"
      inputClassName="tracking-[0.3em] placeholder:tracking-normal"
      required
      {...props}
    />
  );
}

/** Password pill with a show/hide toggle. */
export function PasswordField({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  minLength,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <PillField
      label={label}
      icon={Lock}
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      minLength={minLength}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="shrink-0 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}

/** Full-width green submit button with a loading spinner. */
export function SubmitButton({
  isLoading,
  icon: Icon,
  children,
  className = 'mt-2',
}: {
  isLoading: boolean;
  icon: ComponentType<{ size?: number | string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0DA271] text-white font-medium text-[14px] h-11 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Icon size={16} />
          {children}
        </>
      )}
    </button>
  );
}

/** Small teal text button (resend code, forgot password…). */
export function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[12px] font-medium text-[#10B981] hover:text-[#0DA271] transition-colors"
    >
      {children}
    </button>
  );
}

/** Muted "back" text button with a left arrow. */
export function BackButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[12px] dark:text-[#94A3B8] text-[#64748B] hover:text-[#10B981] transition-colors"
    >
      <ArrowLeft size={13} />
      {children}
    </button>
  );
}

/** Round icon badge + helper text shown above verify/forgot/reset forms. */
export function StepIntro({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center mb-2">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#10B981]/10">
        <Icon size={22} style={{ color: '#10B981' }} />
      </div>
      <p className="text-[13px] dark:text-[#94A3B8] text-[#64748B]">{children}</p>
    </div>
  );
}
