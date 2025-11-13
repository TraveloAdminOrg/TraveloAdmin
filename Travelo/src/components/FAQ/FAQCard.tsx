import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FAQCardProps {
  faq: FAQ;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updated: FAQ) => void;
}

export default function FAQCard({ faq, onDelete, onUpdate }: FAQCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  const handleSave = () => {
    onUpdate(faq.id, { ...faq, question, answer });
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-white/[0.03] p-4 shadow-sm">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Edit Question"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Edit Answer"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
            {faq.question}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {faq.answer}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(faq.id)}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
