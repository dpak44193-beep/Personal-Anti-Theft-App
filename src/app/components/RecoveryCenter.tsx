import { useState } from "react";
import { Shield, CheckCircle, Circle, Copy, Share2, FileText, Phone, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const recoverySteps = [
  {
    id: 1,
    title: "Confirm Device is Missing",
    desc: "Verify the device is not nearby and unreachable via call. Note the last known location from the tracking screen.",
    done: true,
    action: null,
  },
  {
    id: 2,
    title: "Activate Theft Mode",
    desc: "Enable enhanced security mode — increases tracking frequency to every 60 seconds, locks all settings, and begins continuous evidence capture.",
    done: true,
    action: "Activate Theft Mode",
    actionColor: "#FF9F00",
  },
  {
    id: 3,
    title: "Remote Lock + Message",
    desc: "Lock the device immediately and display your contact information on the screen to assist honest finders.",
    done: false,
    action: "Lock & Show Message",
    actionColor: "#00D4FF",
  },
  {
    id: 4,
    title: "Report to Authorities",
    desc: "File a police report with your device IMEI and last known location. Use the generated report below.",
    done: false,
    action: "Generate Police Report",
    actionColor: "#39FF14",
  },
  {
    id: 5,
    title: "Contact Carrier",
    desc: "Contact your network carrier to block the device IMEI and prevent unauthorized use.",
    done: false,
    action: "Get Carrier Info",
    actionColor: "#7C3AED",
  },
  {
    id: 6,
    title: "Remote Wipe (Last Resort)",
    desc: "If recovery is unlikely, wipe all personal data remotely to protect your privacy.",
    done: false,
    action: "Initiate Wipe",
    actionColor: "#FF3355",
    danger: true,
  },
];

const recoveryHistory = [
  { id: 1, device: "Pixel 6a — Old", date: "Mar 14, 2024", outcome: "Recovered", days: 2 },
  { id: 2, device: "iPad Air", date: "Nov 08, 2023", outcome: "Wiped", days: 5 },
];

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: "rgba(12,19,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

export function RecoveryCenter() {
  const [steps, setSteps] = useState(recoverySteps.map((s) => ({ ...s })));
  const [expandedStep, setExpandedStep] = useState<number | null>(3);
  const [copied, setCopied] = useState(false);

  const completeStep = (id: number) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: true } : s)));
  };

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const imei = "352092087834561";
  const copyImei = () => {
    navigator.clipboard.writeText(imei);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>Recovery Center</h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Step-by-step guide to recover your stolen device</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Progress */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Recovery Progress</div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>
              {completedCount}/{steps.length} STEPS DONE
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#00D4FF", fontWeight: 700 }}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full mb-4" style={{ background: "#1A2B3C" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(to right, #00D4FF, #39FF14)", boxShadow: "0 0 8px #00D4FF60" }}
            />
          </div>
          <div className="space-y-1.5">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                {s.done ? (
                  <CheckCircle size={12} style={{ color: "#39FF14", shrink: 0 }} />
                ) : (
                  <Circle size={12} style={{ color: "#64748B", shrink: 0 }} />
                )}
                <span style={{ fontSize: 11, color: s.done ? "#CBD5E1" : "#64748B" }}>{s.title}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Device Info */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Device Information</div>
          <div className="space-y-2">
            {[
              { label: "Device", value: "Google Pixel 8 Pro" },
              { label: "Model", value: "GC3VE" },
              { label: "Serial", value: "9A3K2H...XF91" },
              { label: "Color", value: "Obsidian" },
              { label: "Last Seen", value: "47 Westfield Ave, BK" },
              { label: "Lost At", value: "Today ~13:00" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#CBD5E1" }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 rounded-lg" style={{ background: "#0F1A2E", border: "1px solid rgba(0,212,255,0.12)" }}>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>IMEI Number</div>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#00D4FF" }}>{imei}</span>
              <button onClick={copyImei} className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(0,212,255,0.1)", color: copied ? "#39FF14" : "#00D4FF", fontSize: 10 }}>
                {copied ? <CheckCircle size={10} /> : <Copy size={10} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* History */}
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Recovery History</div>
          {recoveryHistory.map((r) => (
            <div key={r.id} className="rounded-lg p-3 mb-2" style={{ background: "#0F1A2E" }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1" }}>{r.device}</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: r.outcome === "Recovered" ? "#39FF1415" : "#FF335515", color: r.outcome === "Recovered" ? "#39FF14" : "#FF3355", border: `1px solid ${r.outcome === "Recovered" ? "#39FF1430" : "#FF335530"}` }}
                >
                  {r.outcome.toUpperCase()}
                </span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B" }}>{r.date} · {r.days} days</div>
            </div>
          ))}
          <div className="mt-2 p-3 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: "#00D4FF" }} />
              <span style={{ fontSize: 12, color: "#00D4FF", fontWeight: 600 }}>2 devices protected</span>
            </div>
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>50% recovery success rate with SecureTrace</p>
          </div>
        </GlassCard>
      </div>

      {/* Recovery Steps */}
      <GlassCard>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>Recovery Action Plan</div>
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${step.done ? "rgba(57,255,20,0.15)" : expandedStep === step.id ? "rgba(0,212,255,0.25)" : "rgba(0,212,255,0.08)"}`,
                background: step.done ? "rgba(57,255,20,0.04)" : "#0F1A2E",
              }}
            >
              <button
                className="w-full flex items-center gap-3 p-3 text-left"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: step.done ? "rgba(57,255,20,0.15)" : "rgba(0,212,255,0.1)",
                    border: `1px solid ${step.done ? "#39FF1440" : "#00D4FF30"}`,
                  }}
                >
                  {step.done ? (
                    <CheckCircle size={12} style={{ color: "#39FF14" }} />
                  ) : (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#00D4FF" }}>{step.id}</span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step.done ? "#64748B" : "#E2E8F0", flex: 1, textDecoration: step.done ? "line-through" : "none" }}>
                  {step.title}
                </span>
                {expandedStep === step.id ? <ChevronUp size={13} style={{ color: "#64748B" }} /> : <ChevronDown size={13} style={{ color: "#64748B" }} />}
              </button>
              {expandedStep === step.id && (
                <div className="px-3 pb-3">
                  <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10, paddingLeft: 36 }}>{step.desc}</p>
                  {step.action && !step.done && (
                    <div className="pl-9">
                      <button
                        onClick={() => completeStep(step.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{
                          background: `${step.actionColor}15`,
                          border: `1px solid ${step.actionColor}35`,
                          color: step.actionColor,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {step.danger ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                        {step.action}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
