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
        // New color palette - White, Light Blue, Light Purple focus
        primary: {
          50: "hsl(250 100% 99%)",
          100: "hsl(250 100% 97%)",
          200: "hsl(250 95% 94%)",
          300: "hsl(250 90% 88%)",
          400: "hsl(250 85% 80%)",
          500: "hsl(250 80% 70%)",
          600: "hsl(250 75% 60%)",
          700: "hsl(250 70% 50%)",
          800: "hsl(250 65% 40%)",
          900: "hsl(250 60% 30%)",
        },
        secondary: {
          50: "hsl(210 100% 99%)",
          100: "hsl(210 100% 97%)",
          200: "hsl(210 95% 94%)",
          300: "hsl(210 90% 88%)",
          400: "hsl(210 85% 80%)",
          500: "hsl(210 80% 70%)",
          600: "hsl(210 75% 60%)",
          700: "hsl(210 70% 50%)",
          800: "hsl(210 65% 40%)",
          900: "hsl(210 60% 30%)",
        },
        accent: {
          50: "hsl(300 100% 99%)",
          100: "hsl(300 100% 97%)",
          200: "hsl(300 95% 94%)",
          300: "hsl(300 90% 88%)",
          400: "hsl(300 85% 80%)",
          500: "hsl(300 80% 70%)",
          600: "hsl(300 75% 60%)",
          700: "hsl(300 70% 50%)",
          800: "hsl(300 65% 40%)",
          900: "hsl(300 60% 30%)",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(250 100% 99%) 0%, hsl(210 100% 99%) 50%, hsl(300 100% 99%) 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, hsl(250 60% 10%) 0%, hsl(210 60% 10%) 50%, hsl(300 60% 10%) 100%)',
        'gradient-card': 'linear-gradient(135deg, hsl(250 100% 98%) 0%, hsl(210 100% 98%) 100%)',
        'gradient-card-dark': 'linear-gradient(135deg, hsl(250 60% 15%) 0%, hsl(210 60% 15%) 100%)',
        'gradient-button': 'linear-gradient(135deg, hsl(250 80% 70%) 0%, hsl(210 80% 70%) 100%)',
        'gradient-button-hover': 'linear-gradient(135deg, hsl(250 85% 65%) 0%, hsl(210 85% 65%) 100%)',
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