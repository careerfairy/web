module.exports = {
   root: true,
   env: {
      es6: true,
      node: true,
   },
   extends: [
      "next/core-web-vitals",
      "prettier",
      "plugin:storybook/recommended",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
   ],
   plugins: ["@typescript-eslint"],
   rules: {
      "react/jsx-no-constructed-context-values": "warn",
      "react/jsx-no-leaked-render": "warn",
      "react/no-object-type-as-default-prop": "warn",
      "react/boolean-prop-naming": "warn",
      "react/hook-use-state": "warn",
      "react/jsx-handler-names": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/ban-ts-comment": "off",
   },
   parser: "@typescript-eslint/parser",
}
