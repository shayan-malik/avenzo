export function formatPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) return "Rs 0";

  return "Rs " + number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}