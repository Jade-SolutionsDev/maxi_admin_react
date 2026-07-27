import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useUser } from '@clerk/react';
import { useTranslate } from 'ra-core';
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
  const translate = useTranslate();
  // Localized error from a Clerk failure, with a translated fallback key.
  const errMsg = (
    err: unknown,
    fallbackKey: string,
    fallbackArgs?: Record<string, unknown>,
  ) => getErrorMessage(err, translate, fallbackKey, fallbackArgs);

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
        setError(errMsg(passwordError, 'login.errors.invalid_credentials'));
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
          setError(translate('login.errors.mfa_unavailable'));
          return;
        }

        const { error: sendError } =
          factor.strategy === 'email_code'
            ? await signIn.mfa.sendEmailCode()
            : await signIn.mfa.sendPhoneCode();

        if (sendError) {
          setError(errMsg(sendError, 'login.errors.code_send_failed'));
          return;
        }

        setCodeStrategy(factor.strategy);
        setSafeIdentifier(factor.safeIdentifier);
        setCode('');
        setStep('verify');
        return;
      }

      setError(
        translate('login.errors.signin_status', { status: signIn.status }),
      );
    } catch (err) {
      setError(errMsg(err, 'login.errors.signin_generic'));
    }
  });

  const handleVerify = submit(async () => {
    try {
      const { error: verifyError } =
        codeStrategy === 'phone_code'
          ? await signIn.mfa.verifyPhoneCode({ code })
          : await signIn.mfa.verifyEmailCode({ code });

      if (verifyError) {
        setError(errMsg(verifyError, 'login.errors.code_invalid'));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
      } else {
        setError(
          translate('login.errors.verify_status', { status: signIn.status }),
        );
      }
    } catch (err) {
      setError(errMsg(err, 'login.errors.verify_generic'));
    }
  });

  const handleResend = async () => {
    setError('');
    const { error: sendError } =
      codeStrategy === 'phone_code'
        ? await signIn.mfa.sendPhoneCode()
        : await signIn.mfa.sendEmailCode();
    if (sendError) {
      setError(errMsg(sendError, 'login.errors.code_resend_failed'));
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
        setError(errMsg(createError, 'login.errors.account_not_found'));
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(errMsg(sendError, 'login.errors.code_send_failed'));
        return;
      }

      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('reset');
    } catch (err) {
      setError(errMsg(err, 'login.errors.send_generic'));
    }
  });

  // Step 2 of reset: verify the code and set the new password.
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(translate('login.errors.password_mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });
      if (verifyError) {
        setError(errMsg(verifyError, 'login.errors.code_invalid'));
        return;
      }

      const { error: pwError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });
      if (pwError) {
        setError(errMsg(pwError, 'login.errors.password_update_failed'));
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
        setError(translate('login.errors.password_updated_signin'));
        return;
      }

      setError(
        translate('login.errors.reset_status', { status: signIn.status }),
      );
    } catch (err) {
      setError(errMsg(err, 'login.errors.reset_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendReset = async () => {
    setError('');
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setError(errMsg(sendError, 'login.errors.code_resend_failed'));
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
