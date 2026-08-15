import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsBannersList from "./CmsBannersList";

export function CmsBannersLayout() {
  return (
    <ResourceContextProvider value="cms-banners">
      <CmsBannersList />
      <Outlet />
    </ResourceContextProvider>
  );
}
