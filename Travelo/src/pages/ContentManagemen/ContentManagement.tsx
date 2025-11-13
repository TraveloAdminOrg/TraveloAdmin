import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ContentManagementTable from "../../components/ContentManagement/ContentManagementTable";

export default function Transaction() {
  return (
    <>
      <PageMeta
       title="Travelo Taxi App Dashboard | Manage Rides, Drivers & Earnings Easily"
        description="Travelo Taxi App Admin Dashboard built using React.js and Tailwind CSS, offering powerful tools for ride, driver, and revenue management."
      />
      <PageBreadcrumb pageTitle="Content Management" />
      <div className="space-y-6">
        <ComponentCard title="Transaction Details">
          <ContentManagementTable />
        </ComponentCard>
      </div>
    </>
  );
}
