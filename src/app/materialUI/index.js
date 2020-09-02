import {createMuiTheme} from "@material-ui/core/styles";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#00D2AA",
      contrastText: "#FFFFFF"
    },
  },
  overrides: {
    MuiButton: {

    }
  },

  typography: {
    fontFamily: "Poppins,sans-serif",
  }
});