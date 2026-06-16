import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { LiveTracking } from "./components/LiveTracking";
import { RemoteControl } from "./components/RemoteControl";
import { SecurityMonitor } from "./components/SecurityMonitor";
import { EvidenceVault } from "./components/EvidenceVault";
import { RecoveryCenter } from "./components/RecoveryCenter";
import { EmergencySOS } from "./components/EmergencySOS";
import { SettingsScreen } from "./components/SettingsScreen";

type Screen =
  | "dashboard"
  | "tracking"
  | "recovery"
  | "remote"
  | "security"
  | "evidence"
  | "sos"
  | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  const screenMap: Record<Screen, React.ReactNode> = {
    dashboard: <Dashboard />,
    tracking: <LiveTracking />,
    recovery: <RecoveryCenter />,
    remote: <RemoteControl />,
    security: <SecurityMonitor />,
    evidence: <EvidenceVault />,
    sos: <EmergencySOS />,
    settings: <SettingsScreen />,
  };

  const needsFullHeight = screen === "tracking" || screen === "evidence";

  return (
    <div
      className="dark flex w-full h-screen overflow-hidden"
      style={{ background: "#070B14", fontFamily: "'Inter', sans-serif" }}
    >
      <Sidebar active={screen} onNavigate={setScreen} />
      <main
        className="flex-1 overflow-hidden"
        style={{ background: "#070B14" }}
      >
        {needsFullHeight ? (
          <div className="h-full overflow-hidden">{screenMap[screen]}</div>
        ) : (
          <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {screenMap[screen]}
          </div>
        )}
      </main>

      {/* Subtle scan-line overlay for cyber feel */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
}
