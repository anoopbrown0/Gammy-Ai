import React, { useState, useRef, useEffect } from "react";
import LucideIcon from "./LucideIcon";

export const UserBanner: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "Anoop Brown";
  });
  const [profileLocation, setProfileLocation] = useState(() => {
    return localStorage.getItem("sabit_profile_location") || "Gurgaon, India";
  });
  const [profileBio, setProfileBio] = useState(() => {
    return localStorage.getItem("sabit_profile_bio") || "High-performance individual cultivating daily consistency, resilience, and laser-focused attention to craft long-term positive routines.";
  });

  const [topHeading, setTopHeading] = useState(() => {
    return localStorage.getItem("sabit_top_heading") || "Habit Tracker";
  });
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [headingInput, setHeadingInput] = useState(topHeading);

  useEffect(() => {
    const handleHeadingChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setTopHeading(customEvent.detail);
        setHeadingInput(customEvent.detail);
      }
    };
    window.addEventListener("sabit_top_heading_changed", handleHeadingChange);
    return () => {
      window.removeEventListener("sabit_top_heading_changed", handleHeadingChange);
    };
  }, []);

  const handleSaveHeading = () => {
    const val = headingInput.trim() || "Habit Tracker";
    setTopHeading(val);
    setIsEditingHeading(false);
    localStorage.setItem("sabit_top_heading", val);
    window.dispatchEvent(new CustomEvent("sabit_top_heading_changed", { detail: val }));
  };
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load persisted images on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("sabit_banner_image");
      if (savedProfile) {
        setProfileImage(savedProfile);
      }
      const savedCover = localStorage.getItem("sabit_banner_cover_image");
      if (savedCover) {
        setCoverImage(savedCover);
      }
    } catch (e) {
      console.error("Failed to load banner/profile images from localStorage", e);
    }

    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfileName(customEvent.detail);
      } else {
        setProfileName(localStorage.getItem("sabit_profile_name") || "Anoop Brown");
      }
      setProfileLocation(localStorage.getItem("sabit_profile_location") || "Gurgaon, India");
      setProfileBio(localStorage.getItem("sabit_profile_bio") || "High-performance individual cultivating daily consistency, resilience, and laser-focused attention to craft long-term positive routines.");
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);

    return () => {
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  const handleProfileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Please upload an image smaller than 1.5MB to ensure safe storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);
      try {
        localStorage.setItem("sabit_banner_image", base64String);
        window.dispatchEvent(new Event("sabit_profile_image_updated"));
      } catch (e) {
        console.error("Failed to save profile image", e);
        alert("This image is too large to store offline. Please try a smaller image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2MB to ensure safe storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setCoverImage(base64String);
      try {
        localStorage.setItem("sabit_banner_cover_image", base64String);
      } catch (e) {
        console.error("Failed to save cover image", e);
        alert("This cover image is too large to store offline. Please try a smaller or more compressed image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProfileUpload(e.target.files[0]);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCoverUpload(e.target.files[0]);
    }
  };

  const triggerAvatarInput = () => {
    avatarInputRef.current?.click();
  };

  const triggerCoverInput = () => {
    coverInputRef.current?.click();
  };

  const handleResetAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage(null);
    try {
      localStorage.removeItem("sabit_banner_image");
      window.dispatchEvent(new Event("sabit_profile_image_updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImage(null);
    try {
      localStorage.removeItem("sabit_banner_cover_image");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = () => {
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      id="sabit-user-banner"
      onDragOver={handleCoverDragOver}
      onDragLeave={handleCoverDragLeave}
      onDrop={handleCoverDrop}
      style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-md mb-6 transition-all duration-300 min-h-[140px] flex flex-col justify-center ${
        coverImage 
          ? "" 
          : "bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A]"
      } ${isDraggingCover ? "ring-4 ring-blue-500 scale-[1.01]" : ""}`}
    >
      {/* Absolute dark cover overlay to maintain stellar text contrast & readability */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none ${
        coverImage ? "bg-slate-950/65 backdrop-blur-[1.5px]" : "bg-transparent"
      }`} />
      
      {/* Decorative background grid/ambient light - only if there's no custom cover image */}
      {!coverImage && (
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none z-0" />
      )}
      
      {/* Hidden file input elements */}
      <input 
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
        id="avatar-image-upload-input"
      />
      <input 
        type="file"
        ref={coverInputRef}
        onChange={handleCoverFileChange}
        accept="image/*"
        className="hidden"
        id="cover-image-upload-input"
      />

      {/* Control Buttons in top right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={triggerCoverInput}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold p-1.5 sm:py-1.5 sm:px-3 rounded-lg shadow-sm transition-all hover:scale-102 active:scale-98"
          title="Upload a custom motivational background image for this banner"
        >
          <LucideIcon name="Image" size={12} />
          <span className="hidden xs:inline">{coverImage ? "Change Cover" : "Upload Banner Cover"}</span>
        </button>
        
        {coverImage && (
          <button
            onClick={handleResetCover}
            className="flex items-center justify-center bg-red-600/25 hover:bg-red-600/80 active:bg-red-600/95 backdrop-blur-md border border-red-500/20 text-white p-1.5 rounded-lg shadow-sm transition-all"
            title="Reset to default professional gradient background"
          >
            <LucideIcon name="Trash2" size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          
          {/* Uploadable Avatar Area */}
          <div 
            onClick={triggerAvatarInput}
            onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); setIsDraggingAvatar(true); }}
            onDragLeave={() => setIsDraggingAvatar(false)}
            onDrop={(e) => { e.stopPropagation(); e.preventDefault(); setIsDraggingAvatar(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleProfileUpload(e.dataTransfer.files[0]); } }}
            className={`relative h-14 w-14 rounded-2xl cursor-pointer overflow-hidden transition-all duration-200 select-none group shrink-0 ${
              isDraggingAvatar ? "ring-2 ring-blue-400 scale-105" : "hover:scale-[1.02]"
            }`}
            title="Click or drag an image here to update your profile photo"
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={profileName} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/10">
                {profileName === "Anoop Brown" ? "AB" : "AS"}
              </div>
            )}
            
            {/* Hover Camera Overlay */}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] font-bold gap-1 text-white">
              <LucideIcon name="Camera" size={14} className="text-white" />
              <span>AVATAR</span>
            </div>
          </div>
 
          <div>
            {/* Top Heading Badge */}
            <div className="mb-1">
              {isEditingHeading ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={headingInput}
                    onChange={(e) => setHeadingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveHeading()}
                    autoFocus
                    className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900/80 border border-blue-400 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveHeading}
                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                  >
                    <LucideIcon name="Check" size={12} />
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-blue-300 backdrop-blur-xs group/bannerhead">
                  <span onClick={() => setIsEditingHeading(true)} className="cursor-pointer hover:underline">{topHeading}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeading(true)}
                    className="opacity-70 group-hover/bannerhead:opacity-100 transition-opacity p-0.5 hover:text-white cursor-pointer"
                    title="Click to edit heading"
                  >
                    <LucideIcon name="Edit3" size={10} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white drop-shadow-sm">{profileName}</h2>
              <span className="bg-[#2563EB]/40 border border-[#2563EB]/60 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-blue-200">
                {profileName === "Anoop Brown" ? "Master Architect" : "Peak Performer"}
              </span>
              <span className="bg-slate-900/50 border border-slate-750 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-slate-200 flex items-center gap-1 backdrop-blur-xs">
                <LucideIcon name="MapPin" size={10} className="text-blue-300" />
                <span>{profileLocation}</span>
              </span>
              {profileImage && (
                <button
                  onClick={handleResetAvatar}
                  className="text-[9px] font-medium text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1 bg-slate-900/40 hover:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700/50"
                  title="Reset profile picture to default initials avatar"
                >
                  <LucideIcon name="User" size={9} />
                  Reset Photo
                </button>
              )}
            </div>
            <p className="text-slate-200 text-xs mt-1 leading-relaxed max-w-xl font-medium drop-shadow-sm">
              {profileBio}
            </p>
          </div>
        </div>

        {/* User stats overview inside the banner */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6 shrink-0 z-10 bg-slate-900/10 md:bg-transparent rounded-xl p-3 md:p-0">
          <div>
            <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider block">Consistency Tier</span>
            <span className="text-xs font-bold text-blue-300 mt-0.5 block drop-shadow-sm">Level 12 Veteran</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider block">Daily Active Streak</span>
            <span className="text-xs font-bold text-amber-300 mt-0.5 flex items-center gap-1 drop-shadow-sm">
              <span>17 Days</span>
              <LucideIcon name="Flame" size={12} className="text-amber-400 animate-pulse" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBanner;

