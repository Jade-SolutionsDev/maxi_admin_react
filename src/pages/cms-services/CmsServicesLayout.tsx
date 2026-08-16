import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsServicesList from "./CmsServicesList";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";

export function CmsServicesLayout() {
  return (
    <ResourceContextProvider value="cms-services">
      <CmsTabsNav />
      <CmsServicesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
