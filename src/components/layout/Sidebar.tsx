import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Tags,
  Package,
  ShoppingCart,
  CreditCard,
  Wallet,
  Ticket,
  Users,
  MessageSquare,
  Monitor,
  Shield,
  ChevronDown,
  ChevronLeft,
  LogOut,
  User,
} from 'lucide-react';
import Logo from '@/assets/maxi_habana_logo.png'

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { label: 'Departamento', icon: <Building2 size={20} /> },
  { label: 'Categoría', icon: <Tags size={20} /> },
  { label: 'Producto', icon: <Package size={20} />, path: '/productos' },
  { label: 'Órdenes', icon: <ShoppingCart size={20} />, path: '/ordenes' },
  { label: 'Cargos de Pago', icon: <CreditCard size={20} /> },
  { label: 'Métodos de Pago', icon: <Wallet size={20} /> },
  { label: 'Cupones', icon: <Ticket size={20} /> },
  { label: 'Clientes', icon: <Users size={20} />, path: '/clients' },
  { label: 'Mensajes', icon: <MessageSquare size={20} /> },
  {
    label: 'Web Cliente',
    icon: <Monitor size={20} />,
    children: [
      { label: 'Configuración', path: '#' },
      { label: 'Banners', path: '#' },
    ],
  },
  {
    label: 'Administración',
    icon: <Shield size={20} />,
    children: [
      { label: 'Usuarios', path: '#' },
      { label: 'Roles', path: '#' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <aside
      className="sidebar-dark fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 72 : 256,
        boxShadow: '4px 0 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex items-center gap-0 overflow-hidden">
          {/* <img src={Logo} alt="Logo"  /> */}
          {!collapsed ? (
            <img src={Logo} alt="Logo" />) : (<img src={Logo} alt="Logo" style={{ width: 32, height: 32 }} />
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-[#94A3B8] hover:text-white transition-colors duration-150 shrink-0"
          style={{ marginLeft: collapsed ? 0 : 8 }}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const hasChildren = !!item.children;
          const isExpanded = expandedMenus[item.label];

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    if (!collapsed) toggleSubmenu(item.label);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 rounded-[10px] transition-all duration-150 ease-out
                  ${collapsed ? 'justify-center px-0' : 'px-3'}
                  ${active
                    ? 'bg-[#0D9488] text-white border-l-[3px] border-[#10B981]'
                    : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white border-l-[3px] border-transparent'
                  }
                `}
                style={{ height: 44, minHeight: 44 }}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0" style={{ marginRight: collapsed ? 0 : undefined }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="text-[14px] font-medium flex-1 text-left truncate">
                      {item.label}
                    </span>
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-200">
                  {item.children?.map((child) => (
                    <button
                      key={child.label}
                      onClick={() => child.path !== '#' && navigate(child.path)}
                      className="
                        w-full flex items-center px-4 py-2 rounded-lg
                        text-[13px] text-[#CBD5E1] hover:text-white hover:bg-white/[0.04]
                        transition-colors duration-100 text-left
                      "
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div
        className={`
          border-t border-white/10 shrink-0 flex items-center gap-3
          ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
        `}
      >
        <div className="w-9 h-9 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
          <User size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-[13px] font-medium truncate">Admin Maxi</p>
            <p className="text-[#94A3B8] text-[11px] truncate">admin@maxihabana.com</p>
          </div>
        )}
        {!collapsed && (
          <button className="ml-auto text-[#94A3B8] hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
