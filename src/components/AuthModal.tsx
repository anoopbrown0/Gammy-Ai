import React, { useState } from "react";
import { LucideIcon } from "./LucideIcon";
import { 
  loginUserWithEmail, 
  registerUserWithEmail, 
  loginWithGoogle, 
  loginAsGuest,
  sendPasswordReset,
  formatAuthOrFirestoreError
} from "../lib/firestoreService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  onSuccess?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isDark, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUserWithEmail(email, password);
        onSuccess?.("Welcome back! Signed in successfully.");
        onClose();
      } else if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        await registerUserWithEmail(email, password, name);
        onSuccess?.("Account created successfully! Welcome to Gammy.");
        onClose();
      } else if (mode === "forgot") {
        if (!email.trim()) {
          setError("Please enter your email address.");
          setLoading(false);
          return;
        }
        await sendPasswordReset(email);
        setInfo("Password reset link sent to your email.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(formatAuthOrFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.("Signed in with Google successfully!");
      onClose();
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(formatAuthOrFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsGuest();
      onSuccess?.("Signed in as Guest Explorer! Enjoy tracking your habits.");
      onClose();
    } catch (err: any) {
      setError(formatAuthOrFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all relative ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <LucideIcon name="X" size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3 shadow-lg shadow-blue-500/20">
            G
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Gammy Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "login" && "Sign in to access your habits and AI Coach history"}
            {mode === "signup" && "Start tracking habits with real-time cloud synchronization"}
            {mode === "forgot" && "We'll send a password recovery link to your inbox"}
          </p>
        </div>

        {/* Error / Info alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <LucideIcon name="AlertCircle" size={16} className="shrink-0" />
              <span>Authentication Error</span>
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

        {/* Google & Guest Sign In */}
        {mode !== "forgot" && (
          <div className="mb-5 space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer ${
                isDark
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDark
                  ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                  : "bg-slate-100/70 border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <LucideIcon name="UserCheck" size={14} className="text-blue-500" />
              <span>Explore as Guest (Instant Access)</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? "border-slate-800" : "border-slate-200"}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 text-slate-400 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                  or with email
                </span>
              </div>
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
                placeholder="Anoop Brown"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
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
              placeholder="user@example.com"
              className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
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
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <LucideIcon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <>
                <span>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Link"}
                </span>
                <LucideIcon name="ArrowRight" size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "login" && (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setError(null); setMode("signup"); }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
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
                onClick={() => { setError(null); setMode("login"); }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
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
                onClick={() => { setError(null); setMode("login"); }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

