import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const useStyles = makeStyles((theme) => ({
   dialogPaper: {
      // background: "none",
      // boxShadow: "none"
   },
}));

const getDefaultCheckedStreams = (streams, hiddenStreamIds) => {
   return streams.map((stream) => ({
      ...stream,
      tableData: {
         // only change the check status
         checked: !hiddenStreamIds[stream.id],
      },
   }));
};
const streamsSelector = createSelector(
   (state) => state.analyticsReducer.streams.fromTimeframeAndFuture,
   (_, { hiddenStreamIds }) => hiddenStreamIds,
   (streams, hiddenStreamIds) =>
      getDefaultCheckedStreams(streams, hiddenStreamIds)
);
const Content = ({
   handleClose,
   onClose,
   hiddenStreamIds,
   timeFrameName,
   selectVisibleStreams,
}) => {
   const streamsFromStore = useSelector(
      (state) => state.analyticsReducer.streams.fromTimeframeAndFuture
   );
   const classes = useStyles();

   const [newVisibleStreamSelection, setNewVisibleStreamSelection] = useState(
      []
   );

   const handleApply = () => {
      // Apply new hidden streams
      selectVisibleStreams(newVisibleStreamSelection);
      onClose();
   };

   return (
      <React.Fragment>
         <DialogTitle>
            Filter out streams over the past {timeFrameName}
         </DialogTitle>
         <DialogContent>
            <StreamList
               hiddenStreamIds={hiddenStreamIds}
               setNewVisibleStreamSelection={setNewVisibleStreamSelection}
               streamsFromStore={streamsFromStore}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button
               disabled={Boolean(!newVisibleStreamSelection?.length)}
               variant="contained"
               color="primary"
               onClick={handleApply}
            >
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
   selectVisibleStreams,
  clearHiddenStreams
}) => {
   const classes = useStyles();

   const handleClose = () => {
      onClose();
   };

   return (
      <Dialog
         fullWidth
         TransitionComponent={Slide}
         scroll="body"
         maxWidth={"lg"}
         PaperProps={{
            className: classes.dialogPaper,
         }}
         onClose={handleClose}
         open={open}
      >
         <Content
            hiddenStreamIds={hiddenStreamIds}
            onClose={onClose}
            selectVisibleStreams={selectVisibleStreams}
            timeFrameName={timeFrameName}
            handleClose={handleClose}
            clearHiddenStreams={clearHiddenStreams}
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
