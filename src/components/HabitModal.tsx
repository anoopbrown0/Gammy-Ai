import React, { useState, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: { name: string; goal: string; color: string; iconName: string; category: "habit" | "active" | "leisure"; active?: boolean }) => void;
  onDelete?: () => void; // Optional for Edit Mode
  habit?: Habit | null; // Null means "Add" mode, otherwise "Edit" mode
  isDark?: boolean;
}

const AVAILABLE_ICONS = [
  "Dumbbell", "BookOpen", "Brain", "Code", "Footprints", 
  "Droplet", "Coins", "Languages", "Zap", "Heart", 
  "Music", "Brush", "Smile", "Compass", "Trophy", "Activity"
];

const AVAILABLE_COLORS = [
  "#2563EB", // Royal Blue
  "#7C3AED", // Violet Purple
  "#10B981", // Emerald Green
  "#0EA5E9", // Sky Blue
  "#F59E0B", // Amber Orange
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  habit,
  isDark = false,
}) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Activity");
  const [selectedColor, setSelectedColor] = useState("#2563EB");
  const [category, setCategory] = useState<"habit" | "active" | "leisure">("habit");
  const [activeStatus, setActiveStatus] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!habit;

  // Reset or fill values when modal opens or habit changes
  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setName(habit.name);
        setGoal(habit.goal);
        setSelectedIcon(habit.iconName || "Activity");
        setSelectedColor(habit.color || "#2563EB");
        setCategory(habit.category || "habit");
        setActiveStatus(habit.active !== false);
      } else {
        setName("");
        setGoal("");
        setSelectedIcon("Activity");
        setSelectedColor("#2563EB");
        setCategory("habit");
        setActiveStatus(true);
      }
      setError("");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, habit]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, showDeleteConfirm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    const cleanGoal = goal.trim() || "1x / day";

    onSave({
      name: name.trim(),
      goal: cleanGoal,
      color: selectedColor,
      iconName: selectedIcon,
      category,
      active: activeStatus,
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div 
      id="habit-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="habit-modal-container"
        className={`p-6 border shadow-2xl max-w-md w-full relative z-10 animate-zoom-in overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 ${
          isDark 
            ? "bg-slate-900 border-slate-800 text-slate-100" 
            : "bg-white border-slate-100 text-[#0F172A]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle glowing ambient background block */}
        <div 
          className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-10 pointer-events-none blur-3xl transition-colors duration-500"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
              <LucideIcon name="AlertTriangle" size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold">Delete "{habit?.name}"?</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                This action cannot be undone. All recorded history and logs for this habit will be permanently deleted.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b mb-5 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-2 rounded-xl text-white transition-all duration-300"
                  style={{ backgroundColor: selectedColor }}
                >
                  <LucideIcon name={selectedIcon} size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold tracking-tight ${isDark ? "text-slate-100" : "text-[#0F172A]"}`}>
                    {isEditMode ? "Edit Habit Details" : "Create New Habit"}
                  </h3>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                    {isEditMode ? "Modify habit parameters" : "Establish a new routine"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                }`}
                title="Close dialog"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Error notification */}
            {error && (
              <div className={`text-xs font-semibold p-3 rounded-xl mb-4 border flex items-center gap-2 ${
                isDark ? "bg-red-950/40 border-red-900/40 text-red-400" : "bg-red-50 border-red-100 text-red-600"
              }`}>
                <LucideIcon name="AlertCircle" size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name input */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Habit Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Reading, Journaling, Yoga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full text-xs font-semibold p-3 rounded-xl transition-all border focus:outline-hidden ${
                    isDark 
                      ? "text-slate-100 bg-slate-950 border-slate-800 focus:border-slate-700 focus:bg-slate-950" 
                      : "text-slate-800 bg-slate-50 border-slate-200 focus:border-slate-300 focus:bg-white"
                  }`}
                  maxLength={25}
                  autoFocus
                />
              </div>

              {/* Goal input */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Daily/Weekly Goal
                </label>
                <input 
                  type="text"
                  placeholder="e.g., 30 min/day, 3x / week"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={`w-full text-xs font-semibold p-3 rounded-xl transition-all border focus:outline-hidden ${
                    isDark 
                      ? "text-slate-100 bg-slate-950 border-slate-800 focus:border-slate-700 focus:bg-slate-950" 
                      : "text-slate-800 bg-slate-50 border-slate-200 focus:border-slate-300 focus:bg-white"
                  }`}
                  maxLength={20}
                />
              </div>

              {/* Status toggle in Edit mode */}
              {isEditMode && (
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Habit State
                  </label>
                  <div className={`grid grid-cols-2 gap-2 p-1.5 border rounded-xl ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setActiveStatus(true)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeStatus
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <LucideIcon name="Play" size={12} />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStatus(false)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        !activeStatus
                          ? "bg-amber-600 text-white shadow-xs"
                          : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <LucideIcon name="Pause" size={12} />
                      <span>Paused</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Category selection */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Select Category
                </label>
                <div className={`grid grid-cols-3 gap-2 p-1.5 border rounded-xl ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  {(["habit", "active", "leisure"] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        category === cat
                          ? "bg-slate-900 text-white shadow-xs dark:bg-slate-800"
                          : isDark
                            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
                      }`}
                    >
                      {cat === "active" ? "Active" : cat === "leisure" ? "Leisure" : "Habit"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Select Icon
                </label>
                <div className={`grid grid-cols-8 gap-2 p-2 border rounded-xl max-h-24 overflow-y-auto custom-scrollbar ${
                  isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50/70 border-slate-100"
                }`}>
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? "text-white shadow-xs scale-110"
                          : isDark
                            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800"
                      }`}
                      style={{
                        backgroundColor: selectedIcon === icon ? selectedColor : undefined,
                      }}
                      title={icon}
                    >
                      <LucideIcon name={icon} size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 pl-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Select Color
                </label>
                <div className={`flex flex-wrap gap-2.5 p-2 border rounded-xl justify-between ${
                  isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50/70 border-slate-100"
                }`}>
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="h-6 w-6 rounded-full border-2 transition-all relative flex items-center justify-center shrink-0 hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColor === color ? "white" : "transparent",
                        boxShadow: selectedColor === color ? "0 0 0 1.5px " + color : undefined,
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <LucideIcon name="Check" size={10} className="text-white font-extrabold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className={`flex items-center justify-between pt-4 border-t mt-6 gap-3 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}>
                {isEditMode && onDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isDark ? "text-red-400 hover:text-red-300 hover:bg-red-950/30" : "text-red-500 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title="Permanently remove habit and delete activity data"
                  >
                    <LucideIcon name="Trash2" size={12} />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2.5 border text-xs font-bold rounded-xl transition-all ${
                      isDark 
                        ? "border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-white text-xs font-bold rounded-xl hover:scale-102 active:scale-98 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <LucideIcon name={isEditMode ? "Check" : "Plus"} size={13} strokeWidth={2.5} />
                    <span>{isEditMode ? "Save Changes" : "Create Habit"}</span>
                  </button>
                </div>
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default HabitModal;
