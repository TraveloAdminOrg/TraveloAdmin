import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

interface UserRole {
  id: number;
  name: string;
  role: string;
  region: string;
  city: Array<string>;
    email: string;
  password: string;
}

const initialData: UserRole[] = [
  { id: 1, name: "John Doe", role: "Sub-Admin", region: "UK", city: ["London"] , email: "john@example.com", password: "password123" },
  { id: 2, name: "Sarah Khan", role: "Console", region: "Malta", city: ["Sliema"], email: "sarah@example.com", password: "password123" },
  { id: 3, name: "Ali Raza", role: "Console", region: "UK", city: ["Manchester"], email: "ali@example.com", password: "password123" },
  { id: 4, name: "Fatima Noor", role: "Sub-Admin", region: "Pakistan", city: ["Karachi"], email: "fatima@example.com", password: "password123" },
];
// const initialData: UserRole[] = [
//   { id: 1, name: "John Doe", role: "Sub-Admin", region: "UK", city: "London" },
//   { id: 2, name: "Sarah Khan", role: "Console", region: "Malta", city: "Sliema" },
//   { id: 3, name: "Ali Raza", role: "Console", region: "UK", city: "Manchester" },
//   { id: 4, name: "Fatima Noor", role: "Sub-Admin", region: "PAK", city: "Karachi" },
// ];

export default function RoleTable() {
  const [data, setData] = useState<UserRole[]>(initialData);
//   const [editingItem, setEditingItem] = useState<UserRole | null>(null);
//   const [editedRole, setEditedRole] = useState<string>("");

  const handleDelete = (id: number) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleEdit = (id: number) => {
  const role = data.find((d) => d.id === id);
  if (role) {
    navigate(`/edit-role-page/${role.id}`, { state: { role } });
  }
};
//   const handleFormSubmit = (formData: any) => {
//   if (editingItem) {
//     // Update logic
//     const updated = data.map((d) =>
//       d.id === editingItem.id ? { ...d, ...formData } : d
//     );
//     setData(updated);
//     setEditingItem(null);
//   } else {
//     // Create logic
//     setData([...data, { id: Date.now(), ...formData }]);
//   }
// };
//   const handleSave = () => {
//     if (!editingItem) return;
//     const updated = data.map((item) =>
//       item.id === editingItem.id ? { ...item, role: editedRole } : item
//     );
//     setData(updated);
//     setEditingItem(null);
//   };
    const navigate = useNavigate();


  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full border-collapse">
            {/* Table Header */}
            <thead className="bg-gray-50 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/[0.05]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Region</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">City</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email/Password</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                  onClick={() => {
                    navigate(`/AdminProfile/${item.id}`,{state: {driver: item}});
                }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.region}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.city.join(", ")}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.email},{item.password}</td>
                  <td className="px-6 py-4 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 👈 Prevent row click
                        handleEdit(item.id); // 👈 Call edit function
                        }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                        }}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400 text-sm">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Editing */}
      {/* {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setEditingItem(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Edit Role - {editingItem.name}
            </h2>

            <ReactQuill
              value={editedRole}
              onChange={setEditedRole}
              theme="snow"
              className="bg-white"
            />

            <div className="flex justify-end mt-4 gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}