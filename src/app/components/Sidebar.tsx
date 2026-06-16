import {
  LayoutDashboard,
  MapPin,
  Shield,
  Radio,
  Eye,
  Camera,
  LifeBuoy,
  Settings,
  Smartphone,
  ChevronRight,
  Wifi,
  Battery,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "tracking"
  | "recovery"
  | "remote"
  | "security"
  | "evidence"
  | "sos"
  | "settings";

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems: { id: Screen; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tracking", label: "Live Tracking", icon: MapPin },
  { id: "recovery", label: "Recovery Center", icon: Shield },
  { id: "remote", label: "Remote Control", icon: Radio },
  { id: "security", label: "Security Monitor", icon: Eye },
  { id: "evidence", label: "Evidence Vault", icon: Camera },
  { id: "sos", label: "Emergency SOS", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0"
      style={{ background: "#080E1A", borderRight: "1px solid rgba(0,212,255,0.1)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "linear-gradient(135deg, #00D4FF22, #00D4FF44)", border: "1px solid #00D4FF55" }}
        >
          <Shield size={18} style={{ color: "#00D4FF" }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: "#E2E8F0", fontSize: 15, letterSpacing: "0.02em" }}>
            SecureTrace
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#39FF14", letterSpacing: "0.1em" }}>
            v2.4.1 ACTIVE
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="mx-4 mt-4 mb-2 rounded-lg p-3" style={{ background: "#0C1322", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={13} style={{ color: "#00D4FF" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>PRIMARY DEVICE</span>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#E2E8F0", fontWeight: 600, marginBottom: 6 }}>
          Pixel 8 Pro — James
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#39FF14", boxShadow: "0 0 6px #39FF14" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#39FF14" }}>SECURED</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={11} style={{ color: "#64748B" }} />
            <Battery size={11} style={{ color: "#64748B" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>87%</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group"
              style={{
                background: isActive ? "rgba(0,212,255,0.1)" : "transparent",
                border: isActive ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
              }}
            >
              <Icon
                size={16}
                style={{ color: isActive ? "#00D4FF" : "#64748B" }}
                className="transition-colors"
              />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#E2E8F0" : "#64748B",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {item.label}
              </span>
              {isActive && <ChevronRight size={12} style={{ color: "#00D4FF" }} />}
              {item.id === "sos" && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF3355", boxShadow: "0 0 6px #FF3355" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#1A2B3C" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#00D4FF", fontWeight: 700 }}>JD</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#CBD5E1", fontWeight: 500 }}>James Davidson</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
