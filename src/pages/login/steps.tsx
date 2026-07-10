import { KeyRound, LogIn, Mail, ShieldCheck } from 'lucide-react';
import {
  BackButton,
  CodeField,
  LinkButton,
  PasswordField,
  PillField,
  StepIntro,
  SubmitButton,
} from './fields';
import type { SignInFlow } from './useSignInFlow';

/** Step 1: email + password. */
export function CredentialsForm({ flow }: { flow: SignInFlow }) {
  return (
    <form onSubmit={flow.handleSubmit} className="space-y-4">
      <PillField
        label="Correo electrónico"
        icon={Mail}
        type="email"
        placeholder="admin@maxihabana.com"
        value={flow.email}
        onChange={(e) => flow.setEmail(e.target.value)}
        required
      />
      <div>
        <PasswordField
          label="Contraseña"
          value={flow.password}
          onChange={flow.setPassword}
          autoComplete="current-password"
        />
        <div className="flex justify-end mt-1.5">
          <LinkButton onClick={flow.goToForgot}>¿Olvidaste tu contraseña?</LinkButton>
        </div>
      </div>
      <SubmitButton isLoading={flow.isLoading} icon={LogIn} className="mt-6">
        Entrar
      </SubmitButton>
    </form>
  );
}

/** Step 2 (new device / MFA): one-time code sent by email or SMS. */
export function VerifyForm({ flow }: { flow: SignInFlow }) {
  return (
    <form onSubmit={flow.handleVerify} className="space-y-4">
      <StepIntro icon={ShieldCheck}>
        Detectamos un inicio de sesión desde un dispositivo nuevo. Ingresa el
        código que enviamos
        {flow.safeIdentifier ? (
          <>
            {' '}a{' '}
            <span className="font-medium dark:text-[#E2E8F0] text-[#1E293B]">
              {flow.safeIdentifier}
            </span>
          </>
        ) : (
          ' a tu medio de contacto'
        )}
        .
      </StepIntro>
      <CodeField
        label="Código de verificación"
        icon={ShieldCheck}
        value={flow.code}
        onChange={(e) => flow.setCode(e.target.value)}
      />
      <SubmitButton isLoading={flow.isLoading} icon={ShieldCheck}>
        Verificar
      </SubmitButton>
      <div className="flex items-center justify-between pt-1">
        <BackButton onClick={flow.backToCredentials}>Volver</BackButton>
        <LinkButton onClick={flow.handleResend}>Reenviar código</LinkButton>
      </div>
    </form>
  );
}

/** Forgot password, step 1: request a reset code by email. */
export function ForgotForm({ flow }: { flow: SignInFlow }) {
  return (
    <form onSubmit={flow.handleForgotSubmit} className="space-y-4">
      <StepIntro icon={KeyRound}>
        Ingresa tu correo y te enviaremos un código para restablecer tu
        contraseña.
      </StepIntro>
      <PillField
        label="Correo electrónico"
        icon={Mail}
        type="email"
        placeholder="admin@maxihabana.com"
        value={flow.email}
        onChange={(e) => flow.setEmail(e.target.value)}
        required
      />
      <SubmitButton isLoading={flow.isLoading} icon={Mail}>
        Enviar código
      </SubmitButton>
      <div className="flex items-center pt-1">
        <BackButton onClick={flow.backToCredentials}>
          Volver a iniciar sesión
        </BackButton>
      </div>
    </form>
  );
}

/** Forgot password, step 2: verify the code and set the new password. */
export function ResetForm({ flow }: { flow: SignInFlow }) {
  return (
    <form onSubmit={flow.handleResetSubmit} className="space-y-4">
      <StepIntro icon={KeyRound}>
        Enviamos un código a{' '}
        <span className="font-medium dark:text-[#E2E8F0] text-[#1E293B]">
          {flow.email}
        </span>
        . Ingrésalo y define tu nueva contraseña.
      </StepIntro>
      <CodeField
        label="Código de verificación"
        icon={ShieldCheck}
        value={flow.code}
        onChange={(e) => flow.setCode(e.target.value)}
      />
      <PasswordField
        label="Nueva contraseña"
        value={flow.newPassword}
        onChange={flow.setNewPassword}
        minLength={8}
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirmar contraseña"
        value={flow.confirmPassword}
        onChange={flow.setConfirmPassword}
        minLength={8}
        autoComplete="new-password"
      />
      <SubmitButton isLoading={flow.isLoading} icon={KeyRound}>
        Restablecer contraseña
      </SubmitButton>
      <div className="flex items-center justify-between pt-1">
        <BackButton onClick={flow.backToCredentials}>Volver</BackButton>
        <LinkButton onClick={flow.handleResendReset}>Reenviar código</LinkButton>
      </div>
    </form>
  );
}
