import { useNavigate } from "react-router-dom";

interface ProfileMetaCardProps {
  data: {
    id: string;
    image: string;
    name: string;
    role: string;
    region: string;
    rideType?: string; // only for drivers
  };
  type: "admin" | "driver";
}

export default function ProfileMetaCard({ data, type }: ProfileMetaCardProps) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (type === "driver") {
      navigate(`/TailAdmin/DriverProfile/${data.id}/history`);
    } else {
      navigate(`/TailAdmin/AdminProfile/${data.id}`);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Profile Image */}
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src={data.image} alt={data.name} />
          </div>

          {/* Info */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {data.name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data.role}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data.region}
              </p>
              {/* Only show Ride Type if driver */}
              {data.rideType && (
                <>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.rideType} Driver
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
            <button
              onClick={handleButtonClick}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {type === "driver" ? "Ride History" : "View Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
