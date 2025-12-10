export const generateSlipNumber = (prefix: string) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}${random}`;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export const monthLabel = (month: number | null | undefined, year: number | null | undefined) => {
  const m = Number(month);
  const y = Number(year);
  const isValidMonth = Number.isFinite(m) && m >= 1 && m <= 12;
  const isValidYear = Number.isFinite(y);
  if (!isValidMonth || !isValidYear) {
    return "Month not set";
  }
  return new Date(y, m - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export const numericMonth = (date: Date) => date.getMonth() + 1;
export const numericYear = (date: Date) => date.getFullYear();

