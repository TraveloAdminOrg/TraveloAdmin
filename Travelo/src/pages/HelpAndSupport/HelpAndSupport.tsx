import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import FAQCard from "../../components/FAQ/FAQCard";
import FAQFormModal from "../../components/FAQ/FAQFormModal";
import {
  useDeleteFaq,
  useFaqsQuery,
} from "../../hooks/queries/useFaqs";
import { getErrorMessage, isNotFoundError } from "../../lib/error";
import type { Faq } from "../../types/faq";

export default function HelpAndSupport() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Faq | null>(null);

  const { data: faqs = [], isLoading, isFetching, error } = useFaqsQuery();
  const deleteMutation = useDeleteFaq();

  // Sort by `order` (asc) then by question for stable display.
  const sorted = useMemo(() => {
    return [...faqs].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.question.localeCompare(b.question);
    });
  }, [faqs]);

  // Suggest the next available `order` number for new FAQs.
  const suggestedOrder = useMemo(() => {
    if (faqs.length === 0) return 1;
    return Math.max(...faqs.map((f) => f.order)) + 1;
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (f: Faq) => {
    setEditing(f);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete._id);
      toast.success("FAQ deleted");
      setPendingDelete(null);
    } catch (err) {
      if (isNotFoundError(err)) {
        toast.error("Delete isn't available yet — backend endpoint not implemented.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <>
      <PageMeta
        title="Help & Support | Travelo Admin"
        description="Manage FAQ content shown to users in the help center."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Help &amp; Support
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Curate the FAQ entries users see in the help center. Lower order
            numbers appear first.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          startIcon={<Plus className="size-4" />}
        >
          Add FAQ
        </Button>
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search question or answer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage label="Loading FAQs…" />
      ) : error ? (
        <EmptyState
          title="Failed to load FAQs"
          description={getErrorMessage(error)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches" : "No FAQs yet"}
          description={
            search
              ? "Try a different search term."
              : "Add your first FAQ so users can find answers in the help center."
          }
          action={
            !search && (
              <Button
                size="sm"
                onClick={openCreate}
                startIcon={<Plus className="size-4" />}
              >
                Add FAQ
              </Button>
            )
          }
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${
            isFetching ? "opacity-70 transition" : ""
          }`}
        >
          {filtered.map((f) => (
            <FAQCard
              key={f._id}
              faq={f}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <FAQFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        faq={editing}
        suggestedOrder={suggestedOrder}
      />

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this FAQ?"
        description={
          pendingDelete
            ? `"${pendingDelete.question}" will be permanently removed. This cannot be undone.`
            : ""
        }
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
