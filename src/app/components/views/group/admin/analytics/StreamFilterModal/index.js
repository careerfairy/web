import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Slide,
} from "@material-ui/core";
import StreamList from "./StreamList";

const useStyles = makeStyles((theme) => ({

}));

const Content = ({
   handleClose,
   handleApply,
   hiddenStreamIds,
   timeFrameName,
   toggleStreamHidden,
}) => {
   const classes = useStyles();

   return (
      <React.Fragment>
         <DialogTitle>
            Filter out streams over the past {timeFrameName}
         </DialogTitle>
         <DialogContent>
            <StreamList
               toggleStreamHidden={toggleStreamHidden}
               hiddenStreamIds={hiddenStreamIds}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained" color="primary" onClick={handleApply}>
               Apply
            </Button>
         </DialogActions>
      </React.Fragment>
   );
};
const StreamFilterModal = ({
   open,
   onClose,
   hiddenStreamIds,
   timeFrameName,
   toggleStreamHidden,
}) => {
   const classes = useStyles();

   const handleClose = () => {
      onClose();
   };

   const handleApply = () => {
      // Apply new hidden streams
      onClose();
   };
   return (
      <Dialog
         fullWidth
         TransitionComponent={Slide}
         maxWidth={"lg"}
         onClose={handleClose}
         open={open}
      >
         <Content
            hiddenStreamIds={hiddenStreamIds}
            handleApply={handleApply}
            toggleStreamHidden={toggleStreamHidden}
            timeFrameName={timeFrameName}
            handleClose={handleClose}
         />
      </Dialog>
   );
};

StreamFilterModal.propTypes = {
   onClose: PropTypes.func,
   open: PropTypes.bool,
   hiddenStreamIds: PropTypes.object,
};
export default StreamFilterModal;
