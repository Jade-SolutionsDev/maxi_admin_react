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
import { ProductsLayout } from "./pages/products/ProductsLayout";
import ProductCreate from "./pages/products/ProductCreate";
import ProductEdit from "./pages/products/ProductEdit";
import { ProductDetailModal } from "./pages/products/ProductDetailModal";
import StockLocationsList from "./pages/stock-locations/StockLocationsList";
import StockLocationDetailPage from "./pages/stock-locations/StockLocationDetailPage";
import { CreateOperationWizard } from "./pages/stock-locations/CreateOperationWizard";
import InventoryList from "./pages/inventory/InventoryList";
import InventoryDetailPage from "./pages/inventory/InventoryDetailPage";
import OrdersList from "./pages/orders/OrdersList";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ClientDetailPage from "./pages/clients/ClientDetailPage";
import { i18nProvider } from "./providers/i18nProvider";
import LoginPage from "./pages/login/LoginPage";
import Invitation from "./pages/invitation/InvitationPage";
import { UsersLayout } from "./pages/users/UsersLayout";
import UserEdit from "./pages/users/UserEdit";
import UserCreate from "./pages/users/UserCreate";
import UserDetailModal from "./pages/users/UserDetailModal";
import ChangePasswordModal from "./pages/users/ChangePasswordModal";
import { DepartmentsLayout } from "./pages/departments/DepartmentsLayout";
import DepartmentCreate from "./pages/departments/DepartmentCreate";
import DepartmentEdit from "./pages/departments/DepartmentEdit";
import { CategoriesLayout } from "./pages/categories/CategoriesLayout";
import { CmsBannersLayout } from "./pages/cms-banners/CmsBannersLayout";
import CmsBannerCreate from "./pages/cms-banners/CmsBannerCreate";
import CmsBannerEdit from "./pages/cms-banners/CmsBannerEdit";
import { CmsBannerDetailModal } from "./pages/cms-banners/CmsBannerDetailModal";
import { CmsPagesLayout } from "./pages/cms-pages/CmsPagesLayout";
import CmsPageCreate from "./pages/cms-pages/CmsPageCreate";
import CmsPageEdit from "./pages/cms-pages/CmsPageEdit";
import { CmsPageDetailModal } from "./pages/cms-pages/CmsPageDetailModal";
import { CmsServicesLayout } from "./pages/cms-services/CmsServicesLayout";
import CmsServiceCreate from "./pages/cms-services/CmsServiceCreate";
import CmsServiceEdit from "./pages/cms-services/CmsServiceEdit";
import { CmsServiceDetailModal } from "./pages/cms-services/CmsServiceDetailModal";
import { CmsSettingsPage } from "./pages/cms-settings/CmsSettingsPage";
import { PaymentMethodsPage } from "./pages/payment-methods/PaymentMethodsPage";
import ContactMessagesList from "./pages/contact-messages/ContactMessagesList";
import ContactMessageDetailPage from "./pages/contact-messages/ContactMessageDetailPage";
import { ContactTemplatesLayout } from "./pages/contact-templates/ContactTemplatesLayout";
import ContactTemplateCreate from "./pages/contact-templates/ContactTemplateCreate";
import ContactTemplateEdit from "./pages/contact-templates/ContactTemplateEdit";
import { ContactTemplateDetailModal } from "./pages/contact-templates/ContactTemplateDetailModal";
import { NomenclatorsLayout } from "./pages/nomenclators/NomenclatorsLayout";
import NomenclatorCreate from "./pages/nomenclators/NomenclatorCreate";
import NomenclatorEdit from "./pages/nomenclators/NomenclatorEdit";
import { NomenclatorDetailModal } from "./pages/nomenclators/NomenclatorDetailModal";
import { DeliveryOptionsPage } from "./pages/delivery-options/DeliveryOptionsPage";
import DeliveryOptionCreate from "./pages/delivery-options/DeliveryOptionCreate";
import DeliveryOptionEdit from "./pages/delivery-options/DeliveryOptionEdit";
import { CmsStaffLayout } from "./pages/cms-staff/CmsStaffLayout";
import CmsStaffCreate from "./pages/cms-staff/CmsStaffCreate";
import CmsStaffEdit from "./pages/cms-staff/CmsStaffEdit";
import { CmsStaffDetailModal } from "./pages/cms-staff/CmsStaffDetailModal";
import CategoryCreate from "./pages/categories/CategoryCreate";
import CategoryEdit from "./pages/categories/CategoryEdit";
import { TaxonomyDetailModal } from "./components/admin/taxonomy-detail-modal";
import ProfilePage from "./pages/profile/ProfilePage";
import roles from "./pages/roles";
import Loading from "./pages/Loading";
import AccessDenied from "./pages/AccessDenied";
import { RequireAccess } from "./components/auth/RequireAccess";

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
    accessDenied={AccessDenied}
  >
    <CustomRoutes>
      <Route path="/perfil" element={<ProfilePage />} />
      <Route
        path="/products/*"
        element={
          <RequireAccess resource="products">
            <ProductsLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<ProductCreate />} />
        <Route path="edit/:id" element={<ProductEdit />} />
        <Route path=":id" element={<ProductDetailModal />} />
      </Route>
      <Route
        path="/users/*"
        element={
          <RequireAccess resource="users">
            <UsersLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<UserCreate />} />
        <Route path="edit/:id" element={<UserEdit />} />
        <Route path="password/:id" element={<ChangePasswordModal />} />
        <Route path=":id" element={<UserDetailModal />} />
      </Route>
      <Route
        path="/departments/*"
        element={
          <RequireAccess resource="departments">
            <DepartmentsLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<DepartmentCreate />} />
        <Route path="edit/:id" element={<DepartmentEdit />} />
        <Route path=":id" element={<TaxonomyDetailModal />} />
      </Route>
      <Route
        path="/categories/*"
        element={
          <RequireAccess resource="categories">
            <CategoriesLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<CategoryCreate />} />
        <Route path="edit/:id" element={<CategoryEdit />} />
        <Route path=":id" element={<TaxonomyDetailModal />} />
      </Route>
      <Route
        path="/cms-pages/*"
        element={
          <RequireAccess resource="cms-pages">
            <CmsPagesLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<CmsPageCreate />} />
        <Route path="edit/:id" element={<CmsPageEdit />} />
        <Route path=":id" element={<CmsPageDetailModal />} />
      </Route>
      <Route
        path="/cms-banners/*"
        element={
          <RequireAccess resource="cms-banners">
            <CmsBannersLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<CmsBannerCreate />} />
        <Route path="edit/:id" element={<CmsBannerEdit />} />
        <Route path=":id" element={<CmsBannerDetailModal />} />
      </Route>
      <Route
        path="/cms-services/*"
        element={
          <RequireAccess resource="cms-services">
            <CmsServicesLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<CmsServiceCreate />} />
        <Route path="edit/:id" element={<CmsServiceEdit />} />
        <Route path=":id" element={<CmsServiceDetailModal />} />
      </Route>
      <Route
        path="/cms-staff/*"
        element={
          <RequireAccess resource="cms-staff">
            <CmsStaffLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<CmsStaffCreate />} />
        <Route path="edit/:id" element={<CmsStaffEdit />} />
        <Route path=":id" element={<CmsStaffDetailModal />} />
      </Route>
      <Route
        path="/cms-settings"
        element={
          <RequireAccess resource="cms-settings">
            <CmsSettingsPage />
          </RequireAccess>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <RequireAccess resource="payment-methods">
            <PaymentMethodsPage />
          </RequireAccess>
        }
      />
      <Route
        path="/delivery-options/*"
        element={
          <RequireAccess resource="delivery-options">
            <DeliveryOptionsPage />
          </RequireAccess>
        }
      >
        <Route path="create" element={<DeliveryOptionCreate />} />
        <Route path="edit/:id" element={<DeliveryOptionEdit />} />
      </Route>
      <Route
        path="/clients/:id"
        element={
          <RequireAccess resource="clients" action="read">
            <ClientDetailPage />
          </RequireAccess>
        }
      />
      <Route
        path="/contact-messages"
        element={
          <RequireAccess resource="contact-messages">
            <ContactMessagesList />
          </RequireAccess>
        }
      />
      <Route
        path="/contact-messages/:id"
        element={
          <RequireAccess resource="contact-messages" action="read">
            <ContactMessageDetailPage />
          </RequireAccess>
        }
      />
      <Route
        path="/contact-templates/*"
        element={
          <RequireAccess resource="contact-templates">
            <ContactTemplatesLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<ContactTemplateCreate />} />
        <Route path="edit/:id" element={<ContactTemplateEdit />} />
        <Route path=":id" element={<ContactTemplateDetailModal />} />
      </Route>
      <Route
        path="/nomenclators/*"
        element={
          <RequireAccess resource="nomenclators">
            <NomenclatorsLayout />
          </RequireAccess>
        }
      >
        <Route path="create" element={<NomenclatorCreate />} />
        <Route path="edit/:id" element={<NomenclatorEdit />} />
        <Route path=":id" element={<NomenclatorDetailModal />} />
      </Route>
      <Route
        path="/orders"
        element={
          <RequireAccess resource="orders">
            <OrdersList />
          </RequireAccess>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAccess resource="orders" action="read">
            <OrderDetailPage />
          </RequireAccess>
        }
      />
      <Route
        path="/stock-locations"
        element={
          <RequireAccess resource="stock-locations">
            <StockLocationsList />
          </RequireAccess>
        }
      />
      <Route
        path="/stock-locations/:id/*"
        element={
          <RequireAccess resource="stock-locations" action="read">
            <StockLocationDetailPage />
          </RequireAccess>
        }
      >
        <Route path="operaciones" element={<CreateOperationWizard />} />
      </Route>
      <Route
        path="/inventory"
        element={
          <RequireAccess resource="inventory">
            <InventoryList />
          </RequireAccess>
        }
      />
      <Route
        path="/inventory/:productId"
        element={
          <RequireAccess resource="inventory" action="read">
            <InventoryDetailPage />
          </RequireAccess>
        }
      />
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
