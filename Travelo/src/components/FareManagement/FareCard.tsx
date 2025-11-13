import { useState } from "react";
import { Pencil, Check, X, Trash2 } from "lucide-react";

interface FareCardProps {
  fare: {
    id: number;
    title: string;
    amount: number;
  };
  currency: string;
  onUpdate: (id: number, newAmount: number) => void;
  onDelete: (id: number) => void;
}

export default function FareCard({ fare, currency, onUpdate, onDelete }: FareCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState<number>(fare.amount);

  const handleSave = () => {
    onUpdate(fare.id, amount);
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-white/[0.05] rounded-lg bg-white dark:bg-white/[0.03] p-3 shadow-sm flex flex-col justify-between w-full max-w-xs">
      <div>
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-2">
          {fare.title}
        </h3>

        {isEditing ? (
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-center w-full outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
        ) : (
          <p className="text-lg font-bold text-green-600 dark:text-blue-400 mb-2">
            {currency}
            {amount}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-1">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 transition"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700 transition"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(fare.id)}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
