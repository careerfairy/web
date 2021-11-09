import PropTypes from "prop-types";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   FormHelperText,
   TextField,
   Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   errorButton: {
      background: theme.palette.error.main,
      color: theme.palette.error.contrastText,
   },
   securityTextPaper: {
      // padding: theme.spacing(2),
   },
   noSelect: {
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      KhtmlUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",
      marginBottom: theme.spacing(1),
   },
}));
const AreYouSureModal = ({
   title = "Are you sure?",
   message,
   handleConfirm,
   open,
   handleClose,
   loading,
   confirmButtonText,
   confirmSecurityText,
}) => {
   const classes = useStyles();
   const [repeatSecurityText, setRepeatSecurityText] = useState("");
   const [fieldError, setFieldError] = useState("");

   const handleSecureConfirm = () => {
      if (confirmSecurityText && confirmSecurityText !== repeatSecurityText) {
         return setFieldError("The text does not match");
      }
      setRepeatSecurityText("");
      handleConfirm();
   };

   const onClose = () => {
      setRepeatSecurityText("");
      handleClose();
   };

   return (
      <div>
         <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
         >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
               <DialogContentText id="alert-dialog-description">
                  {message}
               </DialogContentText>
               {confirmSecurityText && (
                  <div className={classes.securityTextPaper}>
                     <Typography
                        className={classes.noSelect}
                        variant="subtitle1"
                        gutterBottom
                     >
                        {confirmSecurityText}
                     </Typography>
                     <TextField
                        onChange={(e) => {
                           if (fieldError) setFieldError("");
                           setRepeatSecurityText(e.currentTarget.value);
                        }}
                        fullWidth
                        label="Please type the message above to confirm"
                        variant="outlined"
                        error={Boolean(fieldError)}
                        value={repeatSecurityText}
                        type="text"
                        disabled={loading}
                     />
                     <FormHelperText error>{fieldError}</FormHelperText>
                  </div>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Cancel</Button>
               <Button
                  disabled={loading}
                  endIcon={
                     loading && <CircularProgress color="inherit" size={20} />
                  }
                  onClick={handleSecureConfirm}
                  variant="contained"
                  color="primary"
               >
                  {confirmButtonText || "Confirm"}
               </Button>
            </DialogActions>
         </Dialog>
      </div>
   );
};

AreYouSureModal.propTypes = {
   handleClose: PropTypes.func.isRequired,
   handleConfirm: PropTypes.func.isRequired,
   loading: PropTypes.bool,
   message: PropTypes.string,
   open: PropTypes.bool.isRequired,
   title: PropTypes.string,
   confirmSecurityText: PropTypes.string,
};

AreYouSureModal.defaultProps = {
   title: "Are you sure?",
};
export default AreYouSureModal;
