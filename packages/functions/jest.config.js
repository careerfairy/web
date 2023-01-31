/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
   preset: "ts-jest",
   testEnvironment: "node",
   modulePathIgnorePatterns: ["dist"],
   moduleNameMapper: {
      "@careerfairy/shared-lib/(.*)":
         "<rootDir>../../packages/shared-lib/src/$1",
   },
}
