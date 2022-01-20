import { alpha, createTheme } from "@mui/material/styles";
// import { deepmerge } from "@mui/utils";
import { grey } from "@mui/material/colors";

export const rootThemeObj = (mode) =>
   createTheme({
      palette: {
         mode,
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
         grey: {
            main: grey[300],
            dark: grey[400],
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
   });

const getComponents = (theme) => ({
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
});

export const getTheme = (rootThemeObj) => {
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

   return {
      ...themeWithMode,
      components: getComponents(themeWithMode),
   };
};

export const brandedLightTheme = createTheme(getTheme(rootThemeObj("light")));

export const brandedDarkTheme = createTheme(getTheme(rootThemeObj("dark")));
