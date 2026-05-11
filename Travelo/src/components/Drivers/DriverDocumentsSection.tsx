import { useMemo, useState } from "react";
import { Download, Eye, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import type {
  Driver,
  DriverDocumentCategoryRaw,
  DriverDocumentFile,
} from "../../types/driver";

interface Props {
  driver: Driver;
}

// Human-readable labels for the categories the backend returns. Any category
// not in this map falls back to a humanized version of the backend key.
const CATEGORY_LABELS: Record<string, string> = {
  idCard: "ID card",
  drivingLicense: "Driving license",
  VehicleRegisterationCertificate: "Vehicle registration certificate",
};

const labelFor = (key: string) =>
  CATEGORY_LABELS[key] ??
  key
    // CamelCase → spaced
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

interface NormalisedDoc {
  /** Stable selection key — e.g. "idCard-0" so multiple files in a category stay independent */
  key: string;
  /** Category key the backend used (e.g. "idCard") */
  categoryKey: string;
  /** Friendly category label */
  label: string;
  /** File index within its category, when there are multiple */
  index?: number;
  url: string;
  status?: string;
  expiryDate?: string | null;
}

// Flatten the three possible category shapes into a single DocFile[].
function readCategory(raw: DriverDocumentCategoryRaw | undefined): {
  files: DriverDocumentFile[];
  categoryExpiry?: string | null;
} {
  if (!raw) return { files: [] };

  // Variant 2: array of files directly.
  if (Array.isArray(raw)) return { files: raw };

  // Variant 1: { expiryDate, files }
  if ("files" in raw && Array.isArray((raw as { files?: unknown }).files)) {
    const v = raw as { expiryDate?: string | null; files: DriverDocumentFile[] };
    return { files: v.files, categoryExpiry: v.expiryDate ?? undefined };
  }

  // Variant 3: single file as a flat object.
  const v = raw as DriverDocumentFile & { type?: string };
  if (v.url) return { files: [v] };

  return { files: [] };
}

const isImage = (url: string) =>
  /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);

const fileNameFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop() || "document");
  } catch {
    return "document";
  }
};

async function downloadFile(url: string, fallbackName: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // Fallback when CORS blocks the blob fetch: open in a new tab.
    console.warn("[downloadFile] blob fetch failed, opening in tab:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const statusTone = (status?: string): string => {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400";
    case "rejected":
      return "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400";
    case "pending":
      return "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function DriverDocumentsSection({ driver }: Props) {
  const documents = useMemo<NormalisedDoc[]>(() => {
    const raw = driver.driverDocuments?.documents;
    if (!raw) return [];

    const out: NormalisedDoc[] = [];
    Object.entries(raw).forEach(([categoryKey, value]) => {
      const { files, categoryExpiry } = readCategory(value);
      files.forEach((f, idx) => {
        out.push({
          key: `${categoryKey}-${idx}`,
          categoryKey,
          label: labelFor(categoryKey),
          index: files.length > 1 ? idx + 1 : undefined,
          url: f.url,
          status: f.status,
          // Per-file expiryDate wins; otherwise inherit the category-level one.
          expiryDate: f.expiryDate ?? categoryExpiry ?? null,
        });
      });
    });
    return out;
  }, [driver]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allSelected =
    documents.length > 0 && selected.size === documents.length;

  const toggleOne = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(documents.map((d) => d.key)));

  const downloadOne = (doc: NormalisedDoc) =>
    downloadFile(doc.url, fileNameFromUrl(doc.url));

  const downloadSelected = async () => {
    const items = documents.filter((d) => selected.has(d.key));
    if (items.length === 0) {
      toast.error("Select at least one document");
      return;
    }
    toast.message(
      `Downloading ${items.length} file${items.length === 1 ? "" : "s"}…`,
    );
    for (const item of items) {
      // Stagger so browsers don't block multi-download.
      await new Promise((r) => setTimeout(r, 150));
      await downloadFile(item.url, fileNameFromUrl(item.url));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Documents
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {documents.length} file{documents.length === 1 ? "" : "s"}
            {driver.isDocumentUploaded
              ? ""
              : " · Driver hasn't completed uploads"}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="size-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Select all
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadSelected}
              disabled={selected.size === 0}
              startIcon={<Download className="size-4" />}
            >
              Download selected ({selected.size})
            </Button>
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No documents uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const image = isImage(doc.url);
            const checked = selected.has(doc.key);
            return (
              <div
                key={doc.key}
                className={`group flex flex-col overflow-hidden rounded-xl border transition ${
                  checked
                    ? "border-brand-500 bg-brand-50/50 dark:border-brand-400 dark:bg-brand-500/5"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                {/* Preview */}
                <button
                  type="button"
                  onClick={() => setPreviewUrl(doc.url)}
                  className="relative flex h-28 items-center justify-center bg-gray-50 dark:bg-white/[0.02]"
                  aria-label={`Preview ${doc.label}`}
                >
                  {image ? (
                    <img
                      src={doc.url}
                      alt={doc.label}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <FileText className="size-10 text-gray-400" />
                  )}
                  <span className="absolute right-2 top-2 rounded bg-white/80 p-1 opacity-0 transition group-hover:opacity-100 dark:bg-gray-900/80">
                    {image ? (
                      <ImageIcon className="size-3.5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <FileText className="size-3.5 text-gray-600 dark:text-gray-300" />
                    )}
                  </span>
                  {doc.status && (
                    <span
                      className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${statusTone(doc.status)}`}
                    >
                      {doc.status}
                    </span>
                  )}
                </button>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 p-2 dark:border-gray-800">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(doc.key)}
                      className="size-3.5 shrink-0 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-gray-800 dark:text-white/90">
                        {doc.label}
                        {doc.index !== undefined && (
                          <span className="ml-1 text-[10px] font-normal text-gray-400">
                            #{doc.index}
                          </span>
                        )}
                      </span>
                      {doc.expiryDate && (
                        <span className="block truncate text-[10px] text-gray-400">
                          Expires{" "}
                          {new Date(doc.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(doc.url)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="View"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadOne(doc)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="Download"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal — minimal, just enough to see the document */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                {fileNameFromUrl(previewUrl)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<Download className="size-4" />}
                  onClick={() =>
                    downloadFile(previewUrl, fileNameFromUrl(previewUrl))
                  }
                >
                  Download
                </Button>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center bg-gray-50 dark:bg-white/[0.02]">
              {isImage(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[80vh] max-w-full object-contain"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title="Document preview"
                  className="h-[70vh] w-full max-w-5xl sm:h-[80vh] sm:w-[90vw]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
