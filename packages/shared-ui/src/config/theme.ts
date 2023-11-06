import { colors, createTheme, darken, lighten } from "@mui/material"

const customFontFamily = "'Poppins', sans-serif"
// const customFontFamily = "'Roboto', 'Helvetica', 'Arial', sans-serif"

export const theme = createTheme({
   // Theme
   brand: {
      blue: colors.blue[800],
      green: colors.green[400],
      yellow: "#EECA61",
   },

   // Palette
   palette: {
      secondary: {
         light: lighten("#6749EA", 0.2),
         main: "#6749EA",
         dark: darken("#6749EA", 0.2),
      },
      primary: {
         main: "#2ABAA5",
         light: "#89c2ba",
         dark: "#00b08f",
         contrastText: "#FFFFFF",
      },
      neutral: { main: "#FF5733" },
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
   },

   // Typography
   typography: {
      fontFamily: customFontFamily,

      title1: {
         fontSize: 24,
         fontWeight: 700,
      },
      title2: {
         fontSize: 22,
         fontWeight: 700,
      },
   },

   // Breakpoints
   breakpoints: {
      values: {
         // default
         xs: 0,
         sm: 600,
         md: 900,
         lg: 1200,
         xl: 1536,
         // added
         mobile: 0,
         tablet: 640,
         desktop: 1024,
      },
   },

   // Components
   components: {
      MuiTypography: {
         defaultProps: {
            fontFamily: customFontFamily,
         },
      },

      MuiButtonBase: {
         defaultProps: {
            disableRipple: true,
         },
      },
      MuiButton: {
         styleOverrides: {
            root: {
               textTransform: "none",
            },
         },
         defaultProps: {
            disableElevation: true,
         },
      },
   },
})
