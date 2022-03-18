// jest.config.ts
import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
   collectCoverageFrom: [
      "**/*.{js,jsx,ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/.next/**",
      "!**/public/**",
      "!**/types/**",
   ],
   setupFiles: ["<rootDir>/.jest/setEnvVars.ts"],
   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
   moduleNameMapper: {
      /* Handle CSS imports (with CSS modules)clear
      https://jestjs.io/docs/webpack#mocking-css-modules */
      "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

      // Handle CSS imports (without CSS modules)
      "^.+\\.(css|sass|scss)$": "<rootDir>/tests/__mocks__/styleMock.js",

      /* Handle image imports
      https://jestjs.io/docs/webpack#handling-static-assets */
      "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
         "<rootDir>/tests/__mocks__/fileMock.js",
   },
   testPathIgnorePatterns: [
      "<rootDir>/node_modules/",
      "<rootDir>/.next/",
      "/streaming/test",
      // Jest should ignore e2e tests,
      // that job is for playwright ;)
      "<rootDir>/tests/e2e/",
   ],
   moduleDirectories: ["node_modules", "<rootDir>"],
   // roots: ["<rootDir>/e2e/"],
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
