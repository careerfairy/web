// import { deepmerge } from "@mui/utils";
// it could be your App.tsx file or theme file that is included in your tsconfig.json
import {
   alpha,
   createTheme,
   darken,
   lighten,
   PaletteColorOptions,
   styled,
   Theme,
} from "@mui/material/styles"
import { grey, red } from "@mui/material/colors"

import { Components, PaletteMode } from "@mui/material"
import { DefaultTheme } from "@mui/styles"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

interface CustomThemeProps {
   drawerWidth?: { small: string; medium: string }
   boxShadows?: {
      // color_y_blur_opacity
      dark_8_25_10?: string
      dark_15_60_15?: string
      secondary_5_15_50?: string
      grey_5_15?: string
      primary_5_15_50?: string
      dark_12_13?: string
      gold_5_15_50?: string
      error_5_15_50?: string
   }
   dropShadows?: {
      // color_y_blur_opacity
      dark_6_12_12?: string
   }
   darkTextShadow?: string
   whiteShadow?: string
}
declare module "@mui/styles/defaultTheme" {
   interface DefaultTheme extends Theme, CustomThemeProps {}
}

declare module "@mui/material/Button" {
   interface ButtonPropsColorOverrides {
      grey: true
      gold: true
      black: true
      navyBlue: true
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
   interface ThemeOptions extends CustomThemeProps {}

   interface PaletteColor {
      gradient?: string
   }

   interface SimplePaletteColorOptions {
      gradient?: string
   }

   interface Palette {
      navyBlue: PaletteColor
      gold: PaletteColor
      black: PaletteColor
      tertiary: PaletteColor
   }

   interface PaletteOptions {
      navyBlue: PaletteColorOptions
      gold: PaletteColorOptions
      black: PaletteColorOptions
      tertiary: PaletteColorOptions
   }

