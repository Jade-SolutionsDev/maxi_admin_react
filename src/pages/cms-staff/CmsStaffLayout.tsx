import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CmsStaffList from "./CmsStaffList";

export function CmsStaffLayout() {
  return (
    <ResourceContextProvider value="cms-staff">
      <CmsStaffList />
      <Outlet />
    </ResourceContextProvider>
  );
}
