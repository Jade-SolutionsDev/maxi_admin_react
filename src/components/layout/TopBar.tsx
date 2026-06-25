import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { LocalesMenuButton, ThemeModeToggle, useTheme } from '../admin';

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, breadcrumb, onMenuClick }: TopBarProps) {
  const { theme: mode } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors duration-200"
      style={{
        backgroundColor: mode === 'dark' ? '#0C1117' : '#FFFBF5',
        borderColor: mode === 'dark' ? '#1E293B' : '#E2E8F0',
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9' }}
          >
            <Menu size={20} style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }} />
          </button>
          <div>
            <h1
              className="text-[22px] font-semibold leading-tight"
              style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
            >
              {title}
            </h1>
            {breadcrumb && (
              <p
                className="text-[12px] mt-0.5"
                style={{ color: mode === 'dark' ? '#64748B' : '#64748B' }}
              >
                {breadcrumb}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="hidden sm:flex items-center rounded-[10px] px-3 h-10 w-[280px]"
            style={{ backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9' }}
          >
            <Search
              size={18}
              className="shrink-0"
              style={{ color: mode === 'dark' ? '#64748B' : '#94A3B8' }}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] ml-2 w-full placeholder:text-[#94A3B8]"
              style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200"
              style={{
                backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9',
              }}
            >
              <Bell size={20} style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div
                  className="absolute right-0 top-12 w-[320px] rounded-xl shadow-dropdown z-50 overflow-hidden"
                  style={{
                    backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF',
                    animation: 'fadeInUp 150ms ease-out',
                  }}
                >
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: mode === 'dark' ? '#1E293B' : '#E2E8F0' }}
                  >
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
                    >
                      Notificaciones
                    </p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { text: 'Nueva orden recibida', time: 'Hace 5 min', unread: true },
                      { text: 'Stock bajo: Teclado RGB', time: 'Hace 30 min', unread: true },
                      { text: 'Pago confirmado ORD-001', time: 'Hace 1 hora', unread: false },
                    ].map((notif, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 cursor-pointer transition-colors duration-80"
                        style={{
                          backgroundColor: notif.unread
                            ? (mode === 'dark' ? '#0F2E2E' : '#F0FDFA')
                            : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = mode === 'dark' ? '#1A2535' : '#F1F5F9';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = notif.unread
                            ? (mode === 'dark' ? '#0F2E2E' : '#F0FDFA')
                            : 'transparent';
                        }}
                      >
                        <p
                          className="text-[13px]"
                          style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
                        >
                          {notif.text}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <LocalesMenuButton />
          <ThemeModeToggle />

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10B981] to-[#0D9488] flex items-center justify-center border-2 border-[#10B981]">
            <span className="text-white text-[13px] font-semibold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
