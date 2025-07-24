/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Canva-inspired color palette
        canva: {
          purple: {
            50: "hsl(280 100% 98%)",
            100: "hsl(280 100% 95%)",
            200: "hsl(275 100% 90%)",
            300: "hsl(270 100% 85%)",
            400: "hsl(270 95% 75%)",
            500: "hsl(270 95% 60%)",
            600: "hsl(270 90% 50%)",
            700: "hsl(270 85% 40%)",
            800: "hsl(270 80% 30%)",
            900: "hsl(270 75% 20%)",
          },
          blue: {
            50: "hsl(220 100% 98%)",
            100: "hsl(220 100% 95%)",
            200: "hsl(220 95% 90%)",
            300: "hsl(220 90% 80%)",
            400: "hsl(220 85% 70%)",
            500: "hsl(220 80% 60%)",
            600: "hsl(220 75% 50%)",
            700: "hsl(220 70% 40%)",
            800: "hsl(220 65% 30%)",
            900: "hsl(220 60% 20%)",
          },
          pink: {
            50: "hsl(320 100% 98%)",
            100: "hsl(320 100% 95%)",
            200: "hsl(320 95% 90%)",
            300: "hsl(320 90% 80%)",
            400: "hsl(320 85% 70%)",
            500: "hsl(320 80% 60%)",
            600: "hsl(320 75% 50%)",
            700: "hsl(320 70% 40%)",
            800: "hsl(320 65% 30%)",
            900: "hsl(320 60% 20%)",
          },
          orange: {
            50: "hsl(30 100% 98%)",
            100: "hsl(30 100% 95%)",
            200: "hsl(30 95% 90%)",
            300: "hsl(30 90% 80%)",
            400: "hsl(30 85% 70%)",
            500: "hsl(30 80% 60%)",
            600: "hsl(30 75% 50%)",
            700: "hsl(30 70% 40%)",
            800: "hsl(30 65% 30%)",
            900: "hsl(30 60% 20%)",
          },
          green: {
            50: "hsl(150 100% 98%)",
            100: "hsl(150 100% 95%)",
            200: "hsl(150 95% 90%)",
            300: "hsl(150 90% 80%)",
            400: "hsl(150 85% 70%)",
            500: "hsl(150 80% 60%)",
            600: "hsl(150 75% 50%)",
            700: "hsl(150 70% 40%)",
            800: "hsl(150 65% 30%)",
            900: "hsl(150 60% 20%)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 