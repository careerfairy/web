import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import * as actions from "store/actions"

const useStyles = makeStyles((theme) => ({}));

const Content = ({ handleClose, handleSend, loading }) => {
   return (
      <React.Fragment>
         <DialogTitle>Send a call to action</DialogTitle>
         <DialogContent>
            <DialogContentText>stufffs</DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button
               disabled={loading}
               onClick={handleSend}
               variant="contained"
               color="primary"
            >
               Send
            </Button>
         </DialogActions>
      </React.Fragment>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   handleSend: PropTypes.func,
   loading: PropTypes.bool
};
const CallToActionModal = ({ open, onClose }) => {
   const classes = useStyles();

   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch()

   const handleClose = () => {
      onClose();
   };

   const handleSend = async () => {
      try {
         setLoading(true);
         console.log("CTA SENT!!! ;)")
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setLoading(false);
   };

   return (
      <Dialog open={open} onClose={handleClose}>
         <Content
           handleSend={handleSend}
           loading={loading}
           handleClose={handleClose} />
      </Dialog>
   );
};

CallToActionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool
}

export default CallToActionModal;

