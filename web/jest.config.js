// Configuración de Jest usando el transformador oficial de Next.js
// (maneja TS, JSX y los alias de módulos como "@/...").
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
};

module.exports = createJestConfig(customConfig);
