import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import ProductsList from "./ProductsList";

export function ProductsLayout() {
  return (
    <ResourceContextProvider value="products">
      <ProductsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
