import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeModeToggle } from "@/components/admin";

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  onMenuClick: () => void;
}

export default function TopBar({
  title,
  breadcrumb,
  onMenuClick,
}: TopBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream border-b border-[#E2E8F0]">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <Menu size={20} className="text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1E293B] leading-tight">
              {title}
            </h1>
            {breadcrumb && (
              <p className="text-[12px] text-[#64748B] mt-0.5">{breadcrumb}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center bg-[#F1F5F9] rounded-[10px] px-3 h-10 w-[280px]">
            <Search size={18} className="text-[#94A3B8] shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] text-[#1E293B] placeholder-[#94A3B8] ml-2 w-full"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors duration-100"
            >
              <Bell size={20} className="text-[#64748B]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div
                  className="absolute right-0 top-12 w-[320px] bg-white rounded-xl shadow-dropdown z-50 overflow-hidden"
                  style={{ animation: "fadeInUp 150ms ease-out" }}
                >
                  <div className="px-4 py-3 border-b border-[#E2E8F0]">
                    <p className="text-[14px] font-semibold text-[#1E293B]">
                      Notificaciones
                    </p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      {
                        text: "Nueva orden recibida",
                        time: "Hace 5 min",
                        unread: true,
                      },
                      {
                        text: "Stock bajo: Teclado RGB",
                        time: "Hace 30 min",
                        unread: true,
                      },
                      {
                        text: "Pago confirmado ORD-001",
                        time: "Hace 1 hora",
                        unread: false,
                      },
                    ].map((notif, i) => (
                      <div
                        key={i}
                        className={`px-4 py-3 hover:bg-[#F1F5F9] transition-colors duration-80 cursor-pointer ${
                          notif.unread ? "bg-[#F0FDFA]" : ""
                        }`}
                      >
                        <p className="text-[13px] text-[#1E293B]">
                          {notif.text}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
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
