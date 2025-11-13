interface AdminInfo {
  name: string;
  email: string;
  role: string;
  gender: string;
  region: string;
  city: string;

}

interface AdminInfoCardProps {
  adminData: AdminInfo;
}

export default function AdminInfoCard({ adminData }: AdminInfoCardProps) {


  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Admin Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-56">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.gender}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                City
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.city}
              </p>
            </div>
            
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.role}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Region
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {adminData.region}
              </p>
            </div>
            
          </div>
        </div>
      </div>

      
    </div>
  );
}
