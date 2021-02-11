import React, {createContext, useContext, useState} from "react";
import {baseThemeObj, darkThemeObj} from "../../materialUI";
import {createMuiTheme, responsiveFontSizes, ThemeProvider, makeStyles} from '@material-ui/core/styles';
import {SnackbarProvider} from "notistack";

const ThemeContext = createContext();

const ThemeProviderWrapper = ({children}) => {
    const [themeMode, setThemeMode] = useState("dark");

    const toggleTheme = () => {
        setThemeMode(themeMode === "light" ? "dark" : "light")
    }

    const themeObj = themeMode === "light" ? baseThemeObj : darkThemeObj

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
