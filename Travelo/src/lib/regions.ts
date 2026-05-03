export const REGIONS = [
  { code: "PK", label: "Pakistan", currency: "PKR" },
  { code: "MT", label: "Malta", currency: "EUR" },
  { code: "GB", label: "United Kingdom", currency: "GBP" },
] as const;

export type RegionCode = (typeof REGIONS)[number]["code"];

export const REGION_CODES = REGIONS.map((r) => r.code) as RegionCode[];

export const isRegionCode = (v: string): v is RegionCode =>
  REGION_CODES.includes(v as RegionCode);

export const regionLabel = (code: RegionCode): string =>
  REGIONS.find((r) => r.code === code)?.label ?? code;

export const regionCurrency = (code: RegionCode): string =>
  REGIONS.find((r) => r.code === code)?.currency ?? "";
