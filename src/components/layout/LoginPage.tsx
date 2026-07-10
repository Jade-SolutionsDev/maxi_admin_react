import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck, ArrowLeft, KeyRound, Eye, EyeOff, WifiOff } from 'lucide-react';
import { useSignIn, useUser } from '@clerk/react';

type Step = 'credentials' | 'verify' | 'forgot' | 'reset';
type CodeStrategy = 'email_code' | 'phone_code';

const NETWORK_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';

/** True when the failure is a connectivity problem rather than a real auth error. */
function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  // A failed fetch (no response) surfaces as a TypeError in the browser.
  if (err instanceof TypeError) return true;
  if (err && typeof err === 'object') {
    const e = err as { code?: unknown; message?: unknown };
    if (e.code === 'network_error') return true;
    if (
      typeof e.message === 'string' &&
      /network error|failed to fetch|networkerror|load failed/i.test(e.message)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Human-readable message from a Clerk error. Connectivity failures get a friendly
 * message; otherwise we prefer Clerk's structured per-field message and never leak
 * raw ClerkJS internals (URLs, stack text) into the UI.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (isNetworkError(err)) return NETWORK_MESSAGE;

  if (err && typeof err === 'object' && 'errors' in err) {
    const arr = (err as { errors?: Array<{ message?: string; longMessage?: string }> })
      .errors;
    const first = Array.isArray(arr) ? arr[0] : undefined;
    if (first) return first.longMessage || first.message || fallback;
  }

  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      // Guard against raw ClerkJS dumps ("ClerkJS: Network error at https://…") leaking.
      if (/clerkjs|clerk\.accounts\.dev|__clerk/i.test(message)) return NETWORK_MESSAGE;
      return message;
    }
  }

  return fallback;
}

/**
 * Dark "pill" password field for the login screen, with a show/hide toggle.
 * The login form is bespoke (not shadcn inputs), so it can't reuse the shared
 * `@/components/ui/password-input`; this mirrors that behaviour in the pill style.
 */
function PasswordField({
  value,
  onChange,
  placeholder = '••••••••',
  minLength,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center dark:bg-[#1A2535] bg-[#1E293B] border-transparent rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981]">
      <Lock size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] text-[#E2E8F0]"
        required
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="shrink-0 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
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

  // Forgot / reset-password state.
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setNewPassword('');
    setConfirmPassword('');
    setStep('credentials');
    signIn.reset();
  };

  // Step 1 of reset: look up the account and email a reset code.
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(
          getErrorMessage(createError, 'No encontramos una cuenta con ese correo.'),
        );
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(getErrorMessage(sendError, 'No se pudo enviar el código.'));
        return;
      }

      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error al enviar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 of reset: verify the code and set the new password.
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });
      if (verifyError) {
        setError(getErrorMessage(verifyError, 'Código inválido o expirado.'));
        return;
      }

      const { error: pwError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });
      if (pwError) {
        setError(getErrorMessage(pwError, 'No se pudo actualizar la contraseña.'));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        // Account has 2FA: the password is already updated, finish by signing in.
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setStep('credentials');
        signIn.reset();
        setError('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
        return;
      }

      setError(`No se pudo completar el restablecimiento (estado: ${signIn.status}).`);
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error al restablecer la contraseña.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendReset = async () => {
    setError('');
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setError(getErrorMessage(sendError, 'No se pudo reenviar el código.'));
    }
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
          {step === 'credentials'
            ? 'Iniciar Sesión'
            : step === 'verify'
              ? 'Verifica tu dispositivo'
              : step === 'forgot'
                ? 'Recuperar contraseña'
                : 'Nueva contraseña'}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 dark:bg-[#3A1515] bg-[#FEF2F2] rounded-xl mb-5 text-[13px] leading-snug text-[#EF4444]">
            {error === NETWORK_MESSAGE ? (
              <WifiOff size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span className="break-words">{error}</span>
          </div>
        )}

        {step === 'credentials' && (
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
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] text-[#E2E8F0]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Contraseña
              </label>
              <PasswordField
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep('forgot');
                  }}
                  className="text-[12px] font-medium text-[#10B981] hover:text-[#0DA271] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
        )}

        {step === 'verify' && (
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
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full tracking-[0.3em] placeholder:tracking-normal placeholder:text-[#94A3B8] text-[#E2E8F0]"
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

        {step === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="flex flex-col items-center text-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#10B981]/10">
                <KeyRound size={22} style={{ color: '#10B981' }} />
              </div>
              <p className="text-[13px] dark:text-[#94A3B8] text-[#64748B]">
                Ingresa tu correo y te enviaremos un código para restablecer tu
                contraseña.
              </p>
            </div>

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
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full placeholder:text-[#94A3B8] text-[#E2E8F0]"
                  required
                />
              </div>
            </div>

            {/* Send code */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0DA271] text-white font-medium text-[14px] h-11 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Mail size={16} />
                  Enviar código
                </>
              )}
            </button>

            <div className="flex items-center pt-1">
              <button
                type="button"
                onClick={backToCredentials}
                className="flex items-center gap-1 text-[12px] dark:text-[#94A3B8] text-[#64748B] hover:text-[#10B981] transition-colors"
              >
                <ArrowLeft size={13} />
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="flex flex-col items-center text-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#10B981]/10">
                <KeyRound size={22} style={{ color: '#10B981' }} />
              </div>
              <p className="text-[13px] dark:text-[#94A3B8] text-[#64748B]">
                Enviamos un código a{' '}
                <span className="font-medium dark:text-[#E2E8F0] text-[#1E293B]">
                  {email}
                </span>
                . Ingrésalo y define tu nueva contraseña.
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
                  className="bg-transparent border-none outline-none text-[14px] ml-3 w-full tracking-[0.3em] placeholder:tracking-normal placeholder:text-[#94A3B8] text-[#E2E8F0]"
                  required
                />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Nueva contraseña
              </label>
              <PasswordField
                value={newPassword}
                onChange={setNewPassword}
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]">
                Confirmar contraseña
              </label>
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0DA271] text-white font-medium text-[14px] h-11 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={16} />
                  Restablecer contraseña
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
                onClick={handleResendReset}
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
