

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import Button from "../ui/button/Button";

export default function UserMetaCard({}) {
    const navigate = useNavigate();
  const { id } = useParams();
    const handleHistoryClick = () => {
        navigate(`/UserProfile/${user.id}/history`);
    }
  // In a real app, you’d fetch driver data from your backend or state management
  // For now, let's mock the data (you can replace this later with API)
  const user = {
    id: id,
    image: "../images/user/user-17.jpg",
    name: "Joy Rogan",
    role: "Team Manager",
    location: "Arizona, United States",
    email: "randomuser@pimjo.com",
    phone: "+09 363 398 46",
    rideType: "Car",
  };
  

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Profile Image */}
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src={user.image} alt={user.name} />
          </div>

          {/* Info */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user.name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.role}
              </p> */}
              {/* <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div> */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.location}
              </p>
              {/* <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.rideType} User
              </p> */}
            </div>
            
          </div>

          {/* History Button */}
          <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
            {/* <Button
              size="sm"
              onClick={() => console.log("Show history for driver:", driver.id)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              History
            </Button> */}
            <button
                // onClick={() => console.log("Show history for driver:", driver.id)}
                onClick={handleHistoryClick}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                Ride History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
