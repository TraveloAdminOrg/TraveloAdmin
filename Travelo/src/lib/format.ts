export const formatCurrency = (
  amount: number,
  currency = "USD",
  locale = "en-US",
) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);

export const formatDate = (input: string | Date, locale = "en-US") =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(input));

export const formatDateTime = (input: string | Date, locale = "en-US") =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input));
