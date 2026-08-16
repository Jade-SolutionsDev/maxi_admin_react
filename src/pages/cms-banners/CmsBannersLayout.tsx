import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsBannersList from "./CmsBannersList";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";

export function CmsBannersLayout() {
  return (
    <ResourceContextProvider value="cms-banners">
      <CmsTabsNav />
      <CmsBannersList />
      <Outlet />
    </ResourceContextProvider>
  );
}
