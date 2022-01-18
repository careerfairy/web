import React from "react";
import {
   Slide,
   Snackbar,
   SnackbarContent,
   IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
   close: {
      padding: theme.spacing(0.5),
   },
}));

function TransitionRight(props) {
   return <Slide {...props} direction="right" />;
}

const ErrorSnackBar = ({ errorMessage, handleClose }) => {
   const classes = useStyles();
   return (
      <Snackbar
         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
         open={Boolean(errorMessage.length)}
         onClose={handleClose}
         autoHideDuration={6000}
         TransitionComponent={TransitionRight}
         key={errorMessage}
      >
         <SnackbarContent
            style={{ backgroundColor: "red", fontSize: "1rem" }}
            message={errorMessage}
            action={
               <IconButton
                  aria-label="close"
                  color="inherit"
                  className={classes.close}
                  onClick={handleClose}
                  size="large">
                  <CloseIcon />
               </IconButton>
            }
         />
      </Snackbar>
   );
};

export default ErrorSnackBar;
