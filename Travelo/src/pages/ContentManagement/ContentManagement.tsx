import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileText,
  Save,
  Trash2,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import DeleteConfirmDialog from "../../components/common/DeleteConfirmDialog";
import Button from "../../components/ui/button/Button";
import {
  useContentByTypeQuery,
  useCreateContent,
  useDeleteContent,
  useUpdateContent,
} from "../../hooks/queries/useContent";
import { formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../lib/error";

interface ContentType {
  type: string;
  label: string;
  description?: string;
}

const PAGES: ContentType[] = [
  {
    type: "privacy_policy",
    label: "Privacy Policy",
    description: "How user data is collected, stored and shared.",
  },
  {
    type: "terms_condition",
    label: "Terms & Conditions",
    description: "Rules users agree to when using the app.",
  },
  {
    type: "about_us",
    label: "About Us",
    description: "Company background and mission.",
  },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function ContentManagement() {
  const [selectedType, setSelectedType] = useState<string>(PAGES[0].type);
  const [draft, setDraft] = useState<string>("");
  const [pendingDelete, setPendingDelete] = useState<ContentType | null>(null);

  const { data: content, isLoading, isFetching, error } =
    useContentByTypeQuery(selectedType);
  const createMut = useCreateContent();
  const updateMut = useUpdateContent();
  const deleteMut = useDeleteContent();

  const selected = PAGES.find((t) => t.type === selectedType);

  // Sync the editor draft whenever the loaded content (or selected page) changes.
  useEffect(() => {
    setDraft(content?.text ?? "");
  }, [content, selectedType]);

  const isDirty = draft !== (content?.text ?? "");
  const exists = !!content;
  const isSaving = createMut.isPending || updateMut.isPending;

  const onSave = async () => {
    if (!selected) return;
    const plain = draft.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      toast.error("Content can't be empty.");
      return;
    }
    try {
      if (exists) {
        await updateMut.mutateAsync({ type: selectedType, text: draft });
        toast.success(`${selected.label} updated`);
      } else {
        await createMut.mutateAsync({ type: selectedType, text: draft });
        toast.success(`${selected.label} created`);
      }
    } catch (err) {
      console.error("[content] save failed", err);
      toast.error(getErrorMessage(err));
    }
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync(pendingDelete.type);
      toast.success(`${pendingDelete.label} deleted`);
      setPendingDelete(null);
      setDraft("");
    } catch (err) {
      console.error("[content] delete failed", err);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta
        title="Content Management | Travelo Admin"
        description="Manage static content pages: privacy policy, terms, about us."
      />
      <PageBreadcrumb pageTitle="Content Management" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Content pages
            </h2>
          </div>
          <ul className="p-2">
            {PAGES.map((t) => {
              const isSelected = t.type === selectedType;
              return (
                <li key={t.type}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDirty && !confirm("Discard unsaved changes?")) return;
                      setSelectedType(t.type);
                    }}
                    className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <FileText
                      className={`mt-0.5 size-4 shrink-0 ${
                        isSelected
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.label}</p>
                      <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                        {t.type}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Editor */}
        <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {!selected ? (
            <EmptyState
              title="Pick a content page"
              description="Choose one from the left sidebar."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-base font-semibold text-gray-800 dark:text-white/90">
                      {selected.label}
                    </h1>
                    {exists ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success-700 dark:bg-success-500/10 dark:text-success-400">
                        <CheckCircle2 className="size-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <Circle className="size-3" /> Not created
                      </span>
                    )}
                    {isDirty && (
                      <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
                        Unsaved
                      </span>
                    )}
                  </div>
                  {selected.description && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {selected.description}
                    </p>
                  )}
                  {content?.updatedAt && (
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      Updated {formatDateTime(content.updatedAt)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {exists && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setPendingDelete(selected)}
                      startIcon={<Trash2 className="size-3.5" />}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving || isLoading}
                    startIcon={<Save className="size-3.5" />}
                  >
                    {isSaving
                      ? "Saving…"
                      : exists
                        ? "Update"
                        : "Create"}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="py-16">
                    <LoadingSpinner label="Loading content…" />
                  </div>
                ) : error ? (
                  <EmptyState
                    title="Failed to load content"
                    description={getErrorMessage(error)}
                  />
                ) : (
                  <div
                    className={`content-editor [&_.ql-container]:min-h-[260px] [&_.ql-editor]:min-h-[260px] ${
                      isFetching ? "opacity-70 transition" : ""
                    }`}
                  >
                    {!exists && (
                      <p className="mb-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                        <strong>{selected.label}</strong> hasn't been created yet.
                        Write the content below and click <strong>Create</strong>.
                      </p>
                    )}
                    <ReactQuill
                      key={selectedType}
                      value={draft}
                      onChange={setDraft}
                      modules={QUILL_MODULES}
                      theme="snow"
                      placeholder={`Write the ${selected.label.toLowerCase()} here…`}
                      className="bg-white dark:bg-gray-900"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <DeleteConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete this content?"
        description={
          pendingDelete
            ? `"${pendingDelete.label}" content will be permanently deleted.`
            : ""
        }
        isLoading={deleteMut.isPending}
        onConfirm={onConfirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
