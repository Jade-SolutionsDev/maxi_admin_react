import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsPagesList from "./CmsPagesList";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";
import { MandatoryPagesAlert } from "./MandatoryPagesAlert";

export function CmsPagesLayout() {
  return (
    <ResourceContextProvider value="cms-pages">
      <CmsTabsNav />
      <MandatoryPagesAlert />
      <CmsPagesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
