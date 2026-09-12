import React from "react";
import { Badge } from "@/components/ui/Badge";
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { PriorityLevel } from "@/lib/types";

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score }) => {
  const getIcon = () => {
    switch (level.toLowerCase()) {
      case "critical":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case "high":
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case "medium":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getVariant = () => {
    switch (level.toLowerCase()) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      default:
        return "low";
    }
  };

  return (
    <Badge variant={getVariant()} size="md" className="gap-1.5">
      {getIcon()}
      <span>{level} Priority</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] ml-0.5 opacity-80">({score})</span>
      )}
    </Badge>
  );
};
