import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react"; // icons
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


interface Content {
  id: number;
  name: string;
  description: string;
}

// Example content data
const initialData = [
  {
    id: 1,
    name: "Privacy Policy Page",
    description: "Main homepage hero section banner. Main homepage hero section banner.",
  },
  {
    id: 2,
    name: "Terms and Conditions Page",
    description: "Brief intro about the company mission. Main homepage hero section banner.",
  },
  {
    id: 3,
    name: "About Us Section",
    description: "Brief intro about the company mission. Main homepage hero section banner.",
  },
  {
    id: 4,
    name: "Contact Page Form",
    description: "Form for user inquiries and feedback. Main homepage hero section banner.",
  },
  {
    id: 5,
    name: "Help and Support Section",
    description: "Form for user inquiries and feedback. Main homepage hero section banner.",
  },
];

export default function ContentManagementTable() {
  const [data, setData] = useState<Content[]>(initialData);
  const [editingItem, setEditingItem] = useState<Content | null>(null);
  const [editedDescription, setEditedDescription] = useState<string>("");

  const handleDelete = (id: number) => {
    const updated = data.filter((item) => item.id !== id);
    setData(updated);
  };

  const handleEdit = (id: number) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setEditingItem(item);
      setEditedDescription(item.description);
    }
  };
    const handleSave = () => {
        if (!editingItem) return;
        const updatedData = data.map((item) =>
            item.id === editingItem.id ? { ...item, description: editedDescription } : item
        );
        setData(updatedData);
        setEditingItem(null);
    };


  return (
    <div className="relative">
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-50 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/[0.05]">
            <tr>
              <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                Content Name
              </th>
              <th className="w-1/2 px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                Description
              </th>
              <th className="w-1/4 px-6 py-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">
                  {item.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </td>
                <td className="px-6 py-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="text-blue-500 hover:text-blue-700 transition"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 text-center text-gray-400 text-sm"
                >
                  No content available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal for Editing */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setEditingItem(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Edit Description - {editingItem.name}
            </h2>

            <ReactQuill
              value={editedDescription}
              onChange={setEditedDescription}
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
        )}
      </div>
  );
}
