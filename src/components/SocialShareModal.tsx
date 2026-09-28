import React, { useState, useRef, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  currentDay: number;
  currentMonth: string;
  currentYear: string;
  userName?: string;
  userEmail?: string;
  currentStreak?: number;
  isDark?: boolean;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  habits,
  currentDay,
  currentMonth,
  currentYear,
  userName = "Anoop Brown",
  currentStreak = 17,
  isDark = true,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Retrieve user's configured profile name & custom avatar if saved
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || userName || "Anoop Brown";
  });
  const [profileAvatar, setProfileAvatar] = useState<string | null>(() => {
    return localStorage.getItem("sabit_banner_image") || null;
  });

  useEffect(() => {
    const savedName = localStorage.getItem("sabit_profile_name");
    if (savedName) setProfileName(savedName);
    const savedAvatar = localStorage.getItem("sabit_banner_image");
    if (savedAvatar) setProfileAvatar(savedAvatar);
  }, [isOpen]);

  if (!isOpen) return null;

  const todayIdx = currentDay - 1;
  const completedHabits = habits.filter((h) => h.days && h.days[todayIdx] === "completed");
  const dateFormatted = `${currentMonth} ${currentDay}, ${currentYear}`;

  // Two primary active habits + previous 3 tracked habits
  const primaryHabits = habits.slice(0, 2);
  const previousHabits = habits.slice(2, 5);

  // 7-day consistency graph trend (matches main app ProgressChart)
  const getDayRate = (dayNum: number): number => {
    if (!habits || habits.length === 0) return 0;
    const dIdx = Math.max(0, Math.min(30, dayNum - 1));
    const doneCount = habits.filter((h) => h.days && h.days[dIdx] === "completed").length;
    return Math.round((doneCount / habits.length) * 100);
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trendPoints = Array.from({ length: 7 }, (_, i) => {
    const dayOffset = i - 6; // -6 to 0 (today)
    const targetDay = Math.max(1, currentDay + dayOffset);
    const rate = getDayRate(targetDay);
    const label = dayLabels[(targetDay + 3) % 7];
    return {
      day: targetDay,
      label,
      rate,
      isToday: i === 6,
    };
  });

  const avgWeeklyRate = Math.round(
    trendPoints.reduce((acc, p) => acc + p.rate, 0) / trendPoints.length
  );

  // SVG Coordinates for clean sparkline curve
  const svgWidth = 320;
  const svgHeight = 64;
  const padX = 12;
  const padY = 10;
  const innerW = svgWidth - padX * 2;
  const innerH = svgHeight - padY * 2;

  const chartCoords = trendPoints.map((pt, idx) => {
    const x = padX + (idx / (trendPoints.length - 1)) * innerW;
    const y = padY + innerH - (pt.rate / 100) * innerH;
    return { x, y, ...pt };
  });

  let curvePathD = "";
  let areaPathD = "";
  if (chartCoords.length > 0) {
    curvePathD = `M ${chartCoords[0].x} ${chartCoords[0].y}`;
    for (let i = 0; i < chartCoords.length - 1; i++) {
      const curr = chartCoords[i];
      const next = chartCoords[i + 1];
      const cpX = (curr.x + next.x) / 2;
      curvePathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    const last = chartCoords[chartCoords.length - 1];
    const first = chartCoords[0];
    areaPathD = `${curvePathD} L ${last.x} ${padY + innerH} L ${first.x} ${padY + innerH} Z`;
  }

  // 1080 x 1350 High-Resolution Instagram 4:5 Export (Theme-Adaptive Clean Minimal Canvas)
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      const width = 1080;
      const height = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Theme-responsive background
        if (isDark) {
          ctx.fillStyle = "#0A0D14";
          ctx.fillRect(0, 0, width, height);

          // Subtle ambient glow for dark mode
          const glow = ctx.createRadialGradient(280, 220, 20, 280, 220, 520);
          glow.addColorStop(0, "rgba(59, 130, 246, 0.15)");
          glow.addColorStop(0.5, "rgba(99, 102, 241, 0.06)");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);
        } else {
          // Minimal Crisp White canvas for light mode
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(0, 0, width, height);

          const glow = ctx.createRadialGradient(280, 220, 20, 280, 220, 520);
          glow.addColorStop(0, "rgba(37, 99, 235, 0.08)");
          glow.addColorStop(0.6, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);
        }

        // Clean Glass Card Frame
        const cardX = 75;
        const cardY = 75;
        const cardW = width - 150;
        const cardH = height - 150;
        const radius = 44;

        // Draw Card Body
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
        ctx.fillStyle = isDark ? "rgba(22, 27, 38, 0.90)" : "rgba(255, 255, 255, 0.96)";
        ctx.fill();

        // Border
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(226, 232, 240, 0.9)";
        ctx.stroke();
        ctx.restore();

        // Top Header: User Profile Picture with Instagram Story Ring
        const avatarX = cardX + 48;
        const avatarY = cardY + 48;
        const avatarR = 42;

        ctx.save();
        // Instagram gradient ring
        ctx.beginPath();
        ctx.arc(avatarX + avatarR, avatarY + avatarR, avatarR + 5, 0, Math.PI * 2);
        const ringGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + 88, avatarY + 88);
        ringGrad.addColorStop(0, "#2563EB");
        ringGrad.addColorStop(0.5, "#7C3AED");
        ringGrad.addColorStop(1, "#EC4899");
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Clip Avatar Image
        ctx.beginPath();
        ctx.arc(avatarX + avatarR, avatarY + avatarR, avatarR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        let avatarDrawn = false;
        if (profileAvatar) {
          try {
            const img = new Image();
            img.src = profileAvatar;
            if (img.complete && img.naturalWidth !== 0) {
              ctx.drawImage(img, avatarX, avatarY, avatarR * 2, avatarR * 2);
              avatarDrawn = true;
            }
          } catch (_) {
            avatarDrawn = false;
          }
        }

        if (!avatarDrawn) {
          const avGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + 84, avatarY + 84);
          avGrad.addColorStop(0, "#2563EB");
          avGrad.addColorStop(1, "#7C3AED");
          ctx.fillStyle = avGrad;
          ctx.fillRect(avatarX, avatarY, avatarR * 2, avatarR * 2);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 38px 'Plus Jakarta Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const initial = (profileName.charAt(0) || "A").toUpperCase();
          ctx.fillText(initial, avatarX + avatarR, avatarY + avatarR);
        }
        ctx.restore();

        // Profile Name & Date
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDark ? "#FFFFFF" : "#0F172A";
        ctx.font = "800 36px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(profileName, avatarX + 110, avatarY + 10);

        ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
        ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`${dateFormatted}`, avatarX + 110, avatarY + 52);

        // Top Streak Badge
        ctx.save();
        const badgeW = 200;
        const badgeH = 48;
        const badgeX = cardX + cardW - badgeW - 48;
        const badgeY = avatarY + 18;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 24);
        ctx.fillStyle = isDark ? "rgba(249, 115, 22, 0.15)" : "rgba(249, 115, 22, 0.1)";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(249, 115, 22, 0.35)";
        ctx.stroke();

        ctx.fillStyle = isDark ? "#FB923C" : "#EA580C";
        ctx.font = "800 21px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`🔥 ${currentStreak}d Streak`, badgeX + badgeW / 2, badgeY + badgeH / 2);
        ctx.restore();

        // Divider
        ctx.beginPath();
        ctx.moveTo(cardX + 48, cardY + 155);
        ctx.lineTo(cardX + cardW - 48, cardY + 155);
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
        ctx.stroke();

        // Section 1: Active Targets (2 Habits)
        ctx.textAlign = "left";
        ctx.font = "800 21px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = isDark ? "#93C5FD" : "#2563EB";
        ctx.fillText("ACTIVE TARGETS", cardX + 48, cardY + 180);

        primaryHabits.forEach((habit, idx) => {
          const rowY = cardY + 220 + idx * 105;
          const isDone = habit.days && habit.days[todayIdx] === "completed";

          // Frosted Glass Pill
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX + 48, rowY, cardW - 96, 86, 22);
          ctx.fillStyle = isDark 
            ? (isDone ? "rgba(37, 99, 235, 0.15)" : "rgba(255, 255, 255, 0.04)")
            : (isDone ? "rgba(239, 246, 255, 0.9)" : "rgba(248, 250, 252, 0.9)");
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isDark 
            ? (isDone ? "rgba(59, 130, 246, 0.35)" : "rgba(255, 255, 255, 0.08)")
            : (isDone ? "rgba(191, 219, 254, 0.9)" : "rgba(226, 232, 240, 0.8)");
          ctx.stroke();
          ctx.restore();

          // Dot
          ctx.beginPath();
          ctx.arc(cardX + 86, rowY + 43, 12, 0, Math.PI * 2);
          ctx.fillStyle = habit.color || "#2563EB";
          ctx.fill();

          // Title
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillStyle = isDark ? "#FFFFFF" : "#0F172A";
          ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(habit.name, cardX + 115, rowY + 43);

          // Count
          ctx.textAlign = "right";
          ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif";
          ctx.fillStyle = isDone ? "#10B981" : (isDark ? "#94A3B8" : "#64748B");
          ctx.fillText(isDone ? "Done ✓" : (habit.goal || "1x / day"), cardX + cardW - 80, rowY + 43);
        });

        // Section 2: Previous Routines (3 Habits)
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "800 21px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.55)" : "#64748B";
        ctx.fillText("PREVIOUS ROUTINES", cardX + 48, cardY + 455);

        previousHabits.forEach((habit, idx) => {
          const rowY = cardY + 495 + idx * 82;
          const isDone = habit.days && habit.days[todayIdx] === "completed";

          // Frosted Row
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX + 48, rowY, cardW - 96, 70, 18);
          ctx.fillStyle = isDark 
            ? (isDone ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)")
            : (isDone ? "rgba(240, 253, 244, 0.8)" : "rgba(248, 250, 252, 0.7)");
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = isDark 
            ? (isDone ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)")
            : (isDone ? "rgba(187, 247, 208, 0.7)" : "rgba(226, 232, 240, 0.6)");
          ctx.stroke();
          ctx.restore();

          // Dot
          ctx.beginPath();
          ctx.arc(cardX + 82, rowY + 35, 8, 0, Math.PI * 2);
          ctx.fillStyle = habit.color || "#7C3AED";
          ctx.fill();

          // Title
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillStyle = isDark ? "#E2E8F0" : "#1E293B";
          ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(habit.name, cardX + 105, rowY + 35);

          // Status
          ctx.textAlign = "right";
          ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
          ctx.fillStyle = isDone ? "#10B981" : (isDark ? "rgba(255, 255, 255, 0.4)" : "#94A3B8");
          ctx.fillText(isDone ? "✓ Done" : (habit.goal || "Daily"), cardX + cardW - 80, rowY + 35);
        });

        // Section 3: Consistency Graph (Bottom)
        const chartBoxY = cardY + 770;
        const chartBoxH = 340;
        const chartBoxW = cardW - 96;
        const chartBoxX = cardX + 48;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(chartBoxX, chartBoxY, chartBoxW, chartBoxH, 26);
        ctx.fillStyle = isDark ? "rgba(15, 20, 30, 0.7)" : "rgba(248, 250, 252, 0.85)";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.8)";
        ctx.stroke();
        ctx.restore();

        // Chart Header
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDark ? "#FFFFFF" : "#0F172A";
        ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Consistency Momentum", chartBoxX + 26, chartBoxY + 22);

        ctx.textAlign = "right";
        ctx.fillStyle = isDark ? "#60A5FA" : "#2563EB";
        ctx.font = "800 23px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`${avgWeeklyRate}% Flow`, chartBoxX + chartBoxW - 26, chartBoxY + 22);

        // Chart Curves
        const gLeft = chartBoxX + 32;
        const gRight = chartBoxX + chartBoxW - 32;
        const gTop = chartBoxY + 75;
        const gBottom = chartBoxY + chartBoxH - 60;
        const gW = gRight - gLeft;
        const gH = gBottom - gTop;

        const cPoints = trendPoints.map((pt, i) => {
          const x = gLeft + (i / (trendPoints.length - 1)) * gW;
          const y = gTop + gH - (pt.rate / 100) * gH;
          return { x, y, ...pt };
        });

        // Fill area
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cPoints[0].x, cPoints[0].y);
        for (let i = 0; i < cPoints.length - 1; i++) {
          const curr = cPoints[i];
          const next = cPoints[i + 1];
          const cpX = (curr.x + next.x) / 2;
          ctx.bezierCurveTo(cpX, curr.y, cpX, next.y, next.x, next.y);
        }
        ctx.lineTo(cPoints[cPoints.length - 1].x, gBottom);
        ctx.lineTo(cPoints[0].x, gBottom);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, gTop, 0, gBottom);
        areaGrad.addColorStop(0, isDark ? "rgba(59, 130, 246, 0.25)" : "rgba(37, 99, 235, 0.18)");
        areaGrad.addColorStop(1, "rgba(59, 130, 246, 0.01)");
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        ctx.moveTo(cPoints[0].x, cPoints[0].y);
        for (let i = 0; i < cPoints.length - 1; i++) {
          const curr = cPoints[i];
          const next = cPoints[i + 1];
          const cpX = (curr.x + next.x) / 2;
          ctx.bezierCurveTo(cpX, curr.y, cpX, next.y, next.x, next.y);
        }
        ctx.strokeStyle = isDark ? "#60A5FA" : "#2563EB";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Points
        cPoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.isToday ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = pt.isToday ? (isDark ? "#FFFFFF" : "#2563EB") : (isDark ? "#60A5FA" : "#93C5FD");
          ctx.fill();
          if (pt.isToday) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = isDark ? "#3B82F6" : "#FFFFFF";
            ctx.stroke();
          }

          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = pt.isToday ? (isDark ? "#FFFFFF" : "#0F172A") : (isDark ? "rgba(255, 255, 255, 0.45)" : "#94A3B8");
          ctx.font = pt.isToday ? "700 19px 'Plus Jakarta Sans', sans-serif" : "500 17px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(pt.label, pt.x, gBottom + 14);
        });
        ctx.restore();

        // Watermark
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.35)";
        ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("gammy.app • Daily Routine Ledger", width / 2, height - 95);

        // Download PNG
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `gammy_share_${currentMonth}_${currentDay}.png`;
        a.click();

        window.dispatchEvent(
          new CustomEvent("sabit_trigger_toast", {
            detail: "Share card saved to downloads! 📸",
          })
        );
      }
    } catch (e) {
      console.error("Failed to generate card image", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = `✨ Gammy Daily Habit Ledger (${dateFormatted})
👤 ${profileName} • 🔥 ${currentStreak} Days Streak
🎯 Active Targets:
${primaryHabits.map((h) => `• ${h.name}: ${h.days && h.days[todayIdx] === "completed" ? "Done ✓" : "In Progress"}`).join("\n")}
📋 Previous Routines:
${previousHabits.map((h) => `• ${h.name}: ${h.days && h.days[todayIdx] === "completed" ? "Done ✓" : "Daily"}`).join("\n")}
📊 7-Day Consistency: ${avgWeeklyRate}%
Track routines on gammy.app`;

      await navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);

      window.dispatchEvent(
        new CustomEvent("sabit_trigger_toast", {
          detail: "Clean habit summary copied to clipboard! 📋",
        })
      );
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-fadeIn">
      {/* Modal Dialog Container */}
      <div className={`relative w-full max-w-sm max-h-[96vh] overflow-y-auto custom-scrollbar rounded-3xl border shadow-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors ${
        isDark 
          ? "bg-[#121620]/95 border-white/15 text-white" 
          : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/40"
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-2 border-b ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <LucideIcon name="Share2" size={14} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Share Card</h3>
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                4:5 Minimalist Glassmorphism
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark 
                ? "bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            }`}
            aria-label="Close"
          >
            <LucideIcon name="X" size={16} />
          </button>
        </div>

        {/* 4:5 INSTAGRAM RATIO CARD VIEW (MINIMAL WHITE / THEME ADAPTIVE GLASSMORPHISM) */}
        <div className="flex justify-center w-full">
          <div
            ref={cardRef}
            className={`w-full aspect-[4/5] rounded-[28px] p-4 sm:p-4.5 minimal-glass-card shadow-2xl relative overflow-hidden flex flex-col justify-between transition-colors ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {/* Ambient Refraction Glow Orbs */}
            <div className={`absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              isDark ? "bg-blue-500/15" : "bg-blue-200/50"
            }`} />
            <div className={`absolute -bottom-14 -right-14 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              isDark ? "bg-indigo-600/12" : "bg-indigo-100/60"
            }`} />

            {/* TOP BAR: USER PROFILE PICTURE & NAME */}
            <div className={`flex items-center justify-between gap-2.5 relative z-10 pb-2 border-b ${
              isDark ? "border-white/10" : "border-slate-200/80"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Profile Avatar with Instagram Story Ring */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 shadow-sm flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-xs">
                      {profileAvatar ? (
                        <img
                          src={profileAvatar}
                          alt={profileName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{(profileName.charAt(0) || "A").toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Name & Date */}
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-extrabold truncate tracking-tight">
                    {profileName}
                  </h4>
                  <p className={`text-[10px] font-medium truncate ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {dateFormatted}
                  </p>
                </div>
              </div>

              {/* Streak Badge */}
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
                isDark 
                  ? "border-amber-500/30 bg-amber-500/15 text-amber-300" 
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}>
                🔥 {currentStreak}d Streak
              </div>
            </div>

            {/* MIDDLE SECTION: TWO ACTIVE TARGETS + PREVIOUS THREE ROUTINES */}
            <div className="my-auto space-y-2 relative z-10 py-0.5">
              
              {/* TWO ACTIVE TARGETS */}
              <div className="space-y-1">
                <div className={`text-[8px] font-extrabold uppercase tracking-wider px-0.5 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}>
                  Active Targets
                </div>
                {primaryHabits.map((habit) => {
                  const isDone = habit.days && habit.days[todayIdx] === "completed";
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                        isDark 
                          ? (isDone ? "bg-blue-600/15 border-blue-500/30 text-white" : "bg-white/[0.04] border-white/[0.08] text-slate-200")
                          : (isDone ? "bg-blue-50/90 border-blue-200 text-slate-900" : "bg-white/80 border-slate-200/70 text-slate-700 shadow-xs")
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || "#2563EB" }}
                        />
                        <span className="text-[11px] font-bold truncate">
                          {habit.name}
                        </span>
                      </div>
                      <span className={`text-[9px] font-extrabold font-mono shrink-0 ${
                        isDone 
                          ? (isDark ? "text-emerald-400" : "text-emerald-600") 
                          : (isDark ? "text-slate-400" : "text-slate-500")
                      }`}>
                        {isDone ? "Done ✓" : (habit.goal || "1x / day")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* PREVIOUS THREE ROUTINES */}
              {previousHabits.length > 0 && (
                <div className="space-y-1">
                  <div className={`text-[8px] font-extrabold uppercase tracking-wider px-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Previous Routines
                  </div>
                  {previousHabits.map((habit) => {
                    const isDone = habit.days && habit.days[todayIdx] === "completed";
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] ${
                          isDark 
                            ? "border-white/[0.06] bg-white/[0.02] text-slate-300" 
                            : "border-slate-100 bg-slate-50/80 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color || "#7C3AED" }}
                          />
                          <span className="truncate font-medium">
                            {habit.name}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono shrink-0 ${
                          isDone 
                            ? (isDark ? "text-emerald-400" : "text-emerald-600") 
                            : (isDark ? "text-slate-500" : "text-slate-400")
                        }`}>
                          {isDone ? "✓ Done" : "Daily"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BOTTOM SECTION: PROGRESS GRAPH */}
            <div className={`relative z-10 pt-1 border-t ${
              isDark ? "border-white/10" : "border-slate-200/80"
            }`}>
              <div className={`rounded-xl p-2 border backdrop-blur-md ${
                isDark 
                  ? "border-white/10 bg-black/40" 
                  : "border-slate-200/80 bg-slate-50/80"
              }`}>
                <div className="flex items-center justify-between text-[9px] pb-0.5 px-0.5">
                  <span className="font-extrabold">Consistency Momentum</span>
                  <span className={`font-mono font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}>{avgWeeklyRate}% Flow</span>
                </div>

                {/* Smooth Bezier Chart */}
                <div className="w-full h-11 relative">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="themeChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? "0.35" : "0.22"} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {areaPathD && (
                      <path d={areaPathD} fill="url(#themeChartGrad)" />
                    )}

                    {curvePathD && (
                      <path
                        d={curvePathD}
                        fill="none"
                        stroke={isDark ? "#60A5FA" : "#2563EB"}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    )}

                    {chartCoords.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={pt.isToday ? 3 : 2}
                        fill={pt.isToday ? (isDark ? "#FFFFFF" : "#2563EB") : (isDark ? "#60A5FA" : "#93C5FD")}
                      />
                    ))}
                  </svg>
                </div>

                {/* Day Labels */}
                <div className={`flex justify-between text-[8px] font-mono pt-0.5 px-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {trendPoints.map((pt, i) => (
                    <span key={i} className={pt.isToday ? (isDark ? "text-white font-bold" : "text-slate-900 font-bold") : ""}>
                      {pt.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Minimal Watermark */}
              <div className={`pt-1.5 flex items-center justify-between text-[8px] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                <span className="font-semibold">gammy.app</span>
                <span className="font-mono">
                  {completedHabits.length}/{habits.length} Done Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LucideIcon name="Download" size={13} />
            <span>{isDownloading ? "Saving..." : "Save Image"}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${
              isDark 
                ? "bg-white/10 hover:bg-white/15 border-white/15 text-white" 
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
            }`}
          >
            <LucideIcon
              name={isCopied ? "Check" : "Copy"}
              size={13}
              className={isCopied ? "text-emerald-500" : ""}
            />
            <span>{isCopied ? "Copied!" : "Copy Text"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
