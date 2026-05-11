/**
 * Tailwind CSS v4 — theme is defined CSS-first in src/app/globals.css
 * using @theme inline {} and CSS custom properties.
 *
 * This file exists for plugin registration and any v4-compatible overrides.
 * Do not add v3-style `theme.extend` here — it has no effect in v4.
 */
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/emails/**/*.{ts,tsx}',
  ],
  plugins: [],
} satisfies Config
