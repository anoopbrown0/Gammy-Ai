import React from "react";
import LucideIcon from "./LucideIcon";

interface IOSBottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  onOpenAddHabit: () => void;
}

export const IOSBottomTabBar: React.FC<IOSBottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  onOpenAddHabit,
}) => {
  const tabs = [
    { id: "dashboard", label: "Today", icon: "LayoutGrid" },
    { id: "habits", label: "Habits", icon: "CheckSquare" },
    { id: "performance", label: "Analytics", icon: "BarChart3" },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-[300px] sm:w-full sm:max-w-xl px-1 sm:px-4 flex justify-center pointer-events-none">
      <nav 
        className={`pointer-events-auto w-full flex items-center justify-between gap-1 sm:gap-2.5 p-1 sm:p-2 rounded-full border transition-all duration-300 ${
          isDark 
            ? "bg-[#1C1C1E]/50 border-white/20 text-white shadow-[0_12px_40px_rgba(0,0,0,0.4)] ring-1 ring-white/15 backdrop-blur-2xl" 
            : "bg-white/50 border-white/80 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-black/10 backdrop-blur-2xl"
        }`}
      >
        <div className="flex items-center justify-around flex-1 gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[9px] sm:text-xs transition-all duration-200 cursor-pointer select-none active:scale-95 flex-1 ${
                  isActive
                    ? "bg-[#007AFF] text-white font-bold shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/40"
                    : isDark
                      ? "text-slate-400 hover:text-slate-200 font-medium hover:bg-white/10"
                      : "text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100/80"
                }`}
              >
                <LucideIcon name={tab.icon} size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                <span className="tracking-tight truncate max-w-[50px] sm:max-w-none text-center font-semibold leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`h-5 sm:h-6 w-[1px] mx-1 shrink-0 ${isDark ? "bg-white/15" : "bg-slate-200"}`} />

        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-1">
          <button
            type="button"
            onClick={onOpenAddHabit}
            className="px-2.5 sm:px-4.5 py-1.5 sm:py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-500/30 flex items-center justify-center gap-1 cursor-pointer ring-1 ring-emerald-400/40"
            title="Add New Habit"
          >
            <LucideIcon name="Plus" size={16} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px]" />
            <span className="hidden sm:inline font-bold">New</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default IOSBottomTabBar;
