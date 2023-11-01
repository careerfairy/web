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
