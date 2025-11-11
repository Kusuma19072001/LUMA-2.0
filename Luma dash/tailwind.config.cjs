/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Poppins"', "sans-serif"],
        body: ['"Nunito"', "sans-serif"],
      },
      keyframes: {
        bubbleIn: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          "60%": { opacity: "1", transform: "translateY(0) scale(1.01)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        auraPulse: {
          "0%": { opacity: "0.55", transform: "scale(0.98)" },
          "50%": { opacity: "0.7", transform: "scale(1.02)" },
          "100%": { opacity: "0.55", transform: "scale(0.98)" },
        },
      },
      animation: {
        bubbleIn: "bubbleIn 0.45s ease-out both",
        auraPulse: "auraPulse 6s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 40px 120px -60px rgba(74, 157, 143, 0.45)",
      },
    },
  },
  plugins: [],
};

