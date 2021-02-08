export const baseThemeObj = {
    palette: {
        primary: {
            main: "#00d2aa",
            dark: "#00b08f",
            contrastText: "#FFFFFF"
        },
        secondary: {
            main: "#fa0087",
            dark: "#be0066",
            contrastText: "#FFFFFF"
        },

        error: {
            main: "#e70026",
            dark: "#b00024",
            contrastText: "#FFFFFF"
        },
        navyBlue: {
            main: "#2C4251",
            contrastText: "#FFFFFF"
        },
        info: {
            light: "#FFFFFF",
            main: "#00d2aa",
            contrastText: "#FFFFFF",
            dark: "#00b08f",
        },
        type: "dark"
    },
    overrides: {
        MuiButton: {
            root: {
                fontWeight: 600
            }
        },
        MuiChip: {
            label: {
                fontWeight: 500,
                fontSize: "1rem",
            },
            root: {
                margin: "0.5em",
                marginLeft: 0,
            }
        },
        MuiSnackbar: {}
    },
    breakpoints: {
        values: {
            lg: 1280,
            md: 960,
            sm: 600,
            mobile: 768,
            xl: 1920,
            xs: 0,
        },
        keys: ["xs", "sm", "mobile", "md", "lg", "xl"]
    },

    typography: {
        fontFamily: "Poppins,sans-serif",
    },
    whiteShadow: "0 12px 20px -10px rgb(255 255 255 / 28%), 0 4px 20px 0 rgb(0 0 0 / 12%), 0 7px 8px -5px rgb(255 255 255 / 20%)"
}

