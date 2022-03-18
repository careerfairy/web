// import { deepmerge } from "@mui/utils";
// it could be your App.tsx file or theme file that is included in your tsconfig.json
import { alpha, createTheme, Theme } from "@mui/material/styles"
import { grey } from "@mui/material/colors"

import React from "react"
import { PaletteMode } from "@mui/material"

declare module "@mui/styles/defaultTheme" {
   // eslint-disable-next-line @typescript-eslint/no-empty-interface (remove this line if you don't have the rule enabled)
   interface DefaultTheme extends Theme {}
}

declare module "@mui/material/Button" {
   interface ButtonPropsColorOverrides {
      grey: true
   }
}

declare module "@mui/material" {
   interface Color {
      main: string
      dark: string
   }
   interface Transition {
      long: number
   }
}

declare module "@mui/material/styles" {
   interface ThemeOptions {
      whiteShadow?: string
      drawerWidth?: { small?: string; medium?: string }
      darkTextShadow?: string
   }
   interface PaletteColor {
      gradient?: string
   }
   interface SimplePaletteColorOptions {
      gradient?: string
   }

   interface Palette {
      navyBlue: Palette["primary"]
   }
   interface PaletteOptions {
      navyBlue: PaletteOptions["primary"]
   }
   interface BreakpointOverrides {
      mobile: true // adds the `mobile` breakpoint
   }
}

export const rootThemeObj = (mode: PaletteMode) =>
   createTheme({
      transitions: {
         duration: {
            complex: 700,
         },
      },
      palette: {
         mode,
         primary: {
            light: "#89c2ba",
            main: "#00d2aa",
            dark: "#00b08f",
            contrastText: "#FFFFFF",
            gradient: "#07c1a7",
         },
         grey: {
            main: grey[300],
            dark: grey[400],
         },
         secondary: {
            light: "#b4a8ff",
            main: "#7431e2",
            dark: "#590db6",
            gradient: "#644eec",
            contrastText: "#FFFFFF",
         },
         error: {
            main: "#e70026",
            dark: "#b00024",
            contrastText: "#FFFFFF",
         },
         navyBlue: {
            main: "#2C4251",
            contrastText: "#FFFFFF",
         },
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
      },
      breakpoints: {
         values: {
            xl: 1920,
            lg: 1280,
            md: 900,
            mobile: 768,
            sm: 600,
            xs: 0,
         },
         keys: ["xs", "sm", "mobile", "md", "lg", "xl"],
      },
      typography: {
         fontFamily: "Poppins,sans-serif",
         htmlFontSize: 16,
      },
      whiteShadow:
         "0 12px 20px -10px rgb(255 255 255 / 28%), 0 4px 20px 0 rgb(0 0 0 / 12%), 0 7px 8px -5px rgb(255 255 255 / 20%)",
      drawerWidth: { small: "256px", medium: "300px" },
      darkTextShadow:
         "0px 3px 3px rgba(0,0,0,0.4)," +
         "0px 8px 13px rgba(0,0,0,0.1)," +
         "0px 18px 23px rgba(0,0,0,0.1);",
   })

const getComponents = (theme: Theme) => ({
   // Name of the component
   MuiButton: {
      styleOverrides: {
         // Name of the slot
         root: {
            // Some CSS
            fontWeight: 600,
         },
      },
      variants: [
         {
            props: { variant: "contained", color: "grey" },
            style: {
               color: theme.palette.getContrastText(theme.palette.grey[300]),
            },
         },
         {
            props: { variant: "outlined", color: "grey" },
            style: {
               color: theme.palette.text.primary,
               borderColor:
                  theme.palette.mode === "light"
                     ? "rgba(0, 0, 0, 0.23)"
                     : "rgba(255, 255, 255, 0.23)",
               "&.Mui-disabled": {
                  border: `1px solid ${theme.palette.action.disabledBackground}`,
               },
               "&:hover": {
                  borderColor:
                     theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.23)"
                        : "rgba(255, 255, 255, 0.23)",
                  backgroundColor: alpha(
                     theme.palette.text.primary,
                     theme.palette.action.hoverOpacity
                  ),
               },
            },
         },
         {
            props: { color: "grey", variant: "text" },
            style: {
               color: theme.palette.text.primary,
               backgroundColor: "transparent",
               "&:hover": {
                  backgroundColor: alpha(
                     theme.palette.text.primary,
                     theme.palette.action.hoverOpacity
                  ),
               },
            },
         },
      ],
   },
   MuiChip: {
      styleOverrides: {
         label: {
            fontWeight: 500,
            fontSize: "1rem",
         },
         root: {
            // margin: "0.5em",
            // marginLeft: 0,
         },
      },
   },
   MuiTooltip: {
      styleOverrides: {
         tooltip: {
            fontSize: "1rem",
         },
      },
   },
})

export const getTheme = (rootThemeObj: Theme) => {
   const themeWithMode = createTheme({
      ...rootThemeObj,
      palette: {
         ...rootThemeObj.palette,
         mode: rootThemeObj.palette.mode,
         ...(rootThemeObj.palette.mode === "light"
            ? {
                 // palette values for light mode
                 background: {
                    ...rootThemeObj.palette.background,
                    default: "#F5F5F5",
                    paper: "#fff",
                 },
              }
            : {
                 // palette values for dark mode
                 background: {
                    ...rootThemeObj.palette.background,
                    default: "#1E1E1E",
                    paper: "#424242",
                 },
              }),
      },
   })

   return {
      ...themeWithMode,
      components: getComponents(themeWithMode),
   }
}

export const brandedLightTheme = createTheme(
   {},
   getTheme(rootThemeObj("light"))
)

export const brandedDarkTheme = createTheme({}, getTheme(rootThemeObj("dark")))
