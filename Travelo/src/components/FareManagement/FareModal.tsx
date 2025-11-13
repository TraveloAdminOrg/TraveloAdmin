import { useState } from "react";
import { X } from "lucide-react";

interface FareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, amount: number) => void;
  options: { id: number; title: string; disabled: boolean }[];
}

export default function FareModal({ isOpen, onClose, onAdd, options }: FareModalProps) {
  const [selected, setSelected] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selected && amount > 0) {
      onAdd(selected, amount);
      setSelected("");
      setAmount(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm relative shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Add Fare
        </h2>

        {/* Fare Type */}
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
          Fare Type
        </label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 mb-4 bg-transparent text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Fare Type</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.title} disabled={opt.disabled}>
              {opt.title} {opt.disabled ? "(Added)" : ""}
            </option>
          ))}
        </select>

        {/* Fare Amount */}
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
          Amount ($)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 mb-5 bg-transparent text-sm focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
        />

        {/* Add Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Fare
        </button>
      </div>
    </div>
  );
}
