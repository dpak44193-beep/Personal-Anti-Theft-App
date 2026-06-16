import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  MapPin,
  Activity,
  Wifi,
  Battery,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const activityData = [
  { time: "00:00", events: 2, alerts: 0 },
  { time: "03:00", events: 1, alerts: 0 },
  { time: "06:00", events: 3, alerts: 0 },
  { time: "09:00", events: 8, alerts: 1 },
  { time: "12:00", events: 12, alerts: 0 },
  { time: "15:00", events: 7, alerts: 2 },
  { time: "18:00", events: 15, alerts: 0 },
  { time: "21:00", events: 9, alerts: 1 },
  { time: "Now", events: 6, alerts: 0 },
];

const recentAlerts = [
  { id: 1, type: "warning", msg: "Unusual location detected — 4.2km from home zone", time: "14 min ago" },
  { id: 2, type: "info", msg: "Device connected to new Wi-Fi: 'CafeNet-5G'", time: "1h 22min ago" },
  { id: 3, type: "danger", msg: "Failed unlock attempt — 3 consecutive failures", time: "3h 07min ago" },
  { id: 4, type: "info", msg: "Battery below 20% — power saving mode enabled", time: "5h 43min ago" },
  { id: 5, type: "warning", msg: "SIM card removed momentarily — re-inserted", time: "Yesterday 22:18" },
];

const statCards = [
  {
    label: "Security Score",
    value: "94",
    unit: "/100",
    delta: "+3 this week",
    positive: true,
    icon: Shield,
    color: "#39FF14",
    glow: "#39FF1440",
  },
  {
    label: "Active Threats",
    value: "2",
    unit: "open",
    delta: "1 resolved today",
    positive: false,
    icon: AlertTriangle,
    color: "#FF9F00",
    glow: "#FF9F0040",
  },
  {
    label: "Location Pings",
    value: "1,284",
    unit: "total",
    delta: "Last: 4 min ago",
    positive: true,
    icon: MapPin,
    color: "#00D4FF",
    glow: "#00D4FF40",
  },
  {
    label: "Uptime",
    value: "99.7",
    unit: "%",
    delta: "14 days continuous",
    positive: true,
    icon: Activity,
    color: "#7C3AED",
    glow: "#7C3AED40",
  },
];

const devices = [
  { name: "Pixel 8 Pro", owner: "James", status: "secured", battery: 87, signal: "5G" },
  { name: "Samsung S24", owner: "Sarah", status: "secured", battery: 62, signal: "LTE" },
  { name: "iPhone 15", owner: "Michael", status: "warning", battery: 18, signal: "Wi-Fi" },
];

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: "rgba(12,19,34,0.8)",
        border: "1px solid rgba(0,212,255,0.15)",
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0C1322", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, padding: "8px 12px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748B", marginBottom: 4 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [alertFilter, setAlertFilter] = useState<"all" | "danger" | "warning">("all");

  const filtered = recentAlerts.filter((a) => alertFilter === "all" || a.type === alertFilter);

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0", letterSpacing: "-0.01em" }}>
            Security Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#39FF14", boxShadow: "0 0 6px #39FF14" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#39FF14" }}>
              ALL SYSTEMS OPERATIONAL
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748B" }}>
              — Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#0F1A2E", border: "1px solid rgba(0,212,255,0.2)" }}>
          <Clock size={13} style={{ color: "#00D4FF" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: card.glow, border: `1px solid ${card.color}40` }}
                >
                  <Icon size={17} style={{ color: card.color }} />
                </div>
                <TrendingUp size={13} style={{ color: card.positive ? "#39FF14" : "#FF9F00" }} />
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748B", marginBottom: 2 }}>
                  {card.unit}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 4 }}>{card.delta}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Activity Chart */}
        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Activity Timeline</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>
                Events & alerts — last 24h
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3355" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF3355" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: "#64748B" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: "#64748B" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="events" name="Events" stroke="#00D4FF" strokeWidth={1.5} fill="url(#colorEvents)" />
              <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#FF3355" strokeWidth={1.5} fill="url(#colorAlerts)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Devices */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Connected Devices</div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#39FF14", background: "#39FF1415", padding: "2px 8px", borderRadius: 4, border: "1px solid #39FF1430" }}>
              {devices.length} ACTIVE
            </span>
          </div>
          <div className="space-y-3">
            {devices.map((d) => (
              <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "#0F1A2E" }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: d.status === "warning" ? "#FF9F0020" : "#00D4FF15", border: `1px solid ${d.status === "warning" ? "#FF9F0040" : "#00D4FF30"}` }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: d.status === "warning" ? "#FF9F00" : "#00D4FF" }}>
                    {d.owner[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{d.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{d.owner} · {d.signal}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Battery size={10} style={{ color: d.battery < 25 ? "#FF3355" : "#64748B" }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: d.battery < 25 ? "#FF3355" : "#64748B" }}>{d.battery}%</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.status === "warning" ? "#FF9F00" : "#39FF14", boxShadow: `0 0 4px ${d.status === "warning" ? "#FF9F00" : "#39FF14"}` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Alerts */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Recent Security Alerts</div>
          <div className="flex gap-1">
            {(["all", "danger", "warning"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                className="px-2.5 py-1 rounded text-xs transition-colors"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  background: alertFilter === f ? (f === "danger" ? "#FF335520" : f === "warning" ? "#FF9F0020" : "#00D4FF15") : "transparent",
                  color: alertFilter === f ? (f === "danger" ? "#FF3355" : f === "warning" ? "#FF9F00" : "#00D4FF") : "#64748B",
                  border: `1px solid ${alertFilter === f ? (f === "danger" ? "#FF335540" : f === "warning" ? "#FF9F0040" : "#00D4FF30") : "transparent"}`,
                  textTransform: "uppercase",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
              style={{ background: "#0F1A2E", border: "1px solid rgba(0,212,255,0.08)" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: alert.type === "danger" ? "#FF3355" : alert.type === "warning" ? "#FF9F00" : "#00D4FF",
                  boxShadow: `0 0 6px ${alert.type === "danger" ? "#FF3355" : alert.type === "warning" ? "#FF9F00" : "#00D4FF"}`,
                }}
              />
              <span style={{ fontSize: 12, color: "#CBD5E1", flex: 1 }}>{alert.msg}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", whiteSpace: "nowrap" }}>{alert.time}</span>
              <ChevronRight size={12} style={{ color: "#64748B" }} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
