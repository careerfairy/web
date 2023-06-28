import React, {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { brandedDarkTheme, brandedLightTheme } from "../../materialUI"
import { responsiveFontSizes, ThemeProvider } from "@mui/material/styles"
import { SnackbarProvider } from "notistack"
import { useRouter } from "next/router"
import { CssBaseline, PaletteMode } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { dataLayerEvent } from "../../util/analyticsUtils"
import { DefaultTheme } from "@mui/styles"

type ThemeContextType = {
   toggleTheme: () => void
   themeMode: PaletteMode
}

const ThemeContext = createContext<ThemeContextType>({
   toggleTheme: () => {},
   themeMode: "light",
})

const pathsReadyForDarkMode = [
   "/streaming/[livestreamId]/joining-streamer",
   "/streaming/[livestreamId]/main-streamer",
   "/streaming/[livestreamId]/viewer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/joining-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/main-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/viewer",
   // "/group/[groupId]/admin/analytics",
]

const initialTheme = responsiveFontSizes(brandedLightTheme)

const ThemeProviderWrapper = ({
   children,
   overrideTheme,
}: {
   children: ReactNode
   overrideTheme?: DefaultTheme
}) => {
   const { pathname } = useRouter()

   const [theme, setTheme] = useState(overrideTheme ?? initialTheme)

   // set theme for certain paths based on local storage
   useEffect(() => {
      if (!overrideTheme) {
         let newThemeObj = { ...brandedLightTheme }
         if (pathsReadyForDarkMode.includes(pathname)) {
            const cachedThemeMode = localStorage.getItem("themeMode")
            if (cachedThemeMode === "dark" || cachedThemeMode === "light") {
               if (cachedThemeMode === "dark") {
                  newThemeObj = brandedDarkTheme
               } else {
                  newThemeObj = brandedLightTheme
               }
            }
         }

         setTheme(responsiveFontSizes(newThemeObj))
      }
   }, [pathname, overrideTheme])

   const toggleTheme = useCallback(() => {
      const newTheme =
         theme.palette.mode === "dark" ? brandedLightTheme : brandedDarkTheme

      localStorage.setItem("themeMode", newTheme.palette.mode)
      setTheme(responsiveFontSizes(newTheme))
      dataLayerEvent("toggle_theme")
   }, [theme])

   const useStyles = makeStyles({
      info: {
         backgroundColor: `${theme.palette.background.paper} !important`,
         color: `${theme.palette.text.primary} !important`,
      },
   })

   const classes = useStyles()

   if (pathname === "/next-livestreams/embed") {
      theme.palette.background.default = "transparent"
   }

   const ctxValue = useMemo(
      () => ({ toggleTheme, themeMode: theme.palette.mode }),
      [theme.palette.mode, toggleTheme]
   )

   return (
      <ThemeContext.Provider value={ctxValue}>
         <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <SnackbarProvider
               classes={{ variantInfo: classes.info }}
               maxSnack={5}
            >
               {children}
            </SnackbarProvider>
         </ThemeProvider>
      </ThemeContext.Provider>
   )
}

const useThemeToggle = () => useContext(ThemeContext)

export { ThemeProviderWrapper, useThemeToggle }
