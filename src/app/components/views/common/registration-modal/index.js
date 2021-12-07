import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Dialog } from "@material-ui/core";
import { RegistrationContextProvider } from "context/registration/RegistrationContext";
import RegistrationForm from "./RegistrationForm";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const RegistrationModal = ({
   open,
   handleClose,
   withBooking,
   livestream,
   groups,
}) => {
   const classes = useStyles();

   const onClose = () => {
      handleClose();
   };

   return (
      <div className={classes.root}>
         <Dialog
            maxWidth="sm"
            fullWidth
            scroll="paper"
            open={open}
            onClose={onClose}
         >
            <RegistrationContextProvider
               closeModal={onClose}
               livestream={livestream}
               groups={groups}
               withBooking={withBooking}
            >
               <RegistrationForm />
               {/*<DialogTitle></DialogTitle>*/}
               {/*<DialogContent>*/}
               {/*   <DialogContentText></DialogContentText>*/}
               {/*</DialogContent>*/}
               {/*<DialogActions>*/}
               {/*   <Button onClick={onClose}>Cancel</Button>*/}
               {/*   <Button variant="contained" color="primary">*/}
               {/*      Confirm*/}
               {/*   </Button>*/}
               {/*</DialogActions>*/}
            </RegistrationContextProvider>
         </Dialog>
      </div>
   );
};

RegistrationModal.propTypes = {
   handleClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
};

export default RegistrationModal;
