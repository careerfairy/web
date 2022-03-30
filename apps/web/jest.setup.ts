// jest.setup.js

import "@testing-library/jest-dom/extend-expect"

// @ts-ignore
window.matchMedia =
   window.matchMedia ||
   function () {
      return {
         matches: false,
         addListener: function () {},
         removeListener: function () {},
      }
   }
