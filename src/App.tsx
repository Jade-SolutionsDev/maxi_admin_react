import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import Dashboard from "./pages/Dashboard";
import { Admin } from "./components/admin";
import { ThemeProvider } from "./components/admin/theme-provider";
import {
  CustomRoutes,
  localStorageStore,
  Resource,
  StoreContextProvider,
} from "ra-core";
import Layout from "./components/layout/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ClientList } from "./pages/Clients";
import Productos from "./pages/Productos";
import { i18nProvider } from "./providers/i18nProvider";
import UsersList from "./pages/Users";
import LoginPage from "./components/layout/LoginPage";
import Invitation from "./pages/Invitation";

// Shared store so the standalone invite route and the Admin app read the same
// persisted preferences (e.g. the light/dark theme).
const store = localStorageStore();

const AdminApp = () => (
  <Admin
    title={"MaxiHabana Admin"}
    authProvider={authProvider}
    dataProvider={dataProvider}
    loginPage={LoginPage}
    requireAuth
    dashboard={Dashboard}
    layout={Layout}
    i18nProvider={i18nProvider}
    store={store}
  >
    <CustomRoutes>
      <Route path="/productos" element={<Productos />} />
    </CustomRoutes>
    <Resource name="clients" list={ClientList} />
    <Resource name="users" list={UsersList} />
  </Admin>
);

// The invitation page is rendered OUTSIDE <Admin> on purpose. It must be
// reachable without authentication, and while it lived inside <Admin> (even as
// a `noLayout` custom route) the react-admin auth machinery stayed in its tree
// — any active Clerk session flipped `authenticated` true, mounted the
// identity/permission hooks, and fired authProvider.getIdentity -> GET
// /api/auth/me, which 401s for a session that isn't a provisioned backoffice
// user. Standalone, the authProvider is never in scope, so that call cannot
// happen. We still wrap it in the theme store/provider so the page keeps the
// app's light/dark styling (the only context <Invitation /> would otherwise
// miss — it uses no other react-admin context).
const InviteApp = () => (
  <StoreContextProvider value={store}>
    <ThemeProvider>
      <Invitation />
    </ThemeProvider>
  </StoreContextProvider>
);

export default function App() {
  // Keep the BrowserRouter so the app uses path-based URLs (ra-core would
  // otherwise default to a HashRouter). The /confirm-invite route is matched
  // here, before the Admin catch-all, so <Admin> never sees it.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/confirm-invite" element={<InviteApp />} />
        <Route path="/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
