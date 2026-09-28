/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,15,20,0.04), 0 1px 3px 0 rgba(15,15,20,0.06)",
        popover: "0 4px 6px -1px rgba(15,15,20,0.08), 0 2px 4px -2px rgba(15,15,20,0.06)",
      },
    },
  },
  plugins: [],
};
