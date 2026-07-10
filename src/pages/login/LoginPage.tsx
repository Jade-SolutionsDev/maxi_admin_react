import { AlertCircle, WifiOff } from 'lucide-react';
import { NETWORK_MESSAGE } from './clerkErrors';
import { useSignInFlow, type Step } from './useSignInFlow';
import { CredentialsForm, ForgotForm, ResetForm, VerifyForm } from './steps';

const STEP_TITLES: Record<Step, string> = {
  credentials: 'Iniciar Sesión',
  verify: 'Verifica tu dispositivo',
  forgot: 'Recuperar contraseña',
  reset: 'Nueva contraseña',
};

/**
 * Custom Clerk login page (credentials → new-device verification, plus the
 * forgot/reset-password flow). All flow logic lives in useSignInFlow; the
 * per-step forms live in steps.tsx.
 */
export default function LoginPage() {
  const flow = useSignInFlow();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-[#161D27] bg-[#FFFFFF]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: '#10B981' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: '#0D9488' }}
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] rounded-2xl shadow-dropdown p-8 relative z-10 dark:bg-[#161D27] bg-[#FFFFFF]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-0 mb-2">
            <span className="text-[28px] font-extrabold tracking-tight dark:text-[#E2E8F0] text-[#1E293B]">
              maxi
            </span>
            <span
              className="text-[26px] font-normal tracking-tight"
              style={{ color: '#10B981' }}
            >
              Habana
            </span>
          </div>
          <p className="text-[14px] dark:text-[#94A3B8] text-[#64748B]">
            Panel de Administración
          </p>
        </div>

        <h1 className="text-[22px] font-semibold text-center mb-6 dark:text-[#E2E8F0] text-[#1E293B]">
          {STEP_TITLES[flow.step]}
        </h1>

        {flow.error && (
          <div className="flex items-start gap-2 px-4 py-3 dark:bg-[#3A1515] bg-[#FEF2F2] rounded-xl mb-5 text-[13px] leading-snug text-[#EF4444]">
            {flow.error === NETWORK_MESSAGE ? (
              <WifiOff size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span className="break-words">{flow.error}</span>
          </div>
        )}

        {flow.step === 'credentials' && <CredentialsForm flow={flow} />}
        {flow.step === 'verify' && <VerifyForm flow={flow} />}
        {flow.step === 'forgot' && <ForgotForm flow={flow} />}
        {flow.step === 'reset' && <ResetForm flow={flow} />}

        {/* Hint */}
        <div
          className="mt-6 pt-5 text-center text-[12px] dark:text-[#94A3B8] text-[#64748B] dark:border-[#1E293B] border-[#E2E8F0]"
          style={{ borderTop: `1px solid` }}
        >
          <p className="mt-1.5 text-[11px] opacity-60">
            Si no tienes acceso, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
