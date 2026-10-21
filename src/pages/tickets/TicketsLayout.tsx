import { ResourceContextProvider } from "ra-core";
import { Outlet } from "react-router-dom";
import TicketsList from "./TicketsList";

export function TicketsLayout() {
  return (
    <ResourceContextProvider value="tickets">
      <TicketsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
