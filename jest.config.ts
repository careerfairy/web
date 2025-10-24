// jest.config.ts
import type { Config } from "@jest/types"

const path = require("path")

const fromRoot = (d: string) => path.join(__dirname, d)

const config: Config.InitialOptions = {
   roots: [
      fromRoot("apps/web"),
      // example root dir for function tests
      // fromRoot("packages/functions")
   ],
   collectCoverageFrom: [
      "**/*.{js,jsx,ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/.next/**",
      "!**/public/**",
      "!**/types/**",
   ],
   testPathIgnorePatterns: [
      "<rootDir>/node_modules/",
      "<rootDir>/.next/",
      "/streaming/test",
      // Jest should ignore e2e tests,
      // that job is for playwright ;)
      "<rootDir>/tests/e2e/",
      "<rootDir>/pages/landing",
   ],
   moduleDirectories: ["node_modules", "<rootDir>"],
   testEnvironment: "<rootDir>/../../packages/config-jest/jsdom-environment.js",
   transform: {
      /* Use babel-jest to transpile tests with the next/babel preset
      https://jestjs.io/docs/webpack#mocking-css-modules */
      "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
   },
   transformIgnorePatterns: [
      "/node_modules/",
      "^.+\\.module\\.(css|sass|scss)$",
   ],
}
export default config
