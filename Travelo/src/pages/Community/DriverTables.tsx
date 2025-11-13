import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DriverTable from "../../components/tables/BasicTables/DriverTable";

export default function DriverTables() {
  return (
    <>
      <PageMeta
       title="Travelo Taxi App Dashboard | Manage Rides, Drivers & Earnings Easily"
        description="Travelo Taxi App Admin Dashboard built using React.js and Tailwind CSS, offering powerful tools for ride, driver, and revenue management."
      />
      <PageBreadcrumb pageTitle="Driver Table" />
      <div className="space-y-6">
        <ComponentCard title="Driver Details">
          <DriverTable />
        </ComponentCard>
      </div>
    </>
  );
}
