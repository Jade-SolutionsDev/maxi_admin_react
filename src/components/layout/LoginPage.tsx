import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useSignIn } from '@clerk/react';

export default function LoginPage() {
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a brief loading for better UX
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    })

    if (error) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(error, null, 2))
      return
      }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            //  Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')
          navigate(url, {
            replace: true,
          })
        },
      })
    }
  };

  // const inputBg = mode === 'dark' ? '#1A2535' : '#F1F5F9';
  // const textPrimary = mode === 'dark' ? '#E2E8F0' : '#1E293B';
  // const textSecondary = mode === 'dark' ? '#94A3B8' : '#64748B';
  // const borderColor = mode === 'dark' ? '#1E293B' : '#E2E8F0';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 dark:bg-[#161D27] bg-[#FFFFFF]"
    >
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

      {/* Login Card */}
      <div
        className="w-full max-w-[400px] rounded-2xl shadow-dropdown p-8 relative z-10 dark:bg-[#161D27] bg-[#FFFFFF]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-0 mb-2">
            <span
              className="text-[28px] font-extrabold tracking-tight dark:text-[#E2E8F0] text-[#1E293B]"
            >
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
        <h1
          className="text-[22px] font-semibold text-center mb-6 dark:text-[#E2E8F0] text-[#1E293B]"
        >
          Iniciar Sesión
        </h1>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 dark:bg-[#3A1515] bg-[#FEF2F2] rounded-xl mb-5 text-[13px] text-[#EF4444]"
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]"
            >
              Correo electrónico
            </label>
            <div
              className="flex dark:bg-[#1A2535] bg-[#1E293B] items-center rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981] border-transparent"
            >
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
            <label
              className="block text-[13px] font-medium mb-1.5 dark:text-[#94A3B8] text-[#64748B]"
            >
              Contraseña
            </label>
            <div
              className="flex items-center dark:bg-[#1A2535] bg-[#1E293B] border-transparent rounded-xl px-4 h-11 border transition-colors duration-150 focus-within:border-[#10B981]"
            >
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
