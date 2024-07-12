import base from "../../jest.config"

// eslint-disable-next-line import/no-anonymous-default-export
export default {
   ...base,
   name: "careerfairy-web-app",
   displayName: "CareerFairy Web App Tests",
   setupFiles: [`<rootDir>/.jest/setEnvVars.ts`],
   setupFilesAfterEnv: [`<rootDir>/jest.setup.ts`],
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
   },
}
