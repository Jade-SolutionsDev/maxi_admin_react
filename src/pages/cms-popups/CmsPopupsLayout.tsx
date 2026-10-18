import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsPopupsList from "./CmsPopupsList";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";

export function CmsPopupsLayout() {
  return (
    <ResourceContextProvider value="cms-popups">
      <CmsTabsNav />
      <CmsPopupsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
