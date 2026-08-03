/**
 * PNDDRR — Modular architecture map
 *
 * Each domain owns its engine source under src/modules/<domain>/.
 * Rebuild the browser bundle with: npm run engine:build
 *
 * Migration path: replace engine/*.js view renderers with React
 * components in the same folder while keeping the shared store API.
 */
export const MODULES = [
  "core",
  "referentials",
  "auth",
  "shell",
  "dashboard",
  "combattants",
  "armes",
  "reintegration",
  "cartographie",
  "documents",
  "admin",
  "stats",
  "demo",
] as const;

export type ModuleId = (typeof MODULES)[number];
