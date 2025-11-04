/**
 * Custom jsdom environment that prevents canvas module loading errors in Jest
 *
 * Context: After upgrading react-pdf from v5.6.0 to v7.7.3, tests started failing in CI with:
 * "Cannot find module '../build/Release/canvas.node'"
 *
 * Why this happens:
 * - jsdom (Jest's DOM environment) has 'canvas' as an optional dependency
 * - The newer pdfjs-dist (used by react-pdf 7.x) triggers jsdom to try loading canvas
 * - In CI environments without native build tools, canvas compilation fails
 * - Without the compiled native module, jsdom crashes on load
 *
 * Solution:
 * This custom environment mocks the canvas module BEFORE jsdom initializes,
 * preventing the native module loading error. Tests pass locally and in CI.
 */
const JSDOMEnvironment = require("jest-environment-jsdom").TestEnvironment

// Pre-populate require cache with empty canvas module to prevent native module loading
try {
   require.cache[require.resolve("canvas")] = {
      id: require.resolve("canvas"),
      filename: require.resolve("canvas"),
      loaded: true,
      exports: {},
   }
} catch (e) {
   // Canvas module not found - that's ok, we only need to mock it if it exists
}

module.exports = JSDOMEnvironment
