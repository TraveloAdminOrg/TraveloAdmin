import { useState } from "react";
  import { Eye, EyeOff } from "lucide-react";


interface RoleFormProps {
  initialData?: {
    email: string;
    name: string;
    region: string;
    role: string;
    gender: string;
    password: string;
    confirmPassword: string;
  };
  onSubmit: (data: RoleFormProps["initialData"]) => void;
}

export default function RoleForm({ initialData, onSubmit }: RoleFormProps) {
const [formData, setFormData] = useState({
  email: initialData?.email || "",
  name: initialData?.name || "",
  region: initialData?.region || "",
  role: initialData?.role || "",
  gender: initialData?.gender || "",
  password: initialData?.password || "",
  confirmPassword: initialData?.confirmPassword || "",
});

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

