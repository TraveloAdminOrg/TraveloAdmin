import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import RideHistory from "../components/DriverProfile/RideHistory";
import { useParams } from "react-router-dom";

export default function UserRideHistoryPage() {
  const { id } = useParams<{ id: string }>();
  console.log("Displaying ride history for driver ID:", id);
  return (
    <>
      <PageMeta
       title="Travelo Taxi App Dashboard | Manage Rides, Drivers & Earnings Easily"
        description="Travelo Taxi App Admin Dashboard built using React.js and Tailwind CSS, offering powerful tools for ride, driver, and revenue management."
      />
      <PageBreadcrumb pageTitle="Ride History" />
      <div className="space-y-6">
        <ComponentCard title="Ride Details">
          <RideHistory />
        </ComponentCard>
      </div>
    </>
  );
}
