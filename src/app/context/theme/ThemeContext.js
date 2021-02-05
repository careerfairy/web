import React, {createContext, useContext, useState} from "react";
import {baseThemeObj} from "../../materialUI";
import {createMuiTheme, responsiveFontSizes, ThemeProvider} from '@material-ui/core/styles';

const ThemeContext = createContext();

const ThemeProviderWrapper = ({children}) => {
    const [themeMode, setThemeMode] = useState(baseThemeObj.palette.type);

    const toggleTheme = () => {
        setThemeMode(themeMode === "light" ? "dark" : "light")
    }

    baseThemeObj.palette.type = themeMode

    const createdTheme = createMuiTheme(baseThemeObj);
    const theme = responsiveFontSizes(createdTheme)

    return (
        <ThemeContext.Provider value={{toggleTheme, themeMode}}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

const useThemeToggle = () => useContext(ThemeContext);

export {ThemeProviderWrapper, useThemeToggle};
