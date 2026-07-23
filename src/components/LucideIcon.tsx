import React from "react";
import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  className = "",
  size = 20,
  strokeWidth = 2,
}) => {
  // Safe lookup with HelpCircle fallback
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};

export default LucideIcon;
