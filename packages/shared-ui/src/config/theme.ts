import { createTheme, PaletteOptions, ThemeOptions } from "@mui/material/styles"

const common = {
   black: "#1F1F1F", // our default black
   white: "#FEFEFE", // our default white
} satisfies PaletteOptions["common"]

const primary = {
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
} satisfies PaletteOptions["primary"]

const secondary = {
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
} satisfies PaletteOptions["secondary"]

const brand = {
   black: {
      "200": "#FAFAFA",
      "300": "#F5F5F5",
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
} satisfies ThemeOptions["brand"]

const palette = {
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
      "600": "#5C5C6A",
      "700": "#3D3D47",
      "800": "#1F1F23",
      "900": "#0F0F12",
   },
   success: {
      "50": "#E6FBED",
      "100": "#CCF6DA",
      "200": "#B3F2C8",
      "300": "#99EDB5",
      "400": "#66E491",
      "500": "#33DB6C",
      "600": "#00D247",
      "700": "#00BD40",
   },
   warning: {
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
      "50": "#FFE8E8",
      "100": "#FFD0D0",
      "200": "#FFB9B9",
      "300": "#FFA2A2",
      "400": "#FF7373",
      "500": "#FF4545",
      "600": "#FF1616",
      "700": "#E61414",
   },
   info: {
      "50": "#EBF1FC",
      "100": "#D8E2F9",
      "200": "#C4D4F6",
      "300": "#B0C6F3",
      "400": "#89A9EE",
      "500": "#618DE8",
      "600": "#3A70E2",
      "700": "#3465CB",
   },
   text: {
      disabled: "#CACACA", // disabled text color
      primary: "#1F1F23", // main text color
      secondary: "#5C5C6A", // secondary lighter text color
   },
   common,
   action: {
      disabled: "#CACACA", // disabled background color
      disabledBackground: "#F6F6FA", // disabled background color
   },
} satisfies PaletteOptions

const breakpoints = {
   values: {
      // default
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      // added
      mobile: 0,
      tablet: 690,
      desktop: 1024,
   },
} satisfies ThemeOptions["breakpoints"]

const desktop = createTheme({
   brand,
   breakpoints,
}).breakpoints.up("desktop")

const h5 = {
   fontSize: "",
   lineHeight: "150%",
   [desktop]: {
      fontSize: "1.125rem",
   },
} satisfies React.CSSProperties

const h4 = {
   fontSize: "1.25rem",
   lineHeight: "150%",
   fontWeight: 800,
   [desktop]: {
      fontSize: "1.25rem",
   },
} satisfies React.CSSProperties

const textMedium = {
   fontSize: "1rem",
   lineHeight: "168.75%",
   [desktop]: {},
} satisfies React.CSSProperties

const textSmall = {
   fontSize: "0.875rem",
   lineHeight: "171.429%",
   [desktop]: {},
} satisfies React.CSSProperties

const typography = {
   h1: {
      fontSize: "1.75rem", // 28px
      lineHeight: "150%",
      [desktop]: {
         fontSize: "2.375rem", // 38px
      },
   },
   h2: {
      fontSize: "1.5rem", // 24px
      lineHeight: "150%",
      [desktop]: {
         fontSize: "2rem", // 32px
      },
   },
   h3: {
      fontSize: "1.5rem", // 24px
      lineHeight: "150%",
      [desktop]: {
         fontSize: "1.5rem", // 24px
      },
   },
   h4,
   h5,
   h6: {},
   medium: textMedium,
   small: {
      fontSize: "0.875rem", // 14px
      lineHeight: "171.429%",
      [desktop]: {},
   },
   xsmall: {
      fontSize: "0.75rem", // 12px
      lineHeight: "100%",
      // lineHeight: "150%",
      [desktop]: {},
   },
   subtitle1: h4,
   subtitle2: h5,
   body1: textMedium,
   body2: textSmall,
   button: {},
   caption: {},
   overline: {},
   title1: {
      fontSize: 24,
      fontWeight: 700,
   },
   title2: {
      fontSize: 22,
      fontWeight: 700,
   },
   fontWeightBold: 700,
   fontWeightMedium: 600,
   fontWeightRegular: 400,
   fontWeightLight: 300,
   fontSize: 16,
   htmlFontSize: 16,
} satisfies ThemeOptions["typography"]

export const themeOptions: ThemeOptions = {
   // example of custom theme property
   brand,

   // Palette
   palette,

   // Typography
   typography,

   // Breakpoints
   breakpoints,

   // Rounded corners
   shape: {
      borderRadius: 12,
   },

   mixins: {
      toolbar: {
         minHeight: 77,
         "@media (min-width:0px)": {
            "@media (orientation: landscape)": {
               minHeight: 48,
            },
         },
         [`@media (min-width:${breakpoints.values.tablet}px)`]: {
            minHeight: 108,
         },
      },
   },

   // Components
   components: {
      MuiButtonBase: {
         defaultProps: {},
      },
      MuiButton: {
         variants: [
            {
               props: { size: "small" },
               style: {
                  fontSize: "0.875rem", // 12px
                  padding: "0.75rem 1rem", // 12px 16px
                  lineHeight: "57.5%",
                  height: 32,
                  "& svg": {
                     width: 14,
                     height: 14,
                     fontSize: 14,
                  },
               },
            },
            {
               props: { size: "medium" },
               style: {
                  fontSize: "1rem", // 14px
                  padding: "0.75rem 1.5rem", // 14px 24px
                  lineHeight: "100%",
                  height: 40,
                  "& svg": {
                     width: 18,
                     height: 18,
                     fontSize: 18,
                  },
               },
            },
            {
               props: { size: "large" },
               style: {
                  fontSize: "1.125rem", // 16px
                  padding: "0.75rem 1.75rem", // 12px 28px
                  lineHeight: "135%",
                  height: 48,
                  "& svg": {
                     width: 18,
                     height: 18,
                     fontSize: 18,
                  },
               },
            },
            {
               props: { variant: "outlined", color: "secondary" },
               style: {
                  backgroundColor: brand.white[300],
               },
            },
            {
               props: { variant: "outlined", color: "primary" },
               style: {
                  backgroundColor: brand.white[200],
               },
            },
         ],
         styleOverrides: {
            root: {
               borderRadius: 100,
               textTransform: "none",
               fontSize: "1rem",
               fontWeight: 400,
            },
         },
         defaultProps: {
            disableElevation: true,
         },
      },
      MuiBadge: {
         styleOverrides: {
            badge: {},
         },
      },
   },
}
