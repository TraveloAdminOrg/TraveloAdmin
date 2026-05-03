import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ChevronRight, Star, Wallet } from "lucide-react";
import type { User } from "../../types/user";
import { regionLabel } from "../../lib/regions";
import UserStatusPills from "./UserStatusPills";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

interface Props {
  user: User;
}

export default function UserCard({ user }: Props) {
  const displayName = user.fullName || user.username;
  const cityCountry = [
    user.city,
    user.country ? regionLabel(user.country) : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-4 p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <img
            src={user.image || FALLBACK_AVATAR}
            alt={displayName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold capitalize text-gray-800 dark:text-white/90">
            {displayName}
          </h3>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 px-4 pb-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Mail className="size-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{user.phone}</span>
        </div>
        {cityCountry && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{cityCountry}</span>
          </div>
        )}
      </div>

      {/* Optional rider stats — only render if backend provides them */}
      {(user.totalRides !== undefined ||
        user.walletBalance !== undefined ||
        user.averageRating !== undefined) && (
        <div className="flex flex-wrap gap-3 px-4 pb-3 text-xs">
          {user.totalRides !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.totalRides}
              </span>{" "}
              rides
            </div>
          )}
          {user.averageRating !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Star className="size-3.5 text-warning-500" />
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.averageRating.toFixed(1)}
              </span>
            </div>
          )}
          {user.walletBalance !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Wallet className="size-3.5 text-gray-400" />
              <span className="font-semibold text-gray-800 dark:text-white">
                {user.walletBalance}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-3">
        <UserStatusPills user={user} size="sm" />
      </div>

      <Link
        to={`/UserProfile/${user._id}`}
        className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-gray-800 dark:text-brand-400 dark:hover:bg-brand-500/10"
      >
        View profile
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
