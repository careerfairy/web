import {createMuiTheme, responsiveFontSizes} from "@material-ui/core/styles";

let baseTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#00d2aa",
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
      },
      root: {
        margin: "0.5em",
        marginLeft: 0,
      }
    },
    MuiInputBase: {
      root:{
        backgroundColor: "white"
      }
    },
  },

  typography: {
    fontFamily: "Poppins,sans-serif",
  }
});


export const theme = responsiveFontSizes(baseTheme);
