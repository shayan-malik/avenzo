export function formatPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) return "Rs\u00A00";

  return (
    "Rs\u00A0" +
    number.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  );
}

export default formatPrice;