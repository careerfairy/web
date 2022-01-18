import React, { createContext, useContext, useEffect, useState } from "react";
import { brandedDarkTheme, brandedLightTheme } from "../../materialUI";
import {
   responsiveFontSizes,
   ThemeProvider,
   StyledEngineProvider,
} from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { useRouter } from "next/router";
import { CssBaseline } from "@mui/material";

// import { Button } from "@mui/material";

const ThemeContext = createContext();
const pathsReadyForDarkMode = [
   "/streaming/[livestreamId]/joining-streamer",
   "/streaming/[livestreamId]/main-streamer",
   "/streaming/[livestreamId]/viewer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/joining-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/main-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/viewer",
   // "/group/[groupId]/admin/analytics",
];

const initialTheme = responsiveFontSizes(brandedLightTheme);

const ThemeProviderWrapper = ({ children }) => {
   const { pathname } = useRouter();

   const [theme, setTheme] = useState(initialTheme);

   useEffect(() => {
      getThemeObj();
   }, [pathname]);

   const toggleTheme = () => {
      const newTheme =
         theme.palette.mode === "dark" ? brandedLightTheme : brandedDarkTheme;

      localStorage.setItem("themeMode", newTheme.palette.mode);
      setTheme(responsiveFontSizes(newTheme));
   };

   const getThemeObj = () => {
      let newThemeObj = { ...brandedLightTheme };
      if (pathsReadyForDarkMode.includes(pathname)) {
         const cachedThemeMode = localStorage.getItem("themeMode");
         if (cachedThemeMode === "dark" || cachedThemeMode === "light") {
            if (cachedThemeMode === "dark") {
               newThemeObj = brandedDarkTheme;
            } else {
               newThemeObj = brandedLightTheme;
            }
         }
      }

      setTheme(responsiveFontSizes(newThemeObj));
   };

   return (
      <ThemeContext.Provider
         value={{ toggleTheme, themeMode: theme.palette.mode }}
      >
         <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
               {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
               <CssBaseline />
               <SnackbarProvider maxSnack={5}>
                  {children}
                  {/*<Button*/}
                  {/*   color="secondary"*/}
                  {/*   onClick={toggleTheme}*/}
                  {/*   variant="contained"*/}
                  {/*   style={{ position: "fixed", bottom: "5%", right: "5%" }}*/}
                  {/*>*/}
                  {/*   toggle*/}
                  {/*</Button>*/}
               </SnackbarProvider>
            </ThemeProvider>
         </StyledEngineProvider>
      </ThemeContext.Provider>
   );
};

const useThemeToggle = () => useContext(ThemeContext);

export { ThemeProviderWrapper, useThemeToggle };
