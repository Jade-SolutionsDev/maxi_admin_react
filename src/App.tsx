import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { LoginPage } from "./components/layout/LoginPage";
import Dashboard from "./pages/Dashboard";
import { Admin } from "./components/admin";
import { CustomRoutes, Resource } from "ra-core";
import Layout from "./components/layout/Layout";
import { Route } from "react-router-dom";
import { ClientList } from "./pages/Clients";
import Productos from "./pages/Productos";
import { i18nProvider } from "./providers/i18nProvider";
import UsersList from "./pages/Users";

export default function App() {
  return (
    <Admin
      title={"MaxiHabana Admin"}
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={LoginPage}
      requireAuth
      dashboard={Dashboard}
      layout={Layout}
      i18nProvider={i18nProvider}
    >
      <CustomRoutes>
        <Route path="/productos" element={<Productos />} />
      </CustomRoutes>
      <Resource name="clients" list={ClientList} />
      <Resource name="users" list={UsersList} />
      {/* <Resource options={{ label: "ROLES" }} name="roles" list={ListGuesser} />
      <Resource
        options={{ label: "USERS" }}
        name="users"
        list={ListGuesser}
        edit={<EditGuesser />}
      /> */}
    </Admin>
  );
}
