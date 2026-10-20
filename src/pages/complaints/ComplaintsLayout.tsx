import { ResourceContextProvider } from "ra-core";
import { Outlet } from "react-router-dom";
import ComplaintsList from "./ComplaintsList";

export function ComplaintsLayout() {
  return (
    <ResourceContextProvider value="complaints">
      <ComplaintsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
