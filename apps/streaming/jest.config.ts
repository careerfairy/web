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
   transformIgnorePatterns: [
      "/node_modules/(?!@careerfairy/shared-ui).+\\.js$",
   ],
   moduleNameMapper: {
      /* Handle CSS imports (with CSS modules)clear
    https://jestjs.io/docs/webpack#mocking-css-modules */
      "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

      // Handle CSS imports (without CSS modules)
      "^.+\\.(css|sass|scss)$": `<rootDir>/tests/__mocks__/styleMock.js`,

      /* Handle image imports
    https://jestjs.io/docs/webpack#handling-static-assets */
      "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
         "<rootDir>/tests/__mocks__/fileMock.js",

      "@careerfairy/shared-lib/dist/(.*)":
         "<rootDir>/../../packages/shared-lib/dist/$1",
      "@careerfairy/shared-lib/(.*)":
         "<rootDir>/../../packages/shared-lib/src/$1",
      "@careerfairy/shared-ui/dist/(.*)":
         "<rootDir>/../../packages/shared-ui/dist/$1",
      "@careerfairy/shared-ui/(.*)":
         "<rootDir>/../../packages/shared-ui/src/$1",
   },
}

module.exports = jestConfig
