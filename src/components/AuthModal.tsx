import React, { useState } from "react";
import { LucideIcon } from "./LucideIcon";
import { 
  sendPasswordReset,
  loginUserWithEmail,
  registerUserWithEmail,
  loginWithGoogle,
  formatAuthOrFirestoreError
} from "../lib/firestoreService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  onSuccess?: (msg: string) => void;
  initialMode?: "login" | "signup" | "forgot" | "verify";
  initialUnverifiedEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  isDark, 
  onSuccess, 
  initialMode = "login",
  initialUnverifiedEmail
}) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">(initialMode);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(initialUnverifiedEmail || null);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsSuccessAnim(false);
      setSuccessMsg("");
      if (initialUnverifiedEmail) {
        setUnverifiedEmail(initialUnverifiedEmail);
        setEmail(initialUnverifiedEmail);
      } else {
        setEmail("");
      }
      setPassword("");
      setName("");
      setError(null);
      setInfo(null);
    }
  }, [isOpen, initialMode, initialUnverifiedEmail]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onClose();
        onSuccess?.(`Welcome, ${user.displayName || user.email || "User"}!`);
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err?.message || "Google sign-in could not be completed. Please try with your email.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUserWithEmail(email, password);
        setPassword("");
        setError(null);
        onClose();
        onSuccess?.("Logged in successfully");
      } else if (mode === "signup") {
        await registerUserWithEmail(email, password, name);
        setPassword("");
        setError(null);
        onClose();
        onSuccess?.("Account created successfully");
      } else if (mode === "forgot") {
        if (!email.trim()) {
          setError("Please enter your email address.");
          return;
        }
        await sendPasswordReset(email);
        setInfo("Password reset link sent to your email.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err?.isUnverified || (err?.message && String(err.message).startsWith("UNVERIFIED_EMAIL:"))) {
        const targetEmail = err.email || String(err.message || "").replace("UNVERIFIED_EMAIL:", "") || email;
        setUnverifiedEmail(targetEmail);
        setMode("verify");
      } else {
        setError(err?.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all relative overflow-hidden ${
          isDark 
            ? "bg-[#0D121F] border-slate-800 text-slate-100 shadow-black/80" 
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/60"
        }`}
      >
        {/* Subtle Ambient Background Glow Inside Modal */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button (hidden during success animation) */}
        {!isSuccessAnim && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <LucideIcon name="X" size={18} />
          </button>
        )}

        {/* 1. ANIMATED RIGHT-TICK SUCCESS SCREEN */}
        {isSuccessAnim ? (
          <div className="text-center py-6 sm:py-8 space-y-6 animate-scale-success flex flex-col items-center justify-center relative z-10">
            {/* Animated Checkmark Circle */}
            <div className="relative flex items-center justify-center">
              {/* Outer Ripple Effect */}
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-circle-ripple pointer-events-none" />
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/30 to-blue-500/30 blur-md pointer-events-none" />
              
              {/* Main Checkmark Container */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                <svg 
                  className="w-10 h-10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline 
                    points="20 6 9 17 4 12" 
                    className="animate-checkmark-draw text-white" 
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                {successMsg}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Loading your routines and cloud ledger...
              </p>
            </div>

            {/* Subtle Progress bar */}
            <div className="w-36 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse" />
            </div>
          </div>
        ) : mode === "verify" ? (
          <div className="text-center py-2 space-y-6 animate-fadeIn relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1 ring-1 ring-blue-500/20">
              <LucideIcon name="MailCheck" size={32} />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-1">
                We have sent you a verification email to <span className="font-semibold text-slate-900 dark:text-slate-100">{unverifiedEmail || email}</span>. Please verify it and log in.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (unverifiedEmail) setEmail(unverifiedEmail);
                  setPassword("");
                  setError(null);
                  setMode("login");
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login</span>
                <LucideIcon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl mb-3 shadow-lg shadow-blue-500/25">
                G
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {mode === "login" && "Welcome Back"}
                {mode === "signup" && "Create Gammy Account"}
                {mode === "forgot" && "Reset Password"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === "login" && "Sign in with your Gmail to sync habits across any device"}
                {mode === "signup" && "Connect your Gmail for real-time cloud backup and sync"}
                {mode === "forgot" && "We'll send a password recovery link to your inbox"}
              </p>
            </div>

            {/* Error / Info alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <LucideIcon name="AlertCircle" size={16} className="shrink-0" />
                  <span>Authentication Notice</span>
                </div>
                <p className="leading-relaxed opacity-95">{error}</p>
              </div>
            )}
            {info && (
              <div className="mb-4 p-3 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <LucideIcon name="CheckCircle2" size={16} className="shrink-0" />
                <span>{info}</span>
              </div>
            )}

            {/* Primary Google Login Button */}
            {mode !== "forgot" && (
              <div className="space-y-3 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className={`w-full py-3 px-4 rounded-2xl border font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] ${
                    isDark 
                      ? "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white shadow-black/40" 
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-slate-200/60"
                  }`}
                >
                  {googleLoading ? (
                    <LucideIcon name="Loader2" size={18} className="animate-spin text-blue-500" />
                  ) : (
                    <>
                      {/* Official Google SVG Icon */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-[#0D121F] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    Or with email
                  </span>
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDark ? "bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark ? "bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setError(null); setMode("forgot"); }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark ? "bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <LucideIcon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <LucideIcon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Sign In with Email"}
                      {mode === "signup" && "Create Account"}
                      {mode === "forgot" && "Send Reset Link"}
                    </span>
                    <LucideIcon name="ArrowRight" size={16} />
                  </>
                )}
              </button>

              {/* Error message under form */}
              {error && (
                <p className="text-xs font-semibold text-rose-500 text-center mt-2.5 animate-fadeIn">
                  {error}
                </p>
              )}
            </form>

            {/* Footer Navigation */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === "login" && (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setName("");
                      setEmail("");
                      setPassword("");
                      setMode("signup");
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setName("");
                      setEmail("");
                      setPassword("");
                      setMode("login");
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                  >
                    Log In
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <p>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setName("");
                      setEmail("");
                      setPassword("");
                      setMode("login");
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

