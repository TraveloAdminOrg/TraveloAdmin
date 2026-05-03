import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ChevronRight } from "lucide-react";
import type { Driver } from "../../types/driver";
import { regionLabel } from "../../lib/regions";
import DriverStatusPills from "./DriverStatusPills";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

interface Props {
  driver: Driver;
}

export default function DriverCard({ driver }: Props) {
  const displayName = driver.fullName || driver.username;
  const cityCountry = [
    driver.city,
    driver.country ? regionLabel(driver.country) : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-4 p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <img
            src={driver.image || FALLBACK_AVATAR}
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
          {driver.rideType && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {driver.rideType} driver
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 px-4 pb-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Mail className="size-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{driver.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{driver.phone}</span>
        </div>
        {cityCountry && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{cityCountry}</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <DriverStatusPills driver={driver} size="sm" />
      </div>

      <Link
        to={`/DriverProfile/${driver._id}`}
        className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-gray-800 dark:text-brand-400 dark:hover:bg-brand-500/10"
      >
        View profile
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
