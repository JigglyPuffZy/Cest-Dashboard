import { useEffect, useState } from "react";
import { Clock, LogIn, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import dostLogo from "../../dost logo.png";

const CHECK_MESSAGES = [
  "Checking approval status…",
  "Waiting for administrator review…",
  "Your request is in the queue…",
  "Still pending — we'll update automatically…",
];

export function GuestWaitingScreen({
  status = "pending",
  displayName = "Guest",
  darkMode = false,
  disconnected = false,
  onStaffSignIn,
  onRefresh,
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const isDeclined = status === "declined";
  const isDisconnected = isDeclined && disconnected;

  useEffect(() => {
    if (isDeclined || !onRefresh) return undefined;
    onRefresh();
    const poll = setInterval(onRefresh, 4000);
    return () => clearInterval(poll);
  }, [isDeclined, onRefresh]);

  useEffect(() => {
    if (isDeclined) return undefined;
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % CHECK_MESSAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isDeclined]);

  const backgroundStyle = {
    background: darkMode
      ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
      : "linear-gradient(135deg, #004A98 0%, #0066CC 50%, #004A98 100%)",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] overflow-hidden p-4"
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md text-center">
        <div
          className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: isDeclined
              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              : "linear-gradient(135deg, #004A98 0%, #0066CC 100%)",
            boxShadow: isDeclined
              ? "0 8px 32px rgba(239, 68, 68, 0.35)"
              : "0 8px 32px rgba(0, 74, 152, 0.4)",
          }}
        >
          {isDeclined ? (
            <ShieldX className="w-12 h-12 text-white" />
          ) : (
            <img
              src={dostLogo}
              alt="DOST Logo"
              className="w-16 h-16 object-contain"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))" }}
            />
          )}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-white/70">
          CEST 2.0 · Guest Access
        </p>

        {isDeclined ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              {isDisconnected ? "Session Ended" : "Access Not Approved"}
            </h1>
            <p className="text-sm leading-relaxed mb-6 text-white/85 px-2">
              {isDisconnected ? (
                <>
                  Hello, {displayName}. An administrator disconnected your guest session for safety. You no longer have access to project records.
                </>
              ) : (
                <>
                  Hello, {displayName}. Your guest access request was declined. Please contact DOST Region II or sign in with staff credentials.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-white">Waiting to Be Accepted</h1>
            <p className="text-sm leading-relaxed mb-2 text-white/90 px-2">
              Hello, {displayName}. Your request has been sent to an administrator.
            </p>
            <p className="text-xs mb-8 text-white/70 px-2">
              You&apos;ll proceed to the dashboard automatically once approved. Please keep this page open.
            </p>

            <div
              className="rounded-2xl p-5 mb-6 text-left"
              style={{
                background: darkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Pending admin approval</p>
                  <p className="text-xs text-white/65 truncate">{CHECK_MESSAGES[messageIndex]}</p>
                </div>
                <Loader2 className="w-5 h-5 text-white/80 animate-spin shrink-0 ml-auto" />
              </div>

              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "40%",
                    background: "linear-gradient(90deg, #f59e0b, #10b981)",
                    animation: "guest-wait-pulse 2s ease-in-out infinite",
                  }}
                />
              </div>

              <div className="flex items-start gap-2 text-xs rounded-xl p-3" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-300" />
                <span className="text-red-100/90">
                  Project records stay locked until you are accepted. No dashboard access until then.
                </span>
              </div>
            </div>
          </>
        )}

        {onStaffSignIn && (
          <button
            type="button"
            onClick={onStaffSignIn}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)",
              boxShadow: "0 4px 16px rgba(0, 74, 152, 0.35)",
            }}
          >
            <LogIn className="w-4 h-4" />
            {isDeclined ? "Back to Sign In" : "Staff Sign In"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes guest-wait-pulse {
          0%, 100% { transform: translateX(-60%); opacity: 0.6; }
          50% { transform: translateX(120%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
