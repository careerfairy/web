import {createMuiTheme, responsiveFontSizes} from "@material-ui/core/styles";

let baseTheme = createMuiTheme({
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
        info: {
            light: "#FFFFFF",
            main: "#00d2aa",
            contrastText: "#FFFFFF",
            dark: "#00b08f",
        }
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
        MuiSnackbar:{

        }
    },

    typography: {
        fontFamily: "Poppins,sans-serif",
    }
});


export const theme = responsiveFontSizes(baseTheme);
