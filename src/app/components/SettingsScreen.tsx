import { useState } from "react";
import { Smartphone, Bell, Camera, Shield, User, Key, Trash2, ChevronRight, CheckCircle } from "lucide-react";

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: "rgba(12,19,34,0.8)", border: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-8 h-4 rounded-full relative transition-colors"
      style={{ background: on ? "#00D4FF" : "#1A2B3C" }}
    >
      <div
        className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
        style={{ background: on ? "#070B14" : "#64748B", left: on ? "calc(100% - 14px)" : "2px" }}
      />
    </button>
  );
}

function SettingRow({ label, sublabel, right }: { label: string; sublabel?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{sublabel}</div>}
      </div>
      {right}
    </div>
  );
}

export function SettingsScreen() {
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    backgroundTracking: true,
    highPrecision: false,
    batteryOptimization: true,
    simChangeAlert: true,
    failedUnlockAlert: true,
    locationZoneAlert: true,
    screenOnAlert: false,
    captureOnFail: true,
    captureOnSim: true,
    captureResolution: "HD",
    autoUpload: true,
    encryptCaptures: true,
    twoFactor: true,
    biometric: true,
    sessionTimeout: "30m",
  });

  const toggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings((s) => ({ ...s, [key]: !s[key] }));
    }
  };

  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>Settings</h1>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Configure SecureTrace for your devices</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
          style={{
            background: saved ? "rgba(57,255,20,0.12)" : "rgba(0,212,255,0.12)",
            border: `1px solid ${saved ? "rgba(57,255,20,0.3)" : "rgba(0,212,255,0.3)"}`,
            color: saved ? "#39FF14" : "#00D4FF",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {saved ? <CheckCircle size={13} /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tracking */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={14} style={{ color: "#00D4FF" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Tracking Settings</span>
          </div>
          <SettingRow label="Enable Tracking" sublabel="Master switch for GPS monitoring" right={<Toggle on={settings.trackingEnabled} onToggle={() => toggle("trackingEnabled")} />} />
          <SettingRow label="Background Tracking" sublabel="Continue tracking when app is closed" right={<Toggle on={settings.backgroundTracking} onToggle={() => toggle("backgroundTracking")} />} />
          <SettingRow label="High Precision Mode" sublabel="Uses more battery for better accuracy" right={<Toggle on={settings.highPrecision} onToggle={() => toggle("highPrecision")} />} />
          <SettingRow label="Battery Optimization" sublabel="Reduce frequency when battery < 20%" right={<Toggle on={settings.batteryOptimization} onToggle={() => toggle("batteryOptimization")} />} />
          <div className="py-3">
            <div style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1", marginBottom: 6 }}>Update Frequency</div>
            <div className="flex gap-2 flex-wrap">
              {["30s", "1m", "5m", "10m"].map((f) => (
                <button
                  key={f}
                  className="px-3 py-1 rounded-lg"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    background: f === "1m" ? "rgba(0,212,255,0.15)" : "#0F1A2E",
                    border: `1px solid ${f === "1m" ? "rgba(0,212,255,0.3)" : "rgba(0,212,255,0.08)"}`,
                    color: f === "1m" ? "#00D4FF" : "#64748B",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Alerts */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} style={{ color: "#FF9F00" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Alert Settings</span>
          </div>
          <SettingRow label="SIM Change Alert" sublabel="Alert when SIM is removed or changed" right={<Toggle on={settings.simChangeAlert} onToggle={() => toggle("simChangeAlert")} />} />
          <SettingRow label="Failed Unlock Alert" sublabel="Alert after 3 consecutive failures" right={<Toggle on={settings.failedUnlockAlert} onToggle={() => toggle("failedUnlockAlert")} />} />
          <SettingRow label="Location Zone Alert" sublabel="Alert when device leaves defined zones" right={<Toggle on={settings.locationZoneAlert} onToggle={() => toggle("locationZoneAlert")} />} />
          <SettingRow label="Screen On Events" sublabel="Log unusual screen-on activities" right={<Toggle on={settings.screenOnAlert} onToggle={() => toggle("screenOnAlert")} />} />
          <div className="py-3">
            <div style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1", marginBottom: 6 }}>Notification Channels</div>
            <div className="flex gap-2 flex-wrap">
              {["Push", "SMS", "Email"].map((c) => (
                <button
                  key={c}
                  className="px-3 py-1 rounded-lg"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    background: c !== "Email" ? "rgba(0,212,255,0.12)" : "#0F1A2E",
                    border: `1px solid ${c !== "Email" ? "rgba(0,212,255,0.25)" : "rgba(0,212,255,0.08)"}`,
                    color: c !== "Email" ? "#00D4FF" : "#64748B",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Evidence */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Camera size={14} style={{ color: "#7C3AED" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Evidence Capture</span>
          </div>
          <SettingRow label="Capture on Failed Unlock" sublabel="Front camera photo after 3 failures" right={<Toggle on={settings.captureOnFail} onToggle={() => toggle("captureOnFail")} />} />
          <SettingRow label="Capture on SIM Change" sublabel="Photo when SIM card is swapped" right={<Toggle on={settings.captureOnSim} onToggle={() => toggle("captureOnSim")} />} />
          <SettingRow label="Auto-Upload to Cloud" sublabel="Immediately backup captures" right={<Toggle on={settings.autoUpload} onToggle={() => toggle("autoUpload")} />} />
          <SettingRow label="Encrypt Captures" sublabel="AES-256 encryption for all evidence" right={<Toggle on={settings.encryptCaptures} onToggle={() => toggle("encryptCaptures")} />} />
          <div className="py-3">
            <div style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1", marginBottom: 6 }}>Photo Resolution</div>
            <div className="flex gap-2">
              {["SD", "HD", "Full HD"].map((r) => (
                <button
                  key={r}
                  className="px-3 py-1 rounded-lg"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    background: r === settings.captureResolution ? "rgba(124,58,237,0.15)" : "#0F1A2E",
                    border: `1px solid ${r === settings.captureResolution ? "rgba(124,58,237,0.3)" : "rgba(0,212,255,0.08)"}`,
                    color: r === settings.captureResolution ? "#7C3AED" : "#64748B",
                  }}
                  onClick={() => setSettings((s) => ({ ...s, captureResolution: r }))}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: "#39FF14" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Account Security</span>
          </div>
          <SettingRow label="Two-Factor Authentication" sublabel="SMS or authenticator app required" right={<Toggle on={settings.twoFactor} onToggle={() => toggle("twoFactor")} />} />
          <SettingRow label="Biometric Login" sublabel="Use fingerprint or face ID for app access" right={<Toggle on={settings.biometric} onToggle={() => toggle("biometric")} />} />
          <SettingRow
            label="Session Timeout"
            sublabel="Auto-lock after inactivity"
            right={
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00D4FF", background: "rgba(0,212,255,0.1)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(0,212,255,0.2)" }}>
                30m
              </span>
            }
          />
          <SettingRow
            label="Change Master Password"
            sublabel="Last changed 43 days ago"
            right={<ChevronRight size={14} style={{ color: "#64748B" }} />}
          />
          <div className="pt-3">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg w-full justify-center"
              style={{ background: "rgba(255,51,85,0.06)", border: "1px solid rgba(255,51,85,0.15)", color: "#FF3355", fontSize: 12 }}
            >
              <Trash2 size={12} />
              Delete Account & All Data
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Account Info */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <User size={14} style={{ color: "#00D4FF" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Account</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#00D4FF" }}>JD</span>
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>James Davidson</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748B" }}>james.davidson@protonmail.com</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, background: "rgba(57,255,20,0.1)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.2)" }}>
                PRO PLAN
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#64748B" }}>Renews Jan 16, 2026</span>
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94A3B8" }}>3 devices registered</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>12.4 GB vault used</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
