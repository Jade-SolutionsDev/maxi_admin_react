import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import DepartmentsList from "./DepartmentsList";

export function DepartmentsLayout() {
  return (
    <ResourceContextProvider value="departments">
      <DepartmentsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
