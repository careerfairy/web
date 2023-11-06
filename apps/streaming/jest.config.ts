import { Config } from "jest"

import { jestConfigJsdom } from "../../packages/config-jest"

const jestConfig: Config = {
   ...jestConfigJsdom,
   roots: ["<rootDir>/"],
   modulePaths: ["<rootDir>/"],
   collectCoverageFrom: ["./**/*.{ts,tsx}", "!./**/*.stories.tsx"],
   coverageThreshold: {
      global: {
         branches: 0,
         functions: 0,
         lines: 0,
         statements: 0,
      },
   },
   transform: {
      /* Use babel-jest to transpile tests with the next/babel preset
      https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
      "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
   },
}

module.exports = jestConfig
