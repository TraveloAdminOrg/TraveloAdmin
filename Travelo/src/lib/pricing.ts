import type { WeeklyFareEntry } from "../types/pricing";

export const DAYS = [
  { value: 0, short: "Sun", long: "Sunday" },
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
] as const;

export const isWeekend = (dayOfWeek: number): boolean =>
  dayOfWeek === 0 || dayOfWeek === 6;

export type FareFieldKey = keyof Omit<WeeklyFareEntry, "dayOfWeek">;

export interface FareField {
  key: FareFieldKey;
  label: string;
  // `money` fields are currency amounts; `multiplier` scales the total fare and
  // must never be formatted as currency.
  kind: "money" | "multiplier";
}

// Single source of truth for the fare fields. Adding a fare field here wires it
// into the form, the card, and the blank-day factory at once.
export const FARE_FIELDS: readonly FareField[] = [
  { key: "baseFare", label: "Base", kind: "money" },
  { key: "pricePerKm", label: "Per km", kind: "money" },
  { key: "pricePerMinute", label: "Per min", kind: "money" },
  { key: "minimumFare", label: "Min fare", kind: "money" },
  { key: "cancellationFee", label: "Cancel fee", kind: "money" },
  { key: "cleaningCharge", label: "Cleaning", kind: "money" },
  { key: "waitingCharge", label: "Waiting", kind: "money" },
  { key: "surgeMultiplier", label: "Surge", kind: "multiplier" },
] as const;

// The fare is multiplied by this, so 1 — not 0 — is the "no surge" value.
export const NEUTRAL_SURGE = 1;

export const blankDay = (dayOfWeek: number): WeeklyFareEntry => {
  const entry = { dayOfWeek } as WeeklyFareEntry;
  for (const f of FARE_FIELDS) {
    entry[f.key] = f.kind === "multiplier" ? NEUTRAL_SURGE : 0;
  }
  return entry;
};

export const blankWeek = (): WeeklyFareEntry[] =>
  DAYS.map((d) => blankDay(d.value));

/** Exactly 7 entries ordered Sun→Sat, filling any day the backend omitted. */
export const normaliseWeek = (
  week: WeeklyFareEntry[] | null | undefined,
): WeeklyFareEntry[] => {
  const byDay = new Map((week ?? []).map((d) => [d.dayOfWeek, d]));
  return DAYS.map((d) => byDay.get(d.value) ?? blankDay(d.value));
};

/** Copy `source`'s fare values across all 7 days, preserving each dayOfWeek. */
export const spreadAcrossWeek = (source: WeeklyFareEntry): WeeklyFareEntry[] =>
  DAYS.map((d) => ({ ...source, dayOfWeek: d.value }));

/**
 * The shared fare entry when all 7 days are identical, else null. Normalises
 * first, so a short or unsorted week still collapses correctly.
 */
export const collapseUniform = (
  week: WeeklyFareEntry[] | null | undefined,
): WeeklyFareEntry | null => {
  const full = normaliseWeek(week);
  const [first] = full;
  const uniform = full.every((d) =>
    FARE_FIELDS.every((f) => d[f.key] === first[f.key]),
  );
  return uniform ? first : null;
};

export const isUniformWeek = (
  week: WeeklyFareEntry[] | null | undefined,
): boolean => collapseUniform(week) !== null;
