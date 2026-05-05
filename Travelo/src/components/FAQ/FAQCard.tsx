import { Pencil, Trash2 } from "lucide-react";
import type { Faq } from "../../types/faq";

interface FAQCardProps {
  faq: Faq;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

export default function FAQCard({ faq, onEdit, onDelete }: FAQCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              #{faq.order}
            </span>
            <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
              {faq.question}
            </h3>
          </div>
          <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
            {faq.answer}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(faq)}
            aria-label="Edit FAQ"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(faq)}
            aria-label="Delete FAQ"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-error-500 transition hover:bg-error-50 dark:hover:bg-error-500/10"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
