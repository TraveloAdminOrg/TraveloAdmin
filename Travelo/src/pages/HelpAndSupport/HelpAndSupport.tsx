import { useState } from "react";
import FAQCard from "../../components/FAQ/FAQCard";
import { Plus } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const initialFAQs: FAQ[] = [
  {
    id: 1,
    question: "How can I reset my password?",
    answer: "Go to your account settings and click on 'Reset Password'.",
  },
  {
    id: 2,
    question: "How do I contact customer support?",
    answer: "You can reach us via the Contact page or email support@example.com.",
  },
  {
    id: 3,
    question: "Can I update my order after placing it?",
    answer: "Unfortunately, you can’t modify orders after they’ve been placed.",
  },
];

export default function HelpAndSupport() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);

  const handleDelete = (id: number) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  const handleUpdate = (id: number, updated: FAQ) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? updated : faq)));
  };

  const handleAdd = () => {
    const newFAQ: FAQ = {
        id: Date.now(),
        question: "New Question",
        answer: "New Answer",
    };
    setFaqs([...faqs, newFAQ]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 p-6 shadow-sm">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Help & Support (FAQ Management)
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-400 text-white rounded-md hover:bg-red-500 transition"
          >
            <Plus size={18} /> Add FAQ
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq) => (
          <FAQCard
            key={faq.id}
            faq={faq}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}

        {faqs.length === 0 && (
          <div className="col-span-full text-center text-gray-400 text-sm">
            No FAQs available.
          </div>
        )}
      </div>
     </div>
    </div>
  );
}
