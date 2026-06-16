import { useState, useEffect } from "react";
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
import { EmailVerificationPage } from "./components/auth/EmailVerificationPage";
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

type AuthScreen = "login" | "forgot-password" | "email-verification" | "permissions";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const { user, loading: authLoading, emailVerified, signOut } = useAuth();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { permissions, grantDevicePermissions } = usePermissions(user?.id, "web");

  // Check permissions on mount
  useEffect(() => {
    if (user && emailVerified && permissions?.location_access) {
      setPermissionsGranted(true);
    }
  }, [user, emailVerified, permissions]);

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
  // AUTH FLOW GUARDS
  // ============================================================

  // 1. Not logged in → Show Login Page
  if (!user && !authLoading) {
    return (
      <>
        {authScreen === "login" && (
          <LoginPage
            onLoginSuccess={() => {
              // Will refetch user due to useAuth subscription
              setAuthScreen("email-verification");
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

  // 2. Logged in but email not verified → Show Email Verification
  if (user && !emailVerified && !authLoading) {
    return (
      <EmailVerificationPage
        email={user.email || ""}
        onVerificationComplete={() => {
          setAuthScreen("permissions");
        }}
      />
    );
  }

  // 3. Logged in and email verified but no permissions → Show Permissions Screen
  if (user && emailVerified && !permissionsGranted && !authLoading) {
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

  // 4. All checks passed → Show Dashboard
  if (!authLoading) {
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
