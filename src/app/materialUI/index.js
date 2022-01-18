import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

export const rootThemeObj = {
   palette: {
      primary: {
         light: "#89c2ba",
         main: "#00d2aa",
         dark: "#00b08f",
         contrastText: "#FFFFFF",
         gradient: "#07c1a7",
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
         light: "#FFFFFF",
         main: "#00d2aa",
         contrastText: "#FFFFFF",
         dark: "#00b08f",
      },
   },
   components: {
      // Name of the component
      MuiButton: {
         styleOverrides: {
            // Name of the slot
            root: {
               // Some CSS
               fontWeight: 600,
            },
         },
      },
      MuiChip: {
         styleOverrides: {
            label: {
               fontWeight: 500,
               fontSize: "1rem",
            },
            root: {
               margin: "0.5em",
               marginLeft: 0,
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
      MuiTypography: {
         defaultProps: {
            fontFamily: "Poppins,sans-serif",
         },
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
};

export const getTheme = (mode, rootThemeObj) => ({
   ...rootThemeObj,
   palette: {
      ...rootThemeObj.palette,
      mode,
      ...(mode === "light"
         ? {
              // palette values for light mode
              background: {
                 ...rootThemeObj.palette.background,
                 level1: "#212121",
                 level2: "#333",
                 offWhite: "#F5F5F5",
                 default: "#F5F5F5",
                 paper: "#fff",
              },
           }
         : {
              // palette values for dark mode
              background: {
                 ...rootThemeObj.palette.background,
                 level1: "#212121",
                 level2: "#424242",
                 offWhite: "#FAFAFA",
                 default: "#1E1E1E",
                 paper: "#424242",
              },
           }),
   },
});

export const brandedLightTheme = createTheme(getTheme("light", rootThemeObj));

export const brandedDarkTheme = createTheme(getTheme("dark", rootThemeObj));
