import { useState } from "react";
import { Bell, Lock, MessageSquare, Camera, Trash2, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

type ActionState = "idle" | "pending" | "success" | "error";

interface ActionCard {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  glow: string;
  danger?: boolean;
}

const actions: ActionCard[] = [
  {
    id: "ring",
    label: "Ring Device",
    desc: "Play loud alarm at max volume for 30 seconds",
    icon: Bell,
    color: "#00D4FF",
    glow: "#00D4FF",
  },
  {
    id: "lock",
    label: "Lock Device",
    desc: "Immediately lock screen and require PIN/biometric",
    icon: Lock,
    color: "#39FF14",
    glow: "#39FF14",
  },
  {
    id: "message",
    label: "Display Message",
    desc: "Show recovery message on lock screen",
    icon: MessageSquare,
    color: "#FF9F00",
    glow: "#FF9F00",
  },
  {
    id: "photo",
    label: "Capture Photo",
    desc: "Silently capture photo using front camera",
    icon: Camera,
    color: "#7C3AED",
    glow: "#7C3AED",
  },
  {
    id: "wipe",
    label: "Remote Wipe",
    desc: "Permanently erase all device data",
    icon: Trash2,
    color: "#FF3355",
    glow: "#FF3355",
    danger: true,
  },
];

const cmdHistory = [
  { cmd: "Ring Device", status: "success", time: "Today 14:32", device: "Pixel 8 Pro" },
  { cmd: "Lock Device", status: "success", time: "Today 09:15", device: "Pixel 8 Pro" },
  { cmd: "Capture Photo", status: "success", time: "Yesterday 22:44", device: "Samsung S24" },
  { cmd: "Display Message", status: "error", time: "Yesterday 18:30", device: "iPhone 15" },
];

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="rounded-xl p-4"
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

export function RemoteControl() {
  const [states, setStates] = useState<Record<string, ActionState>>({});
  const [message, setMessage] = useState("This device has been reported stolen. Please call +1 (555) 892-4401.");
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("Pixel 8 Pro — James");

  const trigger = (id: string) => {
    if (id === "wipe" && !wipeConfirm) {
      setWipeConfirm(true);
      return;
    }
    setStates((s) => ({ ...s, [id]: "pending" }));
    setTimeout(() => {
      setStates((s) => ({ ...s, [id]: "success" }));
      setWipeConfirm(false);
      setTimeout(() => setStates((s) => ({ ...s, [id]: "idle" })), 3000);
    }, 1800);
  };

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>Remote Control</h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Send commands directly to your registered devices</p>
      </div>

      {/* Device selector */}
      <GlassCard>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Target Device
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Pixel 8 Pro — James", "Samsung S24 — Sarah", "iPhone 15 — Michael"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDevice(d)}
              className="px-3 py-1.5 rounded-lg transition-all"
              style={{
                fontSize: 12,
                fontWeight: 500,
                background: selectedDevice === d ? "rgba(0,212,255,0.12)" : "#0F1A2E",
                border: `1px solid ${selectedDevice === d ? "#00D4FF40" : "rgba(0,212,255,0.08)"}`,
                color: selectedDevice === d ? "#00D4FF" : "#94A3B8",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Action grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const state = states[action.id] || "idle";
          return (
            <div
              key={action.id}
              className="rounded-xl p-4 transition-all"
              style={{
                background: "rgba(12,19,34,0.8)",
                border: `1px solid ${action.danger ? "rgba(255,51,85,0.2)" : "rgba(0,212,255,0.15)"}`,
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${action.glow}18`,
                    border: `1px solid ${action.glow}35`,
                    boxShadow: state === "success" ? `0 0 16px ${action.glow}50` : "none",
                    transition: "box-shadow 0.3s",
                  }}
                >
                  {state === "success" ? (
                    <CheckCircle size={18} style={{ color: "#39FF14" }} />
                  ) : (
                    <Icon size={18} style={{ color: action.color }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{action.label}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{action.desc}</div>
                </div>
              </div>

              {action.id === "message" && (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 mb-3 resize-none outline-none"
                  style={{
                    background: "#0F1A2E",
                    border: "1px solid rgba(0,212,255,0.15)",
                    color: "#CBD5E1",
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              )}

              {action.id === "wipe" && wipeConfirm && (
                <div className="mb-3 p-2 rounded-lg" style={{ background: "rgba(255,51,85,0.08)", border: "1px solid rgba(255,51,85,0.25)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} style={{ color: "#FF3355" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#FF3355" }}>This action is irreversible!</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>All data will be permanently erased. Click again to confirm.</p>
                </div>
              )}

              <button
                onClick={() => trigger(action.id)}
                disabled={state === "pending"}
                className="w-full py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                style={{
                  background: state === "success"
                    ? "rgba(57,255,20,0.12)"
                    : action.danger
                      ? "rgba(255,51,85,0.12)"
                      : `rgba(${action.color === "#00D4FF" ? "0,212,255" : action.color === "#39FF14" ? "57,255,20" : action.color === "#FF9F00" ? "255,159,0" : "124,58,237"},0.1)`,
                  border: `1px solid ${state === "success" ? "#39FF1440" : action.danger ? "#FF335540" : `${action.glow}35`}`,
                  color: state === "success" ? "#39FF14" : action.danger ? "#FF3355" : action.color,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: state === "pending" ? "wait" : "pointer",
                  opacity: state === "pending" ? 0.7 : 1,
                }}
              >
                {state === "pending" ? (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Sending...
                  </>
                ) : state === "success" ? (
                  <>
                    <CheckCircle size={13} />
                    Command Sent
                  </>
                ) : (
                  <>
                    <Icon size={13} />
                    {action.id === "wipe" && wipeConfirm ? "Confirm Wipe" : action.label}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Command history */}
      <GlassCard>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Command History</div>
        <div className="space-y-2">
          {cmdHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "#0F1A2E" }}>
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: h.status === "success" ? "#39FF14" : "#FF3355", boxShadow: `0 0 5px ${h.status === "success" ? "#39FF14" : "#FF3355"}` }}
              />
              <span style={{ fontSize: 12, color: "#CBD5E1", flex: 1 }}>{h.cmd}</span>
              <span style={{ fontSize: 11, color: "#64748B" }}>{h.device}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{h.time}</span>
              <ChevronRight size={12} style={{ color: "#64748B" }} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
