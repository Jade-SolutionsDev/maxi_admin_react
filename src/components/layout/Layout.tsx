import { useTranslate } from "ra-core";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Notification } from "@/components/admin/notification";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { SidebarBadgeProvider } from "./SidebarBadgeProvider";

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  "/": { title: "Panel", breadcrumb: "Inicio / Panel" },
  "/productos": { title: "Productos", breadcrumb: "Inicio / Productos" },
  "/clients": { title: "Clientes", breadcrumb: "Inicio / Clientes" },
  "/users": { title: "Usuarios", breadcrumb: "Inicio / Usuarios" },
};

interface LayoutProps {
  children: React.ReactNode;
}

/** Rendered inside SidebarProvider so it can toggle the (mobile) sidebar from the TopBar. */
function LayoutContent({ children }: LayoutProps) {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  const translate = useTranslate();
  const pageInfo = pageTitles[location.pathname] || {
    title: translate("app.menu.panel", { _: "Panel" }),
    breadcrumb: translate("app.menu.home", { _: "Inicio" }),
  };

  return (
    <SidebarInset>
      <TopBar
        title={pageInfo.title}
        breadcrumb={pageInfo.breadcrumb}
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 lg:p-8 lg:pb-7">{children}</div>
    </SidebarInset>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarBadgeProvider>
      <SidebarProvider>
        <Sidebar />
        <LayoutContent>{children}</LayoutContent>
        {/* Bridges ra-core useNotify() to sonner toasts and mounts the <Toaster>. */}
        <Notification />
      </SidebarProvider>
    </SidebarBadgeProvider>
  );
}