   interface BreakpointOverrides {
      mobile: true // adds the `mobile` breakpoint
      sparksFullscreen: true // adds the breakpoint for the sparks feed
   }
}

const secondary: PaletteColorOptions = {
   light: lighten("#6749EA", 0.2),
   main: "#6749EA",
   dark: darken("#6749EA", 0.2),
   gradient: "#644eec",
   contrastText: "#FFFFFF",
}
const primary: PaletteColorOptions = {
   light: "#89c2ba",
   main: "#00d2aa",
   dark: "#00b08f",
   contrastText: "#FFFFFF",
   gradient: "#07c1a7",
   "600": "#2ABAA5",
}

const tertiary: PaletteColorOptions = {
   main: "#FAEDF2",
   light: "rgb(251, 240, 244)",
   dark: "rgb(175, 165, 169)",
   contrastText: "rgba(0, 0, 0, 0.87)",
   gradient: "#f5f5f5",
}

const gold: PaletteColorOptions = {
   main: "#FFC34F",
   contrastText: "#FFFFFF",
   dark: "#FFC34F",
   light: "#FFC34F",
}

const blackColors: PaletteColorOptions = {
   main: tertiary.contrastText,
   contrastText: primary.main,
   dark: tertiary.contrastText,
   light: tertiary.contrastText,
}

const black = "#000000"
const white = "#FFFFFF"

export const rootThemeObj = (mode: PaletteMode): DefaultTheme =>
   createTheme({
      transitions: {
         duration: {
            complex: 700,
         },
      },
      // shape: {
      // borderRadius: 20,
      // },
      palette: {
         mode,
         common: {
            black,
            white,
         },
         success: {
            main: "#09D24D",
         },
         primary: primary,
         grey: {
            main: grey[300],
            dark: grey[400],
         },
         secondary,
         tertiary,
         error: {
            main: "#e70026",
            dark: "#b00024",
            contrastText: "#FFFFFF",
         },
         navyBlue: {
            main: "#2C4251",
            contrastText: "#FFFFFF",
         },
         gold,
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
         black: blackColors,
      },
      breakpoints: {
         values: {
            xl: 1920,
            lg: 1280,
            sparksFullscreen: 989,
            md: 900,
            mobile: 768,
            sm: 600,
            xs: 0,
         },
         keys: ["xs", "sm", "mobile", "md", "sparksFullscreen", "lg", "xl"],
      },
      typography: {
         fontFamily: "Poppins,sans-serif",
         htmlFontSize: 16,
      },
      whiteShadow:
         "0 12px 20px -10px rgb(255 255 255 / 28%), 0 4px 20px 0 rgb(0 0 0 / 12%), 0 7px 8px -5px rgb(255 255 255 / 20%)",
      boxShadows: {
         dark_8_25_10: `0px 8px 25px rgba(33, 32, 32, 0.1)`,
         dark_12_13: `0px 12px 13px ${alpha(black, 0.12)}`,
         grey_5_15: `0px 5px 15px ${alpha(
            grey[400],
            mode === "light" ? 1 : 0.4
         )}`,
         secondary_5_15_50: `0px 5px 15px ${alpha(
            mode === "light" ? secondary.main : secondary.dark,
            mode === "light" ? 0.5 : 0.2
         )}`,
         primary_5_15_50: `0px 5px 15px ${alpha(
            mode === "light" ? primary.main : primary.dark,
            mode === "light" ? 0.5 : 0.2
         )}`,
         gold_5_15_50: `0px 5px 15px ${alpha(
            mode === "light" ? gold.main : gold.dark,
            mode === "light" ? 0.5 : 0.2
         )}`,
         error_5_15_50: `0px 5px 15px ${alpha(
            mode === "light" ? red[500] : red[700],
            mode === "light" ? 0.5 : 0.2
         )}`,
      },
      dropShadows: {
         dark_6_12_12: "drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.12))",
      },
      drawerWidth: { small: "256px", medium: "300px" },
      darkTextShadow:
         "0px 3px 3px rgba(0,0,0,0.4)," +
         "0px 8px 13px rgba(0,0,0,0.1)," +
         "0px 18px 23px rgba(0,0,0,0.1);",
   })

const getComponents = (theme: DefaultTheme): Components => ({
   // Name of the component
   MuiDialog: {
      // Name of the style
      styleOverrides: {
         paper: {
            borderRadius: 20,
            boxShadow: "none",
            filter: theme.boxShadows.dark_15_60_15,
         },
         paperFullScreen: {
            borderRadius: 0,
         },
         root: {
            "& .MuiBackdrop-root": {
               backgroundColor: alpha(theme.palette.common.black, 0.2),
            },
         },
      },
   },
   MuiPaper: {
      styleOverrides: {
         root: {
            // borderRadius: 0,
         },
      },
   },
   MuiOutlinedInput: {
      styleOverrides: {
         root: {
            borderRadius: 8,
         },
      },
   },
   MuiTextField: {
      styleOverrides: {
         root: {
            "&.registrationInput": {
               backgroundColor: white,
               boxShadow: theme.boxShadows.grey_5_15,
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
                  border: 0,
               },
               "& .Mui-focused fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.primary.main,
               },
               "& .Mui-error fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.error.main,
               },
            },
            "&.streamFormInput": {
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
               },
               "& .Mui-focused fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.secondary.main,
               },
               "& .Mui-error fieldset": {
                  border: "2px solid",
                  borderColor: theme.palette.error.main,
               },
            },
            "&.multiLineInput": {
               "& fieldset": {
                  minHeight: "100px",
                  textAlign: "start",
               },
            },
         },
      },
   },
   MuiFormControl: {
      styleOverrides: {
         root: {
            ".registrationDropdown": {
               backgroundColor: white,
               boxShadow: theme.boxShadows.grey_5_15,
               borderRadius: "8px",

               "& fieldset": {
                  borderRadius: "8px",
                  border: 0,
               },
            },

            "&.marketingForm": {
               borderRadius: "8px",

               "& input": {
                  color: "white",
               },
               "& label": {
                  color: "white",
               },
               "& fieldset": {
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "white",
               },
               "& svg": {
                  color: "white",
               },
               "& div": {
                  color: "white",
               },
            },

            "& .Mui-focused fieldset": {
               border: "2px solid",
               borderColor: theme.palette.primary.main,
            },
            "& .Mui-error fieldset": {
               border: "2px solid",
               borderColor: theme.palette.error.main,
            },
         },
      },
   },
   MuiButtonGroup: {
      styleOverrides: {
         // Name of the slot
         root: {
            // Some CSS
            borderRadius: 30,
         },
      },
      variants: [
         {
            props: {
               variant: "contained",
            },
            style: {
               boxShadow: theme.boxShadows.grey_5_15,
            },
         },
         {
            props: {
               variant: "contained",
               color: "primary",
            },
            style: {
               boxShadow: theme.boxShadows.primary_5_15_50,
            },
         },
         {
            props: {
               variant: "contained",
               color: "secondary",
            },
            style: {
               boxShadow: theme.boxShadows.secondary_5_15_50,
            },
         },
      ],
   },
   MuiButton: {
      styleOverrides: {
         // Name of the slot
         root: {
            // Some CSS
            fontWeight: 600,
            padding: "1em 2em",
            borderRadius: 30,
         },
      },
      defaultProps: {
         disableElevation: true,
      },
      variants: [
         {
            props: {
               variant: "contained",
               color: "grey",
            },
            style: {
               boxShadow: theme.boxShadows.grey_5_15,
            },
         },
         {
            props: { variant: "contained", color: "grey" },
            style: {
               boxShadow: theme.boxShadows.grey_5_15,
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
         {
            props: { color: "gold", variant: "contained" },
            style: {
               color: theme.palette.text.primary,
               backgroundColor: theme.palette.gold.main,
               boxShadow: theme.boxShadows.gold_5_15_50,
            },
         },
         {
            props: { color: "error", variant: "contained" },
            style: {
               boxShadow: theme.boxShadows.error_5_15_50,
            },
         },

         {
            props: { color: "black", variant: "contained" },
            style: {
               boxShadow: "none",
               backgroundColor: theme.palette.text.primary,
               color: theme.palette.primary.main,
            },
         },
         {
            props: { color: "navyBlue", variant: "contained" },
            style: {
               boxShadow: "none",
               backgroundColor: theme.palette.navyBlue.main,
               color: "#D5F6F1",
            },
         },
         {
            props: {
               size: "medium",
            },
            style: {
               fontSize: "16px",
               fontWeight: 400,
               padding: "8px 24px",
            },
         },
         {
            props: {
               size: "small",
            },
            style: {
               padding: "8px 16px",
               fontWeight: 400,
               fontSize: "1rem",
               letterSpacing: "-0.011rem",
               lineHeight: "150%",
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
         root: ({ stacked }) => ({
            ...(stacked && {
               margin: "0.5em 0.5em 0 0",
               // marginLeft: 0,
            }),
            "&.stacked": {
               margin: "0.5em 0.5em 0 0",
            },
         }),
      },
   },
   MuiTooltip: {
      styleOverrides: {
         tooltip: {
            fontSize: "1rem",
         },
      },
   },
   MuiCard: {
      styleOverrides: {
         root: {
            borderRadius: 10,
            boxShadow: theme.boxShadows.dark_8_25_10,
         },
      },
      variants: [
         {
            props: {
               elevation: 0,
            },
            style: {
               boxShadow: "none",
            },
         },
      ],
   },
   MuiPopover: {
      styleOverrides: {
         paper: {
            filter: theme.dropShadows.dark_6_12_12,
            boxShadow: "none",
            borderRadius: 8,
         },
      },
   },
   MuiFab: {
      styleOverrides: {
         root: {
            filter: theme.dropShadows.dark_6_12_12,
            boxShadow: "none",
         },
      },
   },
   MuiSelect: {
      defaultProps: {
         IconComponent: KeyboardArrowDownRoundedIcon, // You can replace this with the icon you prefer
      },
   },
})

export const getTheme = (rootThemeObj: DefaultTheme) => {
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
   }) as DefaultTheme

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

export const HeaderLogoWrapper = styled("div")({
   padding: "0 24px 0 24px",
})
