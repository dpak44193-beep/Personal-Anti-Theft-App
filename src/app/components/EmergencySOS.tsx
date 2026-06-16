import { useState, useEffect } from "react";
import { Phone, MapPin, Share2, AlertTriangle, CheckCircle, X, Clock } from "lucide-react";

const contacts = [
  { id: 1, name: "Sarah Davidson", relation: "Wife", phone: "+1 (555) 210-4832", avatar: "SD", enabled: true },
  { id: 2, name: "Michael Chen", relation: "Friend", phone: "+1 (555) 847-1923", avatar: "MC", enabled: true },
  { id: 3, name: "Local Police (NYC)", relation: "Emergency", phone: "911", avatar: "🚔", enabled: false },
];

const sosHistory = [
  { id: 1, time: "Mar 12, 2025 · 11:48 PM", location: "Grand Central, NYC", contacts: 2, resolved: true },
  { id: 2, time: "Jan 03, 2025 · 09:22 AM", location: "JFK Airport Terminal 4", contacts: 1, resolved: true },
];

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: "rgba(12,19,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

export function EmergencySOS() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [pending, setPending] = useState(false);
  const [contactList, setContactList] = useState(contacts);

  useEffect(() => {
    if (!pending) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setPending(false);
          setSosActive(true);
          return 5;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pending]);

  const triggerSOS = () => {
    if (sosActive) {
      setSosActive(false);
      return;
    }
    setPending(true);
  };

  const cancelSOS = () => {
    setPending(false);
    setCountdown(5);
  };

  const toggleContact = (id: number) => {
    setContactList((list) => list.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>Emergency SOS</h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Instantly alert emergency contacts with your location</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* SOS Button Card */}
        <GlassCard className="flex flex-col items-center py-8" style={{ border: sosActive ? "1px solid rgba(255,51,85,0.4)" : "1px solid rgba(0,212,255,0.15)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 24, alignSelf: "flex-start" }}>Emergency Trigger</div>

          {/* Big SOS button */}
          <div className="relative mb-6">
            {sosActive && (
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,51,85,0.15)", animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite", transform: "scale(1.5)" }}
              />
            )}
            <button
              onClick={triggerSOS}
              disabled={pending}
              className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all"
              style={{
                background: sosActive
                  ? "radial-gradient(circle, #FF3355, #CC0033)"
                  : pending
                    ? "radial-gradient(circle, #FF990020, #FF990010)"
                    : "radial-gradient(circle, #FF335520, #FF335510)",
                border: `3px solid ${sosActive ? "#FF3355" : pending ? "#FF9900" : "#FF335560"}`,
                boxShadow: sosActive ? "0 0 40px #FF335560, 0 0 80px #FF335530" : "0 0 20px #FF335530",
                cursor: pending ? "not-allowed" : "pointer",
              }}
            >
              {pending ? (
                <>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: "#FF9900", lineHeight: 1 }}>{countdown}</span>
                  <span style={{ fontSize: 11, color: "#FF9900", marginTop: 4 }}>Cancel?</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={28} style={{ color: sosActive ? "#ffffff" : "#FF3355", marginBottom: 6 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: sosActive ? "#ffffff" : "#FF3355", lineHeight: 1 }}>SOS</span>
                  <span style={{ fontSize: 10, color: sosActive ? "rgba(255,255,255,0.7)" : "#FF335580", marginTop: 3 }}>
                    {sosActive ? "TAP TO STOP" : "HOLD TO SEND"}
                  </span>
                </>
              )}
            </button>
            {pending && (
              <button
                onClick={cancelSOS}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-lg"
                style={{ background: "rgba(255,153,0,0.12)", border: "1px solid rgba(255,153,0,0.3)", color: "#FF9900", fontSize: 11 }}
              >
                <X size={11} />
                Cancel
              </button>
            )}
          </div>

          {sosActive && (
            <div className="w-full mt-4 p-3 rounded-xl" style={{ background: "rgba(255,51,85,0.08)", border: "1px solid rgba(255,51,85,0.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF3355", boxShadow: "0 0 8px #FF3355" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#FF3355" }}>SOS ACTIVE — BROADCASTING LOCATION</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={11} style={{ color: "#64748B" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#94A3B8" }}>40.6501° N · 73.9496° W · Updating every 30s</span>
              </div>
            </div>
          )}

          <div className="w-full mt-4 p-3 rounded-xl" style={{ background: "#0F1A2E", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1", marginBottom: 8 }}>SOS Actions</div>
            <div className="space-y-2">
              {[
                { label: "Share live location with contacts", enabled: true },
                { label: "Capture front camera photo", enabled: true },
                { label: "Sound loud alarm on device", enabled: false },
                { label: "Auto-call first contact", enabled: false },
              ].map(({ label, enabled }) => (
                <div key={label} className="flex items-center justify-between">
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
                  <div className="w-7 h-4 rounded-full relative" style={{ background: enabled ? "#00D4FF" : "#1A2B3C" }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all" style={{ background: "#070B14", left: enabled ? "calc(100% - 14px)" : "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Contacts */}
        <div className="space-y-4">
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Emergency Contacts</div>
            <div className="space-y-2">
              {contactList.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#0F1A2E", border: `1px solid ${c.enabled ? "rgba(0,212,255,0.12)" : "rgba(0,212,255,0.05)"}`, opacity: c.enabled ? 1 : 0.5 }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
                  >
                    <span style={{ fontSize: c.avatar.length === 1 ? 16 : 11, color: "#00D4FF", fontWeight: 700 }}>{c.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{c.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{c.relation} · {c.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg" style={{ background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.2)" }}>
                      <Phone size={11} style={{ color: "#39FF14" }} />
                    </button>
                    <button onClick={() => toggleContact(c.id)} className="p-1.5 rounded-lg" style={{ background: c.enabled ? "rgba(0,212,255,0.1)" : "rgba(100,116,139,0.1)", border: "1px solid rgba(0,212,255,0.15)" }}>
                      {c.enabled ? <CheckCircle size={11} style={{ color: "#00D4FF" }} /> : <X size={11} style={{ color: "#64748B" }} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-3 py-2 rounded-xl text-sm transition-all"
              style={{ background: "rgba(0,212,255,0.06)", border: "1px dashed rgba(0,212,255,0.2)", color: "#00D4FF", fontSize: 12 }}
            >
              + Add Emergency Contact
            </button>
          </GlassCard>

          {/* SOS History */}
          <GlassCard>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>SOS History</div>
            <div className="space-y-2">
              {sosHistory.map((h) => (
                <div key={h.id} className="rounded-xl p-3" style={{ background: "#0F1A2E" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={11} style={{ color: "#FF3355" }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1" }}>SOS Triggered</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: "#39FF1415", color: "#39FF14", border: "1px solid #39FF1430" }}>
                      RESOLVED
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={9} style={{ color: "#64748B" }} />
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{h.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={9} style={{ color: "#64748B" }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B" }}>{h.time}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B" }}>{h.contacts} contacts notified</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
