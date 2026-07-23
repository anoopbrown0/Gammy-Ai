import React, { useState, useEffect } from "react";
import LucideIcon from "./LucideIcon";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  onResetProgress: () => void;
  onDeleteAllHabits: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  setIsDark,
  onResetProgress,
  onDeleteAllHabits,
}) => {
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
            <LucideIcon name="Settings" size={16} className="text-blue-500 animate-spin-slow" />
            <div>
              <h3 className="text-sm font-black tracking-tight leading-none">Ledger Configuration</h3>
              <p className="text-[10px] text-slate-400 mt-1">Manage profile, preferences, and workspace variables.</p>
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
              className={`w-full px-3.5 py-2 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-white focus:ring-blue-500 focus:border-blue-500" 
                  : "bg-slate-50 border-slate-200 text-[#0F172A] focus:ring-blue-600 focus:border-blue-600"
              }`}
              placeholder="e.g., Anoop Brown"
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
              className={`w-full px-3.5 py-2 text-xs font-bold rounded-xl border focus:outline-none focus:ring-1 transition-all ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-white focus:ring-blue-500 focus:border-blue-500" 
                  : "bg-slate-50 border-slate-200 text-[#0F172A] focus:ring-blue-600 focus:border-blue-600"
              }`}
              placeholder="e.g., anoop@sabit.ai"
            />
          </div>

          {/* Preferences */}
          <div className={`p-3 rounded-xl border space-y-3 ${isDark ? "bg-slate-900/45 border-slate-800/80" : "bg-slate-50 border-slate-100"}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferences</span>
            
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
