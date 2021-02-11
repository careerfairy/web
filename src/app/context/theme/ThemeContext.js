import React, {createContext, useContext, useState} from "react";
import {baseThemeObj, darkThemeObj} from "../../materialUI";
import {createMuiTheme, responsiveFontSizes, ThemeProvider, makeStyles} from '@material-ui/core/styles';
import {SnackbarProvider} from "notistack";
import {useRouter} from "next/router";

const ThemeContext = createContext();
const pathsReadyForDarkMode = [
    "/streaming/[livestreamId]/joining-streamer",
    "/streaming/[livestreamId]/main-streamer",
    "/streaming/[livestreamId]/viewer"
];
const ThemeProviderWrapper = ({children}) => {
    const {pathname} = useRouter()

    const [themeMode, setThemeMode] = useState("light");

    const toggleTheme = () => {
        setThemeMode(themeMode === "light" ? "dark" : "light")
    }
    const getThemeObj = () => {
        let theme = baseThemeObj
        if (pathsReadyForDarkMode.includes(pathname)) {
            theme = themeMode === "light" ? baseThemeObj : darkThemeObj
        }
        return theme
    }

    const themeObj = getThemeObj()

    themeObj.palette.type = themeMode

    const createdTheme = createMuiTheme(themeObj);
    const theme = responsiveFontSizes(createdTheme)
    const useStyles = makeStyles(({
        // success: {backgroundColor: 'purple'},
        // error: {backgroundColor: 'blue'},
        // warning: {backgroundColor: 'green'},
        info: {
            backgroundColor: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
        },
    }));
    const classes = useStyles()

    return (
        <ThemeContext.Provider value={{toggleTheme, themeMode}}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider
                    classes={{
                        variantInfo: classes.info
                    }}
                    maxSnack={3}>
                    {children}
                </SnackbarProvider>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

const useThemeToggle = () => useContext(ThemeContext);

export {ThemeProviderWrapper, useThemeToggle};
