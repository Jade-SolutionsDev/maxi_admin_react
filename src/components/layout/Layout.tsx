import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Dashboard', breadcrumb: 'Inicio / Dashboard' },
  '/productos': { title: 'Productos', breadcrumb: 'Inicio / Productos' },
  '/ordenes': { title: 'Órdenes', breadcrumb: 'Inicio / Órdenes' },
  '/clients': { title: 'Clientes', breadcrumb: 'Inicio / Clientes' },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', breadcrumb: 'Inicio' };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 256) : 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden" style={{ animation: 'slideIn 300ms ease' }}>
            <Sidebar collapsed={false} onToggleCollapse={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopBar
          title={pageInfo.title}
          breadcrumb={pageInfo.breadcrumb}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
