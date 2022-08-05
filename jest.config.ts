// jest.config.ts
import type { Config } from "@jest/types"

const path = require("path")

const fromRoot = (d) => path.join(__dirname, d)

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
   testEnvironment: "jsdom",
   transform: {
      /* Use babel-jest to transpile tests with the next/babel preset
      https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
      "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
   },
   transformIgnorePatterns: [
      "/node_modules/",
      "^.+\\.module\\.(css|sass|scss)$",
   ],
   coverageThreshold: null,
}
export default config
