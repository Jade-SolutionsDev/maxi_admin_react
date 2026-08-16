import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsStaffList from "./CmsStaffList";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";

export function CmsStaffLayout() {
  return (
    <ResourceContextProvider value="cms-staff">
      <CmsTabsNav />
      <CmsStaffList />
      <Outlet />
    </ResourceContextProvider>
  );
}
