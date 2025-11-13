import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
// import DriverMetaCard from "../../components/DriverProfile/DriverMetaCard";
import AdminInfoCard from "../../components/RoleManagement/AdminInfoCard";
import ProfileMetaCard from "../../components/ProfileMetaCard/ProfileMetaCard";
// import DriverInfoCard from "../../components/DriverProfile/DriverInfoCard";
// import DriverDocumentCard from "../../components/DriverProfile/DriverDocumentCard";

export default function AdminProfiles() {

  const admin = {
  image: "../images/user/user-18.jpg",
  name: "Lindsey Curtis",
  email: "lindsey@example.com",
  role: "Team Manager",
  region: "London, United Kingdom",
  phone: "+1 234 567 890",
  city: "Los Angeles",
  address: "123 Main St",
  gender: "Male",
  dob: "1990-05-10",
  rideType: "Four Wheeler",
  idCard: "ABC12345",
};


  return (
    <>
      <PageMeta
       title="Travelo Taxi App Dashboard | Manage Rides, Drivers & Earnings Easily"
        description="Travelo Taxi App Admin Dashboard built using React.js and Tailwind CSS, offering powerful tools for ride, driver, and revenue management."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Sub-Admin Profile
        </h3>
        <div className="space-y-6">
          <ProfileMetaCard
            type="admin"
            data={{
                id: "1",
                image: "../images/user/user-18.jpg",
                name: "Sarah Malik",
                role: "Sub Admin",
                region: "UK",
            }}
        />
          <AdminInfoCard adminData={admin} />
          
        </div>
      </div>
    </>
  );
}
