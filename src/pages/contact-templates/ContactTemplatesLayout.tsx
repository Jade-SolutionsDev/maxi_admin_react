import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import ContactTemplatesList from "./ContactTemplatesList";

export function ContactTemplatesLayout() {
  return (
    <ResourceContextProvider value="contact-templates">
      <ContactTemplatesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
