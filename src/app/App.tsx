import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { LiveTracking } from "./components/LiveTracking";
import { RemoteControl } from "./components/RemoteControl";
import { SecurityMonitor } from "./components/SecurityMonitor";
import { EvidenceVault } from "./components/EvidenceVault";
import { RecoveryCenter } from "./components/RecoveryCenter";
import { EmergencySOS } from "./components/EmergencySOS";
import { SettingsScreen } from "./components/SettingsScreen";
import { useAuth, usePermissions } from "../services";
import { LoginPage } from "./components/auth/LoginPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { PermissionsScreen } from "./components/auth/PermissionsScreen";

type Screen =
  | "dashboard"
  | "tracking"
  | "recovery"
  | "remote"
  | "security"
  | "evidence"
  | "sos"
  | "settings";

type AuthScreen = "login" | "forgot-password" | "permissions";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const { user, loading: authLoading, signOut } = useAuth();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { permissions, grantDevicePermissions } = usePermissions(user?.id, "web");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    if (user && permissions?.location_access) {
      setPermissionsGranted(true);
    }
  }, [user, permissions]);

  // Close sidebar when screen changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [screen]);

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

  // ============================================================
  // SIMPLIFIED AUTH FLOW: Login → Permissions → Dashboard
  // ============================================================

  // 1. Not logged in → Show Login Page
  if (!user && !authLoading) {
    return (
      <>
        {authScreen === "login" && (
          <LoginPage
            onLoginSuccess={() => {
              // Go directly to permissions (no email verification)
              setAuthScreen("permissions");
            }}
            onForgotPasswordClick={() => setAuthScreen("forgot-password")}
          />
        )}

        {authScreen === "forgot-password" && (
          <ForgotPasswordPage
            onBackClick={() => setAuthScreen("login")}
            onResetSuccess={() => setAuthScreen("login")}
          />
        )}
      </>
    );
  }

  // 2. Logged in but no permissions → Show Permissions Screen
  if (user && !permissionsGranted && !authLoading) {
    return (
      <PermissionsScreen
        onPermissionsGranted={() => {
          setPermissionsGranted(true);
          grantDevicePermissions({
            location_access: true,
            device_management_access: true,
            emergency_sos_access: true,
          });
        }}
        canSkip={true}
      />
    );
  }

  // 3. All checks passed → Show Dashboard
  if (!authLoading) {
    return (
      <div
        className="dark flex flex-col md:flex-row w-full h-screen overflow-hidden"
        style={{ background: "#070B14", fontFamily: "'Inter', sans-serif" }}
      >
        {/* Mobile Header */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(0,212,255,0.1)" }}
        >
          <div style={{ color: "#39FF14", fontWeight: "bold", fontSize: "18px" }}>SecureTrace</div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar - Hidden on mobile, visible on md+ */}
        <div
          className={`${
            sidebarOpen ? "fixed inset-0 z-40 md:z-0 md:static" : "hidden md:flex"
          } flex-col h-full w-60 shrink-0 md:relative`}
          style={{
            background: sidebarOpen ? "#070B14CC" : undefined,
          }}
        >
          {sidebarOpen && (
            <div
              className="md:hidden absolute inset-0"
              onClick={() => setSidebarOpen(false)}
              style={{ background: "rgba(0,0,0,0.5)", zIndex: -1 }}
            />
          )}
          <div className="md:hidden"></div>
          <Sidebar active={screen} onNavigate={setScreen} />
        </div>

        {/* Main Content */}
        <main
          className="flex-1 overflow-hidden flex flex-col md:flex-row"
          style={{ background: "#070B14" }}
        >
          {needsFullHeight ? (
            <div className="w-full h-full overflow-hidden">{screenMap[screen]}</div>
          ) : (
            <div
              className="w-full h-full overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {screenMap[screen]}
            </div>
          )}
        </main>

        {/* Subtle scan-line overlay for cyber feel */}
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
      </div>
    );
  }

  // Loading state
  return (
    <div
      className="flex items-center justify-center w-full h-screen"
      style={{ background: "#070B14" }}
    >
      <div className="text-center">
        <div
          className="animate-spin w-12 h-12 rounded-full border-4 mx-auto mb-4"
          style={{
            borderColor: "rgba(57, 255, 20, 0.3)",
            borderTopColor: "#39FF14",
          }}
        />
        <p style={{ color: "#64748B" }}>Initializing Anti-Theft...</p>
      </div>
    </div>
  );
}
