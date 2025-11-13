import { useState } from "react";
  import { Eye, EyeOff } from "lucide-react";


interface RoleFormProps {
  initialData?: {
    email: string;
    name: string;
    region: string;
    city: string[];
    role: string;
    gender: string;
    password: string;
    confirmPassword: string;
  };
  onSubmit: (data: RoleFormProps["initialData"]) => void;
}

export default function RoleForm({ initialData, onSubmit }: RoleFormProps) {
//   const [formData, setFormData] = useState(
//     initialData || {
//       email: "",
//       name: "",
//       region: "",
//       city: [],
//       role: "",
//       gender: "",
//       password: "",
//       confirmPassword: "",
//     }
//   );
const [formData, setFormData] = useState({
  email: initialData?.email || "",
  name: initialData?.name || "",
  region: initialData?.region || "",
  city: Array.isArray(initialData?.city) ? initialData.city : [], // safe
  role: initialData?.role || "",
  gender: initialData?.gender || "",
  password: initialData?.password || "",
  confirmPassword: initialData?.confirmPassword || "",
});

  // region-wise cities
  const cityOptions: Record<string, string[]> = {
    UK: ["London", "Manchester", "Birmingham", "Liverpool"],
    Malta: ["Valletta", "Sliema", "Mdina", "St. Julian’s"],
    Pakistan: ["Karachi", "Lahore", "Islamabad", "Faisalabad"],
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    setErrorMessage("");
    onSubmit(formData);
  };

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");





  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-white/[0.02] p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {initialData ? "Edit Role" : "Create New Role"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="">Select Role</option>
            <option value="Sub-Admin">Sub-Admin</option>
            <option value="Console">Console</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            name="region"
            required
            value={formData.region}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="">Select Region</option>
            <option value="UK">UK</option>
            <option value="Malta">Malta</option>
            <option value="Pakistan">Pakistan</option>
          </select>
        </div>

    
        {/* City */}
        <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            City
        </label>

        <div
            className={`w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer flex justify-between items-center ${
            !formData.region ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={() => {
            if (formData.region) setShowCityDropdown((prev) => !prev);
            }}
        >
            <span className="text-gray-700">
            {formData.city.length > 0
                ? formData.city.join(", ")
                : !formData.region
                ? "Select Region First"
                : "Select City"}
            </span>
            <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showCityDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

  {showCityDropdown && formData.region && (
    <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
      {cityOptions[formData.region]?.map((city) => (
        <div
          key={city}
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              city: prev.city.includes(city)
                ? prev.city.filter((c) => c !== city)
                : [...prev.city, city],
            }))
          }
          className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <span>{city}</span>
          {formData.city.includes(city) && (
            <span className="text-green-500 font-bold">✅</span>
          )}
        </div>
      ))}
    </div>
    )}

        <p className="text-xs text-gray-500 mt-1">
            Click to select multiple cities.
        </p>
    </div>
        {/* Password */}
        
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
            </label>
            <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-[10%] text-gray-500 hover:text-gray-700"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>

        {/* Confirm Password */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Confirm Password
  </label>
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    required
    value={formData.confirmPassword}
    onChange={(e) => {
      handleChange(e);
      setErrorMessage(""); // clear error while typing
    }}
    className={`w-full border rounded-md px-3 py-2 pr-10 focus:ring-2 outline-none ${
      errorMessage
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-blue-500"
    }`}
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword((prev) => !prev)}
    className="absolute right-3 top-1/2 transform -translate-y-[10%] text-gray-500 hover:text-gray-700"
  >
    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>

  {/* Error Message */}
  {errorMessage && (
    <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
  )}
</div>

      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {initialData ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}

