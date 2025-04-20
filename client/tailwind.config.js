/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // You can add custom colors, fonts, etc. here
      colors: {
        primary: "#1F2937",
        secondary: "#3B82F6",
        accent: "#10B981",
        // brand palette
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2159d3",
          600: "#2563eb",
        },
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
  plugins: [],
};
