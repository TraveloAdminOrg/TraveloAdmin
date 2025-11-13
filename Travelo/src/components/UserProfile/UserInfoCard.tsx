

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  city: string;
  
  address: string;
  gender: string;
  // dob: string;
  rideType: string;
  idCard: string;
}

interface UserInfoCardProps {
  userData: UserInfo;
}

export default function UserInfoCard({ userData }: UserInfoCardProps) {
//   const { isOpen, openModal, closeModal } = useModal();

//   const handleSave = () => {
//     console.log("Saving updated driver info...");
//     closeModal();
//   };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            User Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-56">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.gender}
              </p>
            </div>

            {/* <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.dob}
              </p>
            </div> */}

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                City
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.city}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.address}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.phone}
              </p>
            </div>
            {/* <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                ID Card Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.idCard}
              </p>
            </div> */}
            {/* <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Vehicle Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.rideType}
              </p>
            </div> */}
          </div>
        </div>

        {/* <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Edit
        </button> */}
      </div>

    </div>
  );
}
