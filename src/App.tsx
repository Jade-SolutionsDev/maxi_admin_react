import { Admin } from 'react-admin';
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
      {/* Resources will be added in follow-up tasks */}
    </Admin>
  );
}
