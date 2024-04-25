import { PaletteOptions, ThemeOptions } from "@mui/material/styles"
import { grey } from "@mui/material/colors"
import { PaletteMode } from "@mui/material"

export const common = {
   black: "#1F1F1F", // our default black
   white: "#FEFEFE", // our default white
} satisfies PaletteOptions["common"]

export const primary = {
   main: "#2ABAA5",
   light: "#F1FCF9",
   dark: "#229584",
   contrastText: common.white,
   "50": "#F1FCF9",
   "100": "#D1F6ED",
   "200": "#95DDD2",
   "300": "#7FD6C9",
   "400": "#6ACFC0",
   "500": "#55C8B7",
   "600": "#2ABAA5",
   "700": "#26A795",
   "800": "#229584",
   /**
    * Legacy theme options
    */
   gradient: "#07c1a7",
} satisfies PaletteOptions["primary"]

export const secondary = {
   main: "#6749EA",
   light: "#F0EDFD",
   dark: "#523ABB",
   contrastText: common.white,
   "50": "#F0EDFD",
   "100": "#E1DBFB",
   "200": "#D1C8F9",
   "300": "#D1C8F9",
   "400": "#9580F0",
   "500": "#856DEE",
   "600": "#6749EA",
   "700": "#5D42D3",
   "800": "#523ABB",
   /**
    * Legacy theme options
    */
   gradient: "#644eec",
} satisfies PaletteOptions["secondary"]

/**
 * Legacy theme options
 */
export const tertiary = {
   main: "#FAEDF2",
   light: "rgb(251, 240, 244)",
   dark: "rgb(175, 165, 169)",
   contrastText: "rgba(0, 0, 0, 0.87)",
   gradient: "#f5f5f5",
} satisfies PaletteOptions["tertiary"]

/**
 * Legacy theme options
 */
export const gold = {
   main: "#FFC34F",
   contrastText: "#FFFFFF",
   dark: "#FFC34F",
   light: "#FFC34F",
} satisfies PaletteOptions["gold"]

/**
 * Legacy theme options
 */
export const blackColors = {
   main: tertiary.contrastText,
   contrastText: primary.main,
   dark: tertiary.contrastText,
   light: tertiary.contrastText,
} satisfies PaletteOptions["black"]

export const brand = {
   black: {
      "100": "#FAFAFA",
      "200": "#FAFAFA",
      "300": "#F3F3F3",
      "400": "#EEEEEE",
      "500": "#E1E1E1",
      "600": "#CACACA",
      "700": "#8E8E8E",
      "800": "#4B4B4B",
      "900": "#1F1F1F",
   },
   white: {
      "50": "#FFFFFF",
      "100": "#FEFEFE",
      "200": "#FCFCFE",
      "300": "#FAFAFE",
      "400": "#F6F6FA",
      "500": "#F3F3F5",
   },
   tq: primary,
   purple: secondary,
   info: {
      main: "#3A70E2",
      "50": "#EBF1FC",
      "100": "#D8E2F9",
      "200": "#C4D4F6",
      "300": "#B0C6F3",
      "400": "#89A9EE",
      "500": "#618DE8",
      "600": "#3A70E2",
      "700": "#3465CB",
   },
   warning: {
      // yellow/orange
      main: "#FE9B0E",
      "50": "#FFF5E7",
      "100": "#FFEBCF",
      "200": "#FFE1B7",
      "300": "#FFD79F",
      "400": "#FEC36E",
      "500": "#FEAF3E",
      "600": "#FE9B0E",
      "700": "#E58C0D",
   },
   error: {
      // red
      main: "#FF1616",
      "50": "#FFE8E8",
      "100": "#FFD0D0",
      "200": "#FFB9B9",
      "300": "#FFA2A2",
      "400": "#FF7373",
      "500": "#FF4545",
      "600": "#FF1616",
      "700": "#E61414",
   },
   success: {
      // green
      main: "#00D247",
      "50": "#E6FBED",
      "100": "#CCF6DA",
      "200": "#B3F2C8",
      "300": "#99EDB5",
      "400": "#66E491",
      "500": "#33DB6C",
      "600": "#00D247",
      "700": "#00BD40",
   },
} satisfies ThemeOptions["brand"]

export const getPalette = (mode: PaletteMode) => {
   const isDark = mode === "dark"
   const palette = {
      mode,
      primary: primary,
      secondary: secondary,
      neutral: {
         main: "#FF5733",
         "50": "#EBEBEF",
         "100": "#D6D6E0",
         "200": "#C2C2D0",
         "300": "#ADADC1",
         "400": "#9999B1",
         "500": "#7A7A8E",
         "600": "#6B6B7F",
         "700": "#5C5C6A",
         "800": "#3D3D47",
         "900": "#1F1F23",
      },
      success: brand.success,
      warning: brand.warning,
      error: brand.error,
      /**
       * Legacy info color
       */
      info: {
         ...(mode === "light"
            ? {
                 // palette values for light mode
                 light: "#F5F5F5",
                 contrastText: "#333",
                 dark: "#F5F5F5",
                 main: "#fff",
              }
            : {
                 // palette values for dark mode
                 contrastText: "#FAFAFA",
                 dark: "#1E1E1E",
                 main: "#424242",
                 light: "#424242",
              }),
      },
      // TODO: Many components use the legacy info color. We will still have the color accessible in the theme.brand.info for now.
      // We'll need to manually change their color by extracting the theme => theme.brand.info instead of <Button variant="info"/>
      // Issue: https://linear.app/careerfairy/issue/CF-733/migrate-to-new-info-figma-color
      // info: brand.info,
      grey: {
         main: grey[300],
         dark: grey[400],
         ...grey,
      },
      text: isDark
         ? {
              primary: "#fff",
              secondary: "#B0B8C4",
              disabled: "rgba(255, 255, 255, 0.5)",
           }
         : {
              disabled: "#CACACA", // disabled text color
              primary: "#1F1F23", // main text color
              secondary: "#5C5C6A", // secondary lighter text color
           },
      common,
      action: isDark
         ? {
              disabled: "rgba(255, 255, 255, 0.3)",
              disabledBackground: "rgba(255, 255, 255, 0.12)",
           }
         : {
              disabled: brand.black[600], // disabled background color
              disabledBackground: brand.white[400], // disabled background color
              // no disabled opacity
              disabledOpacity: 1,
           },
      background: isDark
         ? { default: "#1E1E1E", paper: "#424242" }
         : { default: "#F5F5F5", paper: "#fff" },
      /**
       * Legacy theme options
       */
      black: blackColors,
      gold: gold,
      tertiary: tertiary,
      navyBlue: {
         main: "#2C4251",
         contrastText: "#FFFFFF",
      },
   } satisfies PaletteOptions

   return palette
}
