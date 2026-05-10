import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  History,
  Mail,
  MapPin,
  Phone,
  ShieldOff,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useUserQuery } from "../../hooks/queries/useUsers";
import { regionLabel, type RegionCode } from "../../lib/regions";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading, error } = useUserQuery(id ?? "");

  const name = customer?.fullName || customer?.username || "Customer";

  return (
    <>
      <PageMeta
        title={`${name} | Travelo Admin`}
        description="Customer profile and account details."
      />
      <PageBreadcrumb pageTitle="Customer Profile" />

      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          startIcon={<ChevronLeft className="size-4" />}
        >
          Back
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading customer…" />
      ) : error ? (
        <EmptyState
          title="Failed to load customer"
          description={getErrorMessage(error)}
        />
      ) : !customer ? (
        <EmptyState title="Customer not found" />
      ) : (
        <div className="space-y-5">
          {/* Header card */}
          <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between lg:p-6">
            <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                {customer.image ? (
                  <img
                    src={customer.image}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        FALLBACK_AVATAR;
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <UserIcon className="size-10" />
                  </div>
                )}
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {name}
                </h2>
                {customer.username && customer.fullName !== customer.username && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    @{customer.username}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <StatusBadge user={customer} />
                  {customer.country && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <MapPin className="size-3" />
                      {regionLabel(customer.country as RegionCode)}
                      {customer.city ? ` · ${customer.city}` : ""}
                    </span>
                  )}
                  {customer.isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                      <CheckCircle2 className="size-3" />
                      Phone verified
                    </span>
                  )}
                  {customer.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                      <CheckCircle2 className="size-3" />
                      Email verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/UserProfile/${customer._id}/history`)}
                startIcon={<History className="size-3.5" />}
              >
                Ride history
              </Button>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Section title="Contact">
              <Row label="Email" icon={<Mail className="size-3.5" />}>
                {customer.email || "—"}
              </Row>
              <Row label="Phone" icon={<Phone className="size-3.5" />}>
                <span className="font-mono">{customer.phone || "—"}</span>
              </Row>
            </Section>

            <Section title="Address">
              <Row label="Country">
                {customer.country
                  ? `${customer.country} · ${regionLabel(customer.country as RegionCode)}`
                  : "—"}
              </Row>
              <Row label="City">{customer.city || "—"}</Row>
              <Row label="Street">{customer.street || "—"}</Row>
            </Section>

            <Section title="Account">
              <Row label="Customer ID">
                <span className="font-mono text-xs text-gray-500">
                  {customer._id}
                </span>
              </Row>
              <Row label="Gender">
                {customer.gender ? capitalise(customer.gender) : "—"}
              </Row>
              <Row label="Profile complete">
                {customer.isProfileCompleted ? "Yes" : "No"}
              </Row>
              <Row label="Last active" icon={<Clock className="size-3.5" />}>
                {customer.lastActive
                  ? formatDateTime(customer.lastActive)
                  : "—"}
              </Row>
              <Row label="Joined">
                {customer.createdAt ? formatDateTime(customer.createdAt) : "—"}
              </Row>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 break-all text-sm text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </div>
  );
}

function StatusBadge({
  user,
}: {
  user: { isActive?: boolean; isBlocked?: boolean };
}) {
  if (user.isBlocked) {
    return (
      <Badge size="sm" color="error" startIcon={<ShieldOff className="size-3" />}>
        Blocked
      </Badge>
    );
  }
  if (user.isActive) {
    return (
      <Badge
        size="sm"
        color="success"
        startIcon={<CheckCircle2 className="size-3" />}
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="light" startIcon={<XCircle className="size-3" />}>
      Inactive
    </Badge>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
