import {
  CheckCircle2,
  XCircle,
  Ban,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";
import type { User } from "../../types/user";

interface Props {
  user: User;
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

function buildPills(user: User): PillSpec[] {
  const pills: PillSpec[] = [];

  pills.push({
    label: user.isActive ? "Active" : "Inactive",
    tone: user.isActive ? "success" : "neutral",
    icon: user.isActive ? CheckCircle2 : XCircle,
  });

  if (user.isBlocked) {
    pills.push({ label: "Blocked", tone: "error", icon: Ban });
  }

  pills.push({
    label: user.isPhoneVerified ? "Phone ✓" : "Phone unverified",
    tone: user.isPhoneVerified ? "success" : "warning",
    icon: Phone,
  });

  pills.push({
    label: user.isEmailVerified ? "Email ✓" : "Email unverified",
    tone: user.isEmailVerified ? "success" : "warning",
    icon: Mail,
  });

  pills.push({
    label: user.isProfileCompleted ? "Profile complete" : "Profile incomplete",
    tone: user.isProfileCompleted ? "success" : "warning",
    icon: UserCheck,
  });

  return pills;
}

export default function UserStatusPills({ user, size = "sm" }: Props) {
  const pills = buildPills(user);
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
