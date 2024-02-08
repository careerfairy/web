module.exports = {
   root: true,
   env: {
      es6: true,
      node: true,
   },
   extends: [
      "prettier",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
   ],
   plugins: ["@typescript-eslint"],
   rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/ban-ts-comment": "off",
   },
   parser: "@typescript-eslint/parser",
}
