export let getApiToken: () => Promise<string | null> = () =>
  Promise.resolve(null);
export let clerkSignOut: () => Promise<void> = () => Promise.resolve();

export function setGetApiToken(fn: () => Promise<string | null>) {
  getApiToken = fn;
}

export function setClerkSignOut(fn: () => Promise<void>) {
  clerkSignOut = fn;
}
