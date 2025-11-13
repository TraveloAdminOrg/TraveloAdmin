import { useState } from "react";
import { Plus } from "lucide-react";
import FareCard from "../../components/FareManagement/FareCard";
import FareModal from "../../components/FareManagement/FareModal";

interface Fare {
  id: number;
  title: string;
  amount: number;
}

interface FareSectionProps {
  country: string;
  currency: string;
  initialFares: Fare[];
  fareOptions: { id: number; title: string }[];
}

export default function FareSection({
  country,
  currency,
  initialFares,
  fareOptions,
}: FareSectionProps) {
  const [fares, setFares] = useState<Fare[]>(initialFares);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const remainingOptions = fareOptions.map((opt) => ({
    ...opt,
    disabled: fares.some((f) => f.title === opt.title),
  }));

  const handleAdd = (title: string, amount: number) => {
    const option = fareOptions.find((opt) => opt.title === title);
    if (option && !fares.some((f) => f.id === option.id)) {
      setFares([...fares, { id: option.id, title, amount }]);
    }
  };

  const handleDelete = (id: number) => {
    setFares(fares.filter((fare) => fare.id !== id));
  };

  const handleUpdate = (id: number, newAmount: number) => {
    setFares(
      fares.map((fare) =>
        fare.id === id ? { ...fare, amount: newAmount } : fare
      )
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm relative space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {country} Fare's ({currency})
        </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add Fare
        </button>
      </div>

      {/* Fare Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {fares.map((fare) => (
          <FareCard
            key={fare.id}
            fare={fare}
            currency={currency}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      <FareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        options={remainingOptions}
      />
    </div>
  );
}
