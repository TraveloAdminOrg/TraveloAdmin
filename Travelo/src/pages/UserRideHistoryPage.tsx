import { useParams } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import EmptyState from "../components/common/EmptyState";
import UserRideHistorySection from "../components/UserProfile/UserRideHistorySection";

export default function UserRideHistoryPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <PageMeta
        title="User Ride History | Travelo Admin"
        description="Browse this user's complete ride history."
      />
      <PageBreadcrumb pageTitle="Ride History" />
      <div className="space-y-6">
        <ComponentCard title="Ride Details">
          {id ? (
            <UserRideHistorySection userId={id} />
          ) : (
            <EmptyState
              title="No user selected"
              description="A user id is required to load ride history."
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}
