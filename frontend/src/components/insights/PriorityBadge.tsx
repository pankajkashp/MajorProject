import React from "react";
import { Badge } from "@/components/ui/Badge";
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface PriorityBadgeProps {
  level: string;
  score?: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score }) => {
  const levelUpper = (level || "LOW").toUpperCase();

  const getIcon = () => {
    switch (levelUpper) {
      case "CRITICAL":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case "HIGH":
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case "MEDIUM":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getVariant = () => {
    switch (levelUpper) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MEDIUM":
        return "medium";
      default:
        return "low";
    }
  };

  return (
    <Badge variant={getVariant()} size="md" className="gap-1.5">
      {getIcon()}
      <span>{levelUpper} Priority</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] ml-0.5 opacity-80">({score})</span>
      )}
    </Badge>
  );
};
