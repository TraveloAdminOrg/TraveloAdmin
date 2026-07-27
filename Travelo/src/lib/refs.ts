import type { PricingRegion, PricingRideTypeRef } from "../types/pricing";

// The backend populates these refs on GET but returns a bare _id on POST/PATCH,
// and leaves them null when the referenced document was deleted. These helpers
// read a ref in any of those three shapes.
type Ref<T> = T | string | null | undefined;

/** The _id of a ref, whether populated, a bare id, or null. "" when absent. */
export const refId = (r: Ref<{ _id: string }>): string => {
  if (!r) return "";
  return typeof r === "string" ? r : (r._id ?? "");
};

/** A ride type's title — undefined unless the ref is populated. */
export const refTitle = (r: Ref<PricingRideTypeRef>): string | undefined => {
  if (!r || typeof r === "string") return undefined;
  return r.title;
};

export const regionRefId = (r: Ref<PricingRegion>): string => refId(r);

/**
 * A human label for a region ref. Falls back to an id → country map for the
 * write-response case where the backend returns only the id.
 */
export const regionDisplayName = (
  r: Ref<PricingRegion>,
  regionNameById?: Map<string, string>,
): string => {
  if (!r) return "—";
  if (typeof r === "string") return regionNameById?.get(r) ?? "—";
  return r.country || r.code || regionNameById?.get(r._id) || "—";
};
