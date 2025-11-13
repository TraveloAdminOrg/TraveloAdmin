import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";

export default function UserProfiles() {

  const user = {
  image: "../images/user/user-17.jpg",
  name: "Joy Rogan",
  email: "joy.rogan@example.com",
  role: "Team Manager",
  location: "Arizona, United States",
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
      <PageBreadcrumb pageTitle="User Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          User Information Card
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard userData={user} />
        </div>
      </div>
    </>
  );
}
