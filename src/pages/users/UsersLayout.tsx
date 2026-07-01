import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import UsersList from "./UsersList";

/**
 * Users section layout.
 *
 * Provides the ra-core resource context for all /users/* nested routes
 * and renders the active child route through the React Router "slot"
 * (\u003cOutlet /\u003e).
 */
export function UsersLayout() {
  return (
    <ResourceContextProvider value="users">
      <UsersList />
      <Outlet />
    </ResourceContextProvider>
  );
}
