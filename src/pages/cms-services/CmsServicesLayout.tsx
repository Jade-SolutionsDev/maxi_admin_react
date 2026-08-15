import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsServicesList from "./CmsServicesList";

export function CmsServicesLayout() {
  return (
    <ResourceContextProvider value="cms-services">
      <CmsServicesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
