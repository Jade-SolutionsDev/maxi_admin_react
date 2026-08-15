import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsPagesList from "./CmsPagesList";

export function CmsPagesLayout() {
  return (
    <ResourceContextProvider value="cms-pages">
      <CmsPagesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
