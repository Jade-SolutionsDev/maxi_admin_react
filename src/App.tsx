import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import Dashboard from "./pages/Dashboard";
import { Admin } from "./components/admin";
import { CustomRoutes, localStorageStore, Resource } from "ra-core";
import Layout from "./components/layout/Layout";
import { BrowserRouter, Route } from "react-router-dom";
import { ClientList } from "./pages/Clients";
import Productos from "./pages/Productos";
import { i18nProvider } from "./providers/i18nProvider";
import UsersList from "./pages/Users";
import LoginPage from "./components/layout/LoginPage";
import Invitation from "./pages/Invitation";

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
    store={localStorageStore()}
  >
    {/*
      Public route: `noLayout` custom routes are rendered by ra-core in every
      branch (even when `requireAuth` fails), outside <Layout> but still inside
      ThemeProvider + CoreAdminContext, so <Invitation /> keeps theme + i18n +
      store and is reachable without authentication.
    */}
    <CustomRoutes noLayout>
      <Route path="/confirm-invite" element={<Invitation />} />
    </CustomRoutes>
    <CustomRoutes>
      <Route path="/productos" element={<Productos />} />
    </CustomRoutes>
    <Resource name="clients" list={ClientList} />
    <Resource name="users" list={UsersList} />
  </Admin>
);

export default function App() {
  // Keep the BrowserRouter so the app uses path-based URLs (ra-core would
  // otherwise default to a HashRouter). ra-core's AdminRouter detects this
  // existing router and reuses it instead of creating its own.
  return (
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  );
}
