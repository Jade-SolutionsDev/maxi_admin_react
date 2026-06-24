import { Admin, ListGuesser, Resource } from 'react-admin';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { LoginPage } from './LoginPage';

export default function App() {
  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      loginPage={LoginPage}
      requireAuth
    >
      <Resource options={{label:"CLIENTS"}} name="clients" list={ListGuesser} />
    </Admin>
  );
}
