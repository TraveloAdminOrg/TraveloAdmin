import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/button/Button";
import DriverStatusPills from "../../components/Drivers/DriverStatusPills";
import DriverDocumentsSection from "../../components/Drivers/DriverDocumentsSection";
import { useDriverQuery } from "../../hooks/queries/useDrivers";
import { regionLabel } from "../../lib/regions";
import { formatDate, formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";

const FALLBACK_AVATAR = "/images/user/owner.jpg";

export default function DriverProfilePage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: driver, isLoading, error } = useDriverQuery(id);

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading driver…" />;
  }

  if (error || !driver) {
    return (
      <>
        <PageBreadcrumb pageTitle="Driver Profile" />
        <EmptyState
          title="Couldn't load driver"
          description={error ? getErrorMessage(error) : "Driver not found."}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(-1)}
              startIcon={<ArrowLeft className="size-4" />}
            >
              Go back
            </Button>
          }
        />
      </>
    );
  }

  const displayName = driver.fullName || driver.username;

  return (
    <>
      <PageMeta
        title={`${displayName} | Driver Profile`}
        description="Driver account details, status, and activity."
      />
      <PageBreadcrumb pageTitle="Driver Profile" />

      <div className="space-y-6">
        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                <img
                  src={driver.image || FALLBACK_AVATAR}
                  alt={displayName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-semibold capitalize text-gray-800 dark:text-white/90">
                  {displayName}
                </h2>
                <div className="mt-1 flex flex-col items-center gap-1 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:gap-3">
                  <span>@{driver.username}</span>
                  <span className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 sm:block" />
                  <span>{regionLabel(driver.country)}</span>
                  {driver.rideType && (
                    <>
                      <span className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 sm:block" />
                      <span>{driver.rideType} driver</span>
                    </>
                  )}
                </div>
                <div className="mt-3">
                  <DriverStatusPills driver={driver} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              <Link
                to={`/DriverProfile/${driver._id}/history`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                <History className="size-4" />
                Ride history
              </Link>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <Section title="Personal information">
          <Field label="Full name" value={driver.fullName} />
          <Field label="Username" value={driver.username} />
          <Field label="Email" value={driver.email} />
          <Field label="Phone" value={driver.phone} />
          <Field label="Gender" value={driver.gender} />
          <Field
            label="Date of birth"
            value={driver.dateOfBirth ? formatDate(driver.dateOfBirth) : undefined}
          />
          <Field label="ID card number" value={driver.idCardNumber} />
        </Section>

        {/* Location & vehicle */}
        <Section title="Location & vehicle">
          <Field label="Street" value={driver.street} />
          <Field label="City" value={driver.city} />
          <Field label="Country" value={regionLabel(driver.country)} />
          <Field label="Ride type" value={driver.rideType} />
        </Section>

        {/* Account status */}
        <Section title="Account status">
          <BoolField label="Active" value={driver.isActive} />
          <BoolField label="Approved" value={driver.isApproved} />
          <BoolField label="Blocked" value={driver.isBlocked} negative />
          <BoolField label="Deleted" value={driver.isDeleted} negative />
          <BoolField label="Phone verified" value={driver.isPhoneVerified} />
          <BoolField label="Email verified" value={driver.isEmailVerified} />
          <BoolField
            label="Profile completed"
            value={driver.isProfileCompleted}
          />
          <BoolField
            label="Documents uploaded"
            value={driver.isDocumentUploaded}
          />
        </Section>

        {/* Activity timestamps */}
        <Section title="Activity">
          <Field
            label="Last active"
            value={driver.lastActive ? formatDateTime(driver.lastActive) : undefined}
          />
          <Field
            label="Created"
            value={driver.createdAt ? formatDateTime(driver.createdAt) : undefined}
          />
          <Field
            label="Updated"
            value={driver.updatedAt ? formatDateTime(driver.updatedAt) : undefined}
          />
        </Section>

        {/* Documents */}
        <DriverDocumentsSection driver={driver} />

        {/* Device & social */}
        <Section title="Device & social">
          <Field label="Account type" value={driver.type} />
          <Field label="Device type" value={driver.userDeviceType} />
        </Section>

        {/* Identifiers */}
        <Section title="Identifiers">
          <Field label="Driver ID" value={driver._id} mono />
          <Field label="Country code" value={driver.country} mono />
        </Section>
      </div>
    </>
  );
}

// ---------- helpers ----------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm ${mono ? "font-mono" : "font-medium"} break-words text-gray-800 dark:text-white/90`}
      >
        {value ? value : <span className="text-gray-400">—</span>}
      </p>
    </div>
  );
}

function BoolField({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: boolean;
  negative?: boolean;
}) {
  // For most flags, true is good. For things like `isBlocked`, true is bad — pass negative.
  const tone = value
    ? negative
      ? "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
      : "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
    : negative
      ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
      >
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

