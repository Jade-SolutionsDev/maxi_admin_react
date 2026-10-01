export interface NavDestination {
  resource: string;
  path: string;
}

/** First destination, in declared order, that the user is allowed to list. */
export const firstAccessibleDestination = (
  destinations: NavDestination[],
  canAccess: Record<string, boolean> | undefined,
): NavDestination | undefined =>
  destinations.find((destination) => canAccess?.[destination.resource]);
