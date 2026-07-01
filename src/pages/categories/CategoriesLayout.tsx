import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import CategoriesList from "./CategoriesList";

export function CategoriesLayout() {
  return (
    <ResourceContextProvider value="categories">
      <CategoriesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
