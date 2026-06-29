import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useSignIn, useUser } from '@clerk/react';

type Step = 'credentials' | 'verify';
type CodeStrategy = 'email_code' | 'phone_code';

/** Best-effort extraction of a human-readable message from a Clerk error. */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export default function LoginPage() {
  const { isSignedIn } = useUser();
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Client Trust (new-device verification) state.
  const [step, setStep] = useState<Step>('credentials');
  const [code, setCode] = useState('');
  const [codeStrategy, setCodeStrategy] = useState<CodeStrategy>('email_code');
  const [safeIdentifier, setSafeIdentifier] = useState('');

  // Already-signed-in users skip the login screen.
  useEffect(() => {
    if (isSignedIn) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, navigate]);

  // Turns a sign-in with status === 'complete' into the active session.
  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          // Pending session tasks (e.g. org selection) are out of scope here.
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          console.log(session.currentTask);
          return;
        }
        navigate(decorateUrl('/'), { replace: true });
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: passwordError } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (passwordError) {
        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
        setError(getErrorMessage(passwordError, 'Correo o contraseña incorrectos.'));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
        return;
      }

      // Client Trust: signing in from a new device (no MFA configured) yields
      // `needs_client_trust`; an account with MFA yields `needs_second_factor`.
      // Both are satisfied here with an email/phone one-time code.
      if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        const factor =
          signIn.supportedSecondFactors.find((f) => f.strategy === 'email_code') ??
          signIn.supportedSecondFactors.find((f) => f.strategy === 'phone_code');

        if (!factor) {
          setError(
            'Tu cuenta requiere un método de verificación no disponible en este formulario.',
          );
          return;
        }

        const { error: sendError } =
          factor.strategy === 'email_code'
            ? await signIn.mfa.sendEmailCode()
            : await signIn.mfa.sendPhoneCode();

        if (sendError) {
          setError(getErrorMessage(sendError, 'No se pudo enviar el código de verificación.'));
          return;
        }

        setCodeStrategy(factor.strategy);
        setSafeIdentifier(factor.safeIdentifier);
        setCode('');
        setStep('verify');
        return;
      }

      setError(`No se pudo iniciar sesión (estado: ${signIn.status}).`);
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error al iniciar sesión.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: verifyError } =
        codeStrategy === 'phone_code'
          ? await signIn.mfa.verifyPhoneCode({ code })
          : await signIn.mfa.verifyEmailCode({ code });

      if (verifyError) {
        setError(getErrorMessage(verifyError, 'Código inválido o expirado.'));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
      } else {
        setError(`No se pudo verificar (estado: ${signIn.status}).`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error al verificar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    const { error: sendError } =
      codeStrategy === 'phone_code'
        ? await signIn.mfa.sendPhoneCode()
        : await signIn.mfa.sendEmailCode();
    if (sendError) {
      setError(getErrorMessage(sendError, 'No se pudo reenviar el código.'));
    }
  };

  const backToCredentials = () => {
    setError('');
    setCode('');
    setStep('credentials');
    signIn.reset();
  };

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
            <span className="text-[26px] font-normal tracking-tight" style={{ color: '#10B981' }}>
              Habana
            </span>
          </div>
          <p className="text-[14px] dark:text-[#94A3B8] text-[#64748B]">
            Panel de Administración
          </p>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-semibold text-center mb-6 dark:text-[#E2E8F0] text-[#1E293B]">
          {step === 'credentials' ? 'Iniciar Sesión' : 'Verifica tu dispositivo'}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 dark:bg-[#3A1515] bg-[#FEF2F2] rounded-xl mb-5 text-[13px] text-[#EF4444]">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Correo electrónico
              </label>
              <div className="flex dark:bg-[#1A2535] bg-[#1E293B] items-center rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981] border-transparent">
                <Mail size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
                <input
                  type="email"
                  placeholder="admin@maxihabana.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] dark:text-[#E2E8F0] text-[#1E293B]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Contraseña
              </label>
              <div className="flex items-center dark:bg-[#1A2535] bg-[#1E293B] border-transparent rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981]">
                <Lock size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] dark:text-[#E2E8F0] text-[#1E293B]"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0DA271] text-white font-medium text-[14px] h-11 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex flex-col items-center text-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#10B981]/10">
                <ShieldCheck size={22} style={{ color: '#10B981' }} />
              </div>
              <p className="text-[13px] dark:text-[#94A3B8] text-[#64748B]">
                Detectamos un inicio de sesión desde un dispositivo nuevo. Ingresa
                el código que enviamos
                {safeIdentifier ? (
                  <>
                    {' '}a <span className="font-medium dark:text-[#E2E8F0] text-[#1E293B]">{safeIdentifier}</span>
                  </>
                ) : (
                  ' a tu medio de contacto'
                )}
                .
              </p>
            </div>

            {/* Code */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Código de verificación
              </label>
              <div className="flex items-center dark:bg-[#1A2535] bg-[#1E293B] border-transparent rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981]">
                <ShieldCheck size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full tracking-[0.3em] placeholder:tracking-normal placeholder:text-[#94A3B8] dark:text-[#E2E8F0] text-[#1E293B]"
                  required
                />
              </div>
            </div>

            {/* Verify */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0DA271] text-white font-medium text-[14px] h-11 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Verificar
                </>
              )}
            </button>

            {/* Resend / back */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={backToCredentials}
                className="flex items-center gap-1 text-[12px] dark:text-[#94A3B8] text-[#64748B] hover:text-[#10B981] transition-colors"
              >
                <ArrowLeft size={13} />
                Volver
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="text-[12px] font-medium text-[#10B981] hover:text-[#0DA271] transition-colors"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

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
