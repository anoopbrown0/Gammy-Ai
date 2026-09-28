import React, { useState, useEffect } from "react";
import LucideIcon from "./LucideIcon";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isGlassMode?: boolean;
  setIsGlassMode?: (val: boolean) => void;
  onResetProgress: () => void;
  onDeleteAllHabits: () => void;
  onOpenPaymentModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  setIsDark,
  isGlassMode = true,
  setIsGlassMode,
  onResetProgress,
  onDeleteAllHabits,
  onOpenPaymentModal,
}) => {
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileImportRef = React.useRef<HTMLInputElement>(null);

  const handleExportLifelongLedger = () => {
    try {
      const habits = localStorage.getItem("gammy_lifelong_habits_master") || localStorage.getItem("sabit_habits_master") || "[]";
      const logs = localStorage.getItem("gammy_lifelong_logs_master") || localStorage.getItem("sabit_all_logs_master") || "[]";
      const data = {
        exportDate: new Date().toISOString(),
        appName: "Gammy Habit Tracker",
        version: "2026.1",
        habits: JSON.parse(habits),
        logs: JSON.parse(logs)
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gammy_lifelong_habits_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { detail: "Lifelong habit ledger exported successfully!" }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { detail: "Failed to export data." }));
    }
  };

  const handleImportLifelongLedger = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.habits && Array.isArray(parsed.habits)) {
          localStorage.setItem("gammy_lifelong_habits_master", JSON.stringify(parsed.habits));
          localStorage.setItem("sabit_habits_master", JSON.stringify(parsed.habits));
        }
        if (parsed.logs && Array.isArray(parsed.logs)) {
          localStorage.setItem("gammy_lifelong_logs_master", JSON.stringify(parsed.logs));
          localStorage.setItem("sabit_all_logs_master", JSON.stringify(parsed.logs));
        }
        window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { detail: "Lifelong ledger imported and restored! Reloading..." }));
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        alert("Invalid backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (isOpen) {
      setProfileName(localStorage.getItem("sabit_profile_name") || "Anoop Brown");
      setProfileEmail(localStorage.getItem("sabit_profile_email") || "anoop@sabit.ai");
      setShowTips(localStorage.getItem("sabit_show_tips") !== "false");
      setShowConfirmReset(false);
      setShowConfirmDelete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    localStorage.setItem("sabit_profile_name", profileName.trim());
    localStorage.setItem("sabit_profile_email", profileEmail.trim() || "anoop@sabit.ai");
    localStorage.setItem("sabit_show_tips", String(showTips));

    // Dispatch custom events to sync other components
    window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: profileName.trim() }));
    window.dispatchEvent(new CustomEvent("sabit_show_tips_changed", { detail: showTips }));
    window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { 
      detail: "Ledger configuration settings updated successfully!" 
    }));
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-xl transition-all transform duration-300 select-none ${
          isDark 
            ? "bg-[#0F172A] border-slate-800 text-white" 
            : "bg-white border-slate-100 text-slate-900"
        }`}
      >
        {/* Subtle glowing ambient background block */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <LucideIcon name="Settings" size={16} className="text-[#007AFF]" />
            <div>
              <h3 className="text-sm font-bold tracking-tight leading-none">Account & Settings</h3>
              <p className="text-[10px] text-slate-400 mt-1">Manage your profile, preferences, and habits.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-50 text-slate-400 hover:text-slate-800"
            }`}
          >
            <LucideIcon name="X" size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          {/* Pro Membership Banner with UPI & Card */}
          {onOpenPaymentModal && (
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark 
                ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-amber-500/30" 
                : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <LucideIcon name="CreditCard" size={15} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">Gammy Pro Membership</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                      UPI & Card
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Instant GPay, PhonePe, Paytm, or Credit Card checkout
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPaymentModal();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* User Settings Row */}
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Profile Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500" 
                  : "bg-slate-50 border-slate-200 text-[#0F172A] focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400"
              }`}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Email Address
            </label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500" 
                  : "bg-slate-50 border-slate-200 text-[#0F172A] focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400"
              }`}
              placeholder="name@example.com"
            />
          </div>

          {/* Preferences */}
          <div className={`p-3 rounded-xl border space-y-3 ${isDark ? "bg-slate-900/45 border-slate-800/80" : "bg-slate-50 border-slate-100"}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferences</span>
            
            {/* Clean Glassmorphism Mode Toggle option */}
            {setIsGlassMode && (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">Clean Glassmorphism UI</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                      2026 Style
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">Frosted glass backdrop blur, luminous glows, and sleek minimal aesthetics.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGlassMode(!isGlassMode)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isGlassMode ? "bg-cyan-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isGlassMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Theme Toggle option */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Dark Canvas Mode</span>
                <span className="text-[9px] text-slate-400">Enable deep eye-friendly dark colors.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDark ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isDark ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Quote Tips Toggle option */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Consistency Matrix Tips</span>
                <span className="text-[9px] text-slate-400">Show motivational quotes and routine guides.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showTips ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    showTips ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Lifelong Cloud Ledger & Data Protection */}
          <div className={`p-3 rounded-xl border space-y-2.5 ${isDark ? "bg-blue-950/20 border-blue-900/40" : "bg-blue-50/40 border-blue-100"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Lifelong Data Persistence</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud & Local Sync Active</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Your habits, check-ins, and streaks are continuously synchronized to Firestore Cloud and multi-layer local master storage for lifelong durability.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportLifelongLedger}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <LucideIcon name="Download" size={11} />
                <span>Export Ledger (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileImportRef.current?.click()}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  isDark ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LucideIcon name="Upload" size={11} />
                <span>Restore Backup</span>
              </button>
              <input
                type="file"
                ref={fileImportRef}
                onChange={handleImportLifelongLedger}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`p-3 rounded-xl border border-red-200/20 space-y-2.5 ${isDark ? "bg-red-950/10" : "bg-red-50/20"}`}>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Danger Zone</span>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold">Reset Daily Checklists</span>
                <span className="text-[9px] text-slate-400">Clear all checkboxes and restore active days to locked.</span>
              </div>
              
              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmReset(true);
                    setShowConfirmDelete(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                    isDark 
                      ? "border-red-900/40 text-red-400 hover:bg-red-950/40" 
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  Reset
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setShowConfirmReset(false);
                      window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { detail: "All habit progress cleared to fresh state." }));
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className={`px-2 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                      isDark ? "border-slate-800 text-slate-400 hover:bg-slate-900" : "border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-red-200/10 pt-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold">Remove All Habits</span>
                <span className="text-[9px] text-slate-400">Delete all registered habits in your workspace.</span>
              </div>
              
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDelete(true);
                    setShowConfirmReset(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                    isDark 
                      ? "border-red-900/40 text-red-400 hover:bg-red-950/40" 
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  Delete All
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteAllHabits();
                      setShowConfirmDelete(false);
                      window.dispatchEvent(new CustomEvent("sabit_trigger_toast", { detail: "Workspace cleared of all habits." }));
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className={`px-2 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                      isDark ? "border-slate-800 text-slate-400 hover:bg-slate-900" : "border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className={`flex items-center justify-end pt-4 border-t mt-5 gap-2.5 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all ${
                isDark 
                  ? "border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white text-xs font-bold rounded-xl hover:scale-102 active:scale-98 shadow-sm transition-all flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              <LucideIcon name="Check" size={13} strokeWidth={2.5} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
