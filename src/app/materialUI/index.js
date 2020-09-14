import {createMuiTheme, responsiveFontSizes} from "@material-ui/core/styles";

let baseTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#00D2AA",
      contrastText: "#FFFFFF"
    },
  },
  overrides: {
    MuiButton: {

    },
    MuiChip: {
      label: {
        fontWeight: 500,
        fontSize: "1rem",
        textTransform: "lowercase",
      },
      root: {
        margin: "0.5em",
        marginLeft: 0,
      }
    }
  },

  typography: {
    fontFamily: "Poppins,sans-serif",
  }
});


export const theme = responsiveFontSizes(baseTheme);
