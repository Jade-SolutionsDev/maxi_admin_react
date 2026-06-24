import { SignIn } from '@clerk/react';

export function LoginPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <SignIn fallbackRedirectUrl="/" />
    </div>
  );
}
