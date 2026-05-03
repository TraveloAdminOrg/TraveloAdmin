import {
  CheckCircle2,
  XCircle,
  Ban,
  Mail,
  Phone,
  FileCheck2,
  UserCheck,
} from "lucide-react";
import type { Driver } from "../../types/driver";

interface Props {
  driver: Driver;
  size?: "sm" | "md";
}

type Tone = "success" | "warning" | "error" | "neutral";

const toneClasses: Record<Tone, string> = {
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  warning:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  error:
    "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  neutral:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

interface PillSpec {
  label: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
}

function buildPills(driver: Driver): PillSpec[] {
  const pills: PillSpec[] = [];

  pills.push({
    label: driver.isActive ? "Active" : "Inactive",
    tone: driver.isActive ? "success" : "neutral",
    icon: driver.isActive ? CheckCircle2 : XCircle,
  });

  pills.push({
    label: driver.isApproved ? "Approved" : "Pending approval",
    tone: driver.isApproved ? "success" : "warning",
    icon: driver.isApproved ? UserCheck : XCircle,
  });

  if (driver.isBlocked) {
    pills.push({ label: "Blocked", tone: "error", icon: Ban });
  }

  pills.push({
    label: driver.isPhoneVerified ? "Phone ✓" : "Phone unverified",
    tone: driver.isPhoneVerified ? "success" : "warning",
    icon: Phone,
  });

  pills.push({
    label: driver.isEmailVerified ? "Email ✓" : "Email unverified",
    tone: driver.isEmailVerified ? "success" : "warning",
    icon: Mail,
  });

  pills.push({
    label: driver.isProfileCompleted ? "Profile complete" : "Profile incomplete",
    tone: driver.isProfileCompleted ? "success" : "warning",
    icon: UserCheck,
  });

  pills.push({
    label: driver.isDocumentUploaded ? "Docs uploaded" : "Docs missing",
    tone: driver.isDocumentUploaded ? "success" : "warning",
    icon: FileCheck2,
  });

  return pills;
}

export default function DriverStatusPills({ driver, size = "sm" }: Props) {
  const pills = buildPills(driver);
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? "size-3" : "size-3.5";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map((p) => {
        const Icon = p.icon;
        return (
          <span
            key={p.label}
            className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${toneClasses[p.tone]}`}
          >
            <Icon className={iconSize} />
            {p.label}
          </span>
        );
      })}
    </div>
  );
}
