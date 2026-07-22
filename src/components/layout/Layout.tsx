import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Notification } from "@/components/admin/notification";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";

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

  const pageInfo = pageTitles[location.pathname] || {
    title: "Dashboard",
    breadcrumb: "Inicio",
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
    <SidebarProvider>
      <Sidebar />
      <LayoutContent>{children}</LayoutContent>
      {/* Bridges ra-core useNotify() to sonner toasts and mounts the <Toaster>. */}
      <Notification />
    </SidebarProvider>
  );
}
