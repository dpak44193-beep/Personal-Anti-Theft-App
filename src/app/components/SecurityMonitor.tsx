import { useState } from "react";
import { Shield, AlertTriangle, Wifi, Smartphone, Eye, Lock, CheckCircle, XCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const radarData = [
  { subject: "Device Lock", A: 92 },
  { subject: "Network", A: 78 },
  { subject: "SIM Guard", A: 95 },
  { subject: "App Safety", A: 84 },
  { subject: "Data Encrypt", A: 99 },
  { subject: "Physical", A: 70 },
];

const events = [
  { id: 1, severity: "critical", type: "SIM Change", desc: "SIM card briefly removed and re-inserted", time: "Yesterday 22:18", device: "Pixel 8 Pro", resolved: true },
  { id: 2, severity: "high", type: "Failed Unlock", desc: "3 consecutive failed biometric unlock attempts", time: "Today 03:07", device: "Pixel 8 Pro", resolved: false },
  { id: 3, severity: "medium", type: "Unknown Network", desc: "Connected to unrecognized Wi-Fi: 'CafeNet-5G'", time: "Today 11:42", device: "Pixel 8 Pro", resolved: false },
  { id: 4, severity: "low", type: "Screen Activity", desc: "Screen turned on at unusual hour (02:34 AM)", time: "Today 02:34", device: "Pixel 8 Pro", resolved: true },
  { id: 5, severity: "low", type: "Location Anomaly", desc: "Device moved 4.2km outside defined home zone", time: "Today 09:22", device: "Samsung S24", resolved: true },
  { id: 6, severity: "medium", type: "App Install", desc: "Unknown APK installation attempt blocked", time: "Yesterday 17:55", device: "Pixel 8 Pro", resolved: true },
];

const checks = [
  { label: "Screen Lock Enabled", ok: true },
  { label: "Find My Device Active", ok: true },
  { label: "USB Debugging Disabled", ok: true },
  { label: "Unknown Sources Blocked", ok: true },
  { label: "Device Encryption On", ok: true },
  { label: "Developer Options Off", ok: false },
  { label: "Safe Boot Disabled", ok: true },
  { label: "Biometric Auth Enrolled", ok: true },
];

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: "rgba(12,19,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(12px)", ...style }}
    >
      {children}
    </div>
  );
}

const severityColor: Record<string, string> = {
  critical: "#FF3355",
  high: "#FF9F00",
  medium: "#00D4FF",
  low: "#39FF14",
};

export function SecurityMonitor() {
  const [filter, setFilter] = useState<"all" | "unresolved">("all");

  const filtered = filter === "all" ? events : events.filter((e) => !e.resolved);

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>Security Monitor</h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Real-time threat detection and device security analysis</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Radar */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 4 }}>Security Radar</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginBottom: 8 }}>Pixel 8 Pro — Overall: 94/100</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#00D4FF" strokeOpacity={0.1} />
              <PolarAngleAxis dataKey="subject" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: "#64748B" }} />
              <Radar name="Security" dataKey="A" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} strokeWidth={1.5} />
              <Tooltip
                contentStyle={{ background: "#0C1322", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#E2E8F0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Checklist */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Security Checklist</div>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                {c.ok ? (
                  <CheckCircle size={13} style={{ color: "#39FF14", shrink: 0 }} />
                ) : (
                  <XCircle size={13} style={{ color: "#FF3355", shrink: 0 }} />
                )}
                <span style={{ fontSize: 11, color: c.ok ? "#CBD5E1" : "#FF3355", fontWeight: c.ok ? 400 : 500 }}>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>
              {checks.filter((c) => c.ok).length}/{checks.length} checks passed
            </div>
          </div>
        </GlassCard>

        {/* SIM Guard */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>SIM Guard Status</div>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg p-3" style={{ background: "#0F1A2E" }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Smartphone size={12} style={{ color: "#00D4FF" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>Current SIM</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#39FF14", boxShadow: "0 0 6px #39FF14" }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00D4FF" }}>T-Mobile US — ICCID: 894101...</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>IMEI: 352****7834 · Registered</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#0F1A2E" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} style={{ color: "#FF9F00" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>Last SIM Event</span>
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>SIM removed & re-inserted</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FF9F00", marginTop: 2 }}>Yesterday at 22:18 · Resolved</div>
            </div>
            <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#0F1A2E" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>SIM Change Alert</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>Notify + lock on SIM swap</div>
              </div>
              <div className="w-8 h-4 rounded-full relative cursor-pointer" style={{ background: "#39FF14" }}>
                <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full" style={{ background: "#070B14" }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Events Timeline */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Security Events</div>
          <div className="flex gap-1">
            {(["all", "unresolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-2.5 py-1 rounded transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  background: filter === f ? "rgba(0,212,255,0.12)" : "transparent",
                  border: `1px solid ${filter === f ? "rgba(0,212,255,0.3)" : "transparent"}`,
                  color: filter === f ? "#00D4FF" : "#64748B",
                  textTransform: "uppercase",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "#0F1A2E", border: `1px solid ${ev.resolved ? "rgba(0,212,255,0.06)" : `${severityColor[ev.severity]}25`}` }}
            >
              <div className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: severityColor[ev.severity], boxShadow: `0 0 6px ${severityColor[ev.severity]}` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 12, fontWeight: 600, color: severityColor[ev.severity] }}>{ev.type}</span>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: `${severityColor[ev.severity]}18`, color: severityColor[ev.severity], border: `1px solid ${severityColor[ev.severity]}30`, textTransform: "uppercase" }}
                  >
                    {ev.severity}
                  </span>
                  {ev.resolved && (
                    <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: "#39FF1415", color: "#39FF14", border: "1px solid #39FF1430" }}>
                      RESOLVED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{ev.desc}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>{ev.device} · {ev.time}</div>
              </div>
              {!ev.resolved && (
                <button
                  className="shrink-0 px-2 py-1 rounded text-xs"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF", fontSize: 10, fontFamily: "'Inter', sans-serif" }}
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
