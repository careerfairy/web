import { Config } from "jest"

export const jestConfigJsdom: Config = {
   // Using custom jsdom environment to prevent canvas module errors after react-pdf v7 upgrade
   // See jsdom-environment.js for detailed explanation
   testEnvironment: "<rootDir>/../config-jest/jsdom-environment.js",
   preset: "ts-jest",
   roots: ["<rootDir>/src/"],
   modulePaths: ["<rootDir>/src/"],
   moduleDirectories: ["node_modules"],
   setupFilesAfterEnv: ["@testing-library/jest-dom"],
   transform: {
      "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
   },
}
