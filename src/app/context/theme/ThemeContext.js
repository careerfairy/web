import React, {createContext, useContext, useEffect, useState} from "react";
import {baseThemeObj, darkThemeObj} from "../../materialUI";
import {createMuiTheme, responsiveFontSizes, ThemeProvider, makeStyles} from '@material-ui/core/styles';
import {SnackbarProvider} from "notistack";
import {useRouter} from "next/router";

const ThemeContext = createContext();
const pathsReadyForDarkMode = [
    "/streaming/[livestreamId]/joining-streamer",
    "/streaming/[livestreamId]/main-streamer",
    "/streaming/[livestreamId]/viewer",
    "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/joining-streamer",
    "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/main-streamer",
    "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/viewer"
];

const initialTheme = responsiveFontSizes(createMuiTheme(baseThemeObj))

const ThemeProviderWrapper = ({children}) => {
    const {pathname} = useRouter()

    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        getThemeObj()
    }, [pathname])

    const toggleTheme = () => {
        const newThemeObj = theme.palette.type === "dark" ? baseThemeObj : darkThemeObj
        localStorage.setItem("themeMode", newThemeObj.palette.type)
        const createdTheme = createMuiTheme(newThemeObj);
        setTheme(responsiveFontSizes(createdTheme))
    }

    const getThemeObj = () => {
        let newThemeObj = {...baseThemeObj}
        if (pathsReadyForDarkMode.includes(pathname)) {
            const cachedThemeMode = localStorage.getItem("themeMode")
            if (cachedThemeMode === "dark" || cachedThemeMode === "light") {
                if (cachedThemeMode === "dark") {
                    newThemeObj = darkThemeObj
                } else {
                    newThemeObj = baseThemeObj
                }
            }
        }

        const createdTheme = createMuiTheme(newThemeObj);
        setTheme(responsiveFontSizes(createdTheme))
    }


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
        <ThemeContext.Provider value={{toggleTheme, themeMode: theme.palette.type}}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider
                    classes={{
                        variantInfo: classes.info
                    }}
                    maxSnack={5}>
                    {children}
                </SnackbarProvider>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

const useThemeToggle = () => useContext(ThemeContext);

export {ThemeProviderWrapper, useThemeToggle};
