import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useUser } from '@clerk/react';
import { getErrorMessage } from './clerkErrors';

export type Step = 'credentials' | 'verify' | 'forgot' | 'reset';
export type CodeStrategy = 'email_code' | 'phone_code';

/**
 * State machine for the custom Clerk sign-in flow:
 * credentials → (new device / MFA) verify, or credentials → forgot → reset.
 * Owns every piece of flow state; the step components are purely presentational.
 */
export function useSignInFlow() {
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

  /** Wraps a submit handler with shared error/loading bookkeeping. */
  const submit = (fn: () => Promise<void>) => async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await fn();
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = submit(async () => {
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
    }
  });

  const handleVerify = submit(async () => {
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
    }
  });

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

  const goToForgot = () => {
    setError('');
    setStep('forgot');
  };

  // Step 1 of reset: look up the account and email a reset code.
  const handleForgotSubmit = submit(async () => {
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
    }
  });

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

  return {
    step,
    error,
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    safeIdentifier,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    handleVerify,
    handleResend,
    handleForgotSubmit,
    handleResetSubmit,
    handleResendReset,
    backToCredentials,
    goToForgot,
  };
}

export type SignInFlow = ReturnType<typeof useSignInFlow>;
