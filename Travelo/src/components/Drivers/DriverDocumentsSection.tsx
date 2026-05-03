import { useMemo, useState } from "react";
import { Download, Eye, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import type { Driver } from "../../types/driver";

interface Props {
  driver: Driver;
}

interface DocumentItem {
  /** Stable key for selection state */
  key: string;
  /** Display name */
  label: string;
  /** Direct URL to the file (image or PDF) */
  url?: string | null;
}

/**
 * Document field names the backend may return on a driver. As the backend adds
 * more fields, just add the key + label here — the UI will render them automatically.
 *
 * The Driver type is currently strict, so we read these via `(driver as any)[key]`
 * — that's intentional until the backend confirms the final field names.
 */
const DOC_FIELDS: { key: string; label: string }[] = [
  { key: "image", label: "Profile photo" },
  { key: "drivingLicense", label: "Driving license" },
  { key: "drivingLicenseFront", label: "Driving license (front)" },
  { key: "drivingLicenseBack", label: "Driving license (back)" },
  { key: "idCardFront", label: "ID card (front)" },
  { key: "idCardBack", label: "ID card (back)" },
  { key: "vehicleRegistration", label: "Vehicle registration" },
  { key: "insurance", label: "Insurance" },
  { key: "policeVerification", label: "Police verification" },
];

const isImage = (url: string) => /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);
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
    // Fallback: open the URL in a new tab so the user can save manually.
    // (Common when the file's CORS doesn't allow blob fetch.)
    console.warn("[downloadFile] blob fetch failed, opening in tab:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function DriverDocumentsSection({ driver }: Props) {
  const documents = useMemo<DocumentItem[]>(() => {
    return DOC_FIELDS.map(({ key, label }) => {
      const url = (driver as unknown as Record<string, unknown>)[key];
      return {
        key,
        label,
        url: typeof url === "string" && url.length > 0 ? url : null,
      };
    });
  }, [driver]);

  const uploaded = documents.filter((d) => d.url);
  const missing = documents.filter((d) => !d.url);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allSelected =
    uploaded.length > 0 && selected.size === uploaded.length;

  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(uploaded.map((d) => d.key)));
  };

  const downloadOne = (doc: DocumentItem) => {
    if (!doc.url) return;
    downloadFile(doc.url, fileNameFromUrl(doc.url));
  };

  const downloadSelected = async () => {
    const items = uploaded.filter((d) => selected.has(d.key));
    if (items.length === 0) {
      toast.error("Select at least one document");
      return;
    }
    toast.message(`Downloading ${items.length} file${items.length === 1 ? "" : "s"}…`);
    for (const item of items) {
      if (!item.url) continue;
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
            {uploaded.length} uploaded · {missing.length} missing
            {driver.isDocumentUploaded ? "" : " · Driver hasn't completed uploads"}
          </p>
        </div>

        {uploaded.length > 0 && (
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

      {/* Uploaded docs */}
      {uploaded.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No documents uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uploaded.map((doc) => {
            const url = doc.url!;
            const image = isImage(url);
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
                  onClick={() => setPreviewUrl(url)}
                  className="relative flex h-28 items-center justify-center bg-gray-50 dark:bg-white/[0.02]"
                  aria-label={`Preview ${doc.label}`}
                >
                  {image ? (
                    <img
                      src={url}
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
                    <span className="truncate text-xs font-medium text-gray-800 dark:text-white/90">
                      {doc.label}
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(url)}
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

      {/* Missing docs */}
      {missing.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Not uploaded
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((doc) => (
              <span
                key={doc.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              >
                <FileText className="size-3" />
                {doc.label}
              </span>
            ))}
          </div>
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
                  className="h-[80vh] w-[90vw] max-w-5xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
