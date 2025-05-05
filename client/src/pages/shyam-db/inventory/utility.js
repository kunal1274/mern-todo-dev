/* tailwind utility buttons */
const btnBase =
  "inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm";
const Btn = (extra) => `${btnBase} ${extra}`;
const btnPrimary = Btn("bg-brand-600 text-white hover:bg-brand-500");
const btnSecondary = Btn("hover:bg-gray-50");
export { btnPrimary, btnSecondary };
