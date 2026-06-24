
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import { LoginPage } from "./components/layout/LoginPage";
import Dashboard from "./pages/dashboard";
import { Admin, EditGuesser, ListGuesser } from "./components/admin";
import { Resource } from "ra-core";

export default function App() {
  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={LoginPage}
      requireAuth
      dashboard={Dashboard}
      // layout={CustomLayout}
    >
      {/* <CustomRoutes>
        <Route path="/" element={<Dashboard />} />
      </CustomRoutes> */}
      <Resource
        options={{ label: "CLIENTS" }}
        name="clients"
        list={ListGuesser}
      />
      <Resource options={{ label: "ROLES" }} name="roles" list={ListGuesser} />
      <Resource
        options={{ label: "USERS" }}
        name="users"
        list={ListGuesser}
        edit={<EditGuesser />}
      />
    </Admin>
  );
}
