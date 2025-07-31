import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#fefbf3",
          100: "#fdf4e1",
          200: "#fae8c2",
          300: "#f6d89a",
          400: "#f1c068",
          500: "#eca545",
          600: "#d88a2a",
          700: "#b46c22",
          800: "#925624",
          900: "#764821",
          950: "#42240f",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Consolas", "Monaco", "monospace"],
      },
      fontSize: {
        xs: ["13px", { lineHeight: "18px" }], // 12px → 13px
        sm: ["15px", { lineHeight: "22px" }], // 14px → 15px
        base: ["17px", { lineHeight: "26px" }], // 16px → 17px
        lg: ["19px", { lineHeight: "28px" }], // 18px → 19px
        xl: ["21px", { lineHeight: "30px" }], // 20px → 21px
        "2xl": ["25px", { lineHeight: "32px" }], // 24px → 25px
        "3xl": ["31px", { lineHeight: "36px" }], // 30px → 31px
        "4xl": ["37px", { lineHeight: "40px" }], // 36px → 37px
        "5xl": ["45px", { lineHeight: "48px" }], // 44px → 45px
        "6xl": ["57px", { lineHeight: "60px" }], // 56px → 57px
        "7xl": ["72px", { lineHeight: "76px" }], // 71px → 72px
        "8xl": ["96px", { lineHeight: "100px" }], // 95px → 96px
        "9xl": ["128px", { lineHeight: "132px" }], // 127px → 128px
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
