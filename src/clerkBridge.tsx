import { useAuth, useClerk } from '@clerk/react';
import { useEffect } from 'react';
import { setGetApiToken, setClerkSignOut } from './clerkRefs';

export function ClerkTokenBridge() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    setGetApiToken(getToken);
    setClerkSignOut(signOut);
  }, [getToken, signOut]);

  return null;
}
