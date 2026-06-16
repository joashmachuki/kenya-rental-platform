import { Shield, ShieldCheck, ShieldAlert, Ban } from "lucide-react";

interface SecurityBadgeProps {
  verificationStatus: string;
  trustScore: number;
  reportCount: number;
  isBanned: boolean;
  size?: "sm" | "md" | "lg";
}

export function SecurityBadge({
  verificationStatus,
  trustScore,
  reportCount,
  isBanned,
  size = "md",
}: SecurityBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  if (isBanned) {
    return (
      <span className={`inline-flex items-center rounded-full bg-red-100 text-red-700 font-medium ${sizeClasses[size]}`}>
        <Ban className="w-3.5 h-3.5" />
        Banned
      </span>
    );
  }

  if (verificationStatus === "verified") {
    return (
      <span className={`inline-flex items-center rounded-full bg-green-100 text-green-700 font-medium ${sizeClasses[size]}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified
        {trustScore > 0 && <span className="text-green-600">({trustScore})</span>}
      </span>
    );
  }

  if (reportCount >= 2) {
    return (
      <span className={`inline-flex items-center rounded-full bg-orange-100 text-orange-700 font-medium ${sizeClasses[size]}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        Flagged
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-600 font-medium ${sizeClasses[size]}`}>
      <Shield className="w-3.5 h-3.5" />
      Unverified
    </span>
  );
}
