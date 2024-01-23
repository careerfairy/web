/** @type {import("eslint").Linter.Config} */
module.exports = {
   root: true,

   parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
   },
   parser: "@typescript-eslint/parser",

   plugins: ["@typescript-eslint"],
}
