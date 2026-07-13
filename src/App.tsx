import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import Dashboard from "./pages/Dashboard";
import { Admin } from "./components/admin";
import { ThemeProvider } from "./components/admin/theme-provider";
import {
  CustomRoutes,
  I18nContextProvider,
  localStorageStore,
  Resource,
  StoreContextProvider,
} from "ra-core";
import Layout from "./components/layout/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ClientList } from "./pages/Clients";
import Productos from "./pages/Productos";
import { i18nProvider } from "./providers/i18nProvider";
import LoginPage from "./pages/login/LoginPage";
import Invitation from "./pages/invitation/InvitationPage";
import { UsersLayout } from "./pages/users/UsersLayout";
import UserEdit from "./pages/users/UserEdit";
import UserCreate from "./pages/users/UserCreate";
import ChangePasswordModal from "./pages/users/ChangePasswordModal";
import { DepartmentsLayout } from "./pages/departments/DepartmentsLayout";
import DepartmentCreate from "./pages/departments/DepartmentCreate";
import DepartmentEdit from "./pages/departments/DepartmentEdit";
import { CategoriesLayout } from "./pages/categories/CategoriesLayout";
import CategoryCreate from "./pages/categories/CategoryCreate";
import CategoryEdit from "./pages/categories/CategoryEdit";
import ProfilePage from "./pages/profile/ProfilePage";
import roles from "./pages/roles";
import Loading from "./pages/Loading";

// Shared store so the standalone invite route and the Admin app read the same
// persisted preferences (e.g. the light/dark theme).
const store = localStorageStore("1", "maxi-admin-react");

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
    disableTelemetry
    loading={Loading}
  >
    <CustomRoutes>
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/users/*" element={<UsersLayout />}>
        <Route path="create" element={<UserCreate />} />
        <Route path="edit/:id" element={<UserEdit />} />
        <Route path="password/:id" element={<ChangePasswordModal />} />
      </Route>
      <Route path="/departments/*" element={<DepartmentsLayout />}>
        <Route path="create" element={<DepartmentCreate />} />
        <Route path="edit/:id" element={<DepartmentEdit />} />
      </Route>
      <Route path="/categories/*" element={<CategoriesLayout />}>
        <Route path="create" element={<CategoryCreate />} />
        <Route path="edit/:id" element={<CategoryEdit />} />
      </Route>
    </CustomRoutes>
    <Resource name="clients" list={ClientList} />
    {/* Managed roles (Settings): full-page List/Create/Edit with the permission
        matrix. Reachable at /roles; the sidebar "Configuración" links here. */}
    <Resource name="roles" {...roles} />
    {/* users / departments / categories are handled via CustomRoutes above. */}
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
    <I18nContextProvider value={i18nProvider}>
      <ThemeProvider>
        <Invitation />
      </ThemeProvider>
    </I18nContextProvider>
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
