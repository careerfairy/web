import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Button,
   Checkbox,
   CircularProgress,
   Collapse,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControlLabel,
   Grid,
   Typography,
} from "@material-ui/core";
import * as actions from "store/actions";
import EventOptionPreview from "../../../../common/EventAutoSelect/EventOptionPreview";
import EventAutoSelect from "../../../../common/EventAutoSelect";
import { useFirebase } from "../../../../../../context/firebase";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
   root: {},
}));

const Content = ({ onClose, eventData, group }) => {
   const dispatch = useDispatch();
   const [showOnlyLinkedEvents, setShowOnlyLinkedEvents] = useState(false);
   const [updating, setUpdating] = useState(false);
   const [fetchingEvents, setFetchingEvents] = useState(false);
   const { getUpcomingLivestreams, updateLivestream } = useFirebase();
   const [allEvents, setAllEvents] = useState([]);
   const [selectedEvents, setSelectedEvents] = useState([]);
   const [filteredEvents, setFilteredEvents] = useState([]);
   const [inputValue, setInputValue] = useState("");

   useEffect(() => {
      (async function () {
         try {
            setFetchingEvents(true);
            const eventSnaps = await getUpcomingLivestreams();
            const newEvents = eventSnaps.docs
               .map((doc) => ({ id: doc.id, ...doc.data() }))
               .filter((event) => event.id !== eventData?.id);
            setAllEvents(newEvents);
            if (eventData?.recommendedEventIds) {
               setSelectedEvents(
                  newEvents.filter((event) =>
                     eventData?.recommendedEventIds.includes(event.id)
                  )
               );
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setFetchingEvents(false);
      })();
   }, [eventData?.id, eventData?.recommendedEventIds]);

   useEffect(() => {
      if (showOnlyLinkedEvents) {
         setFilteredEvents(
            allEvents.filter((event) => event.groupIds.includes(group.id))
         );
         setSelectedEvents((prevState) =>
            prevState.filter((event) => event.groupIds.includes(group.id))
         );
      } else {
         setFilteredEvents(allEvents);
      }
   }, [allEvents, showOnlyLinkedEvents, group?.id]);

   const handleSaveChanges = async () => {
      try {
         setUpdating(true);
         const updateData = {
            id: eventData.id,
            recommendedEventIds: selectedEvents.map((event) => event.id),
         };
         await updateLivestream(updateData, "livestreams");
         dispatch(
            actions.sendSuccessMessage("Changes have successfully been saved")
         );
         onClose();
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setUpdating(false);
   };

   return (
      <>
         <DialogTitle>
            Choose events you would like to recommend at the end
         </DialogTitle>
         <DialogContent dividers>
            {fetchingEvents ? (
               <CircularProgress />
            ) : (
               <Box p={2}>
                  <Collapse in={Boolean(selectedEvents.length)} unmountOnExit>
                     <Box mb={2}>
                        <Grid container spacing={2}>
                           {selectedEvents.map((event) => (
                              <Grid key={event.id} item xs={12} sm={4} md={3}>
                                 <EventOptionPreview
                                    preview
                                    streamData={event}
                                 />
                              </Grid>
                           ))}
                        </Grid>
                     </Box>
                  </Collapse>
                  <EventAutoSelect
                     value={selectedEvents}
                     multiple
                     disabed={updating}
                     onChange={(event, newValue) => {
                        setSelectedEvents(newValue);
                     }}
                     inputValue={inputValue}
                     onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                     }}
                     id="event-select-menu"
                     options={filteredEvents}
                     fullWidth
                  />
                  <Box py={1}>
                     <FormControlLabel
                        disabled={updating}
                        control={
                           <Checkbox
                              name="show-only-linked-events"
                              onChange={(e) =>
                                 setShowOnlyLinkedEvents(
                                    e.currentTarget.checked
                                 )
                              }
                              value={showOnlyLinkedEvents}
                              checked={showOnlyLinkedEvents}
                              color="primary"
                           />
                        }
                        label={<Typography>Only linked events</Typography>}
                     />
                  </Box>
               </Box>
            )}
         </DialogContent>
         <DialogActions>
            <Button disabled={updating} onClick={onClose}>
               Cancel
            </Button>
            <Button
               onClick={handleSaveChanges}
               variant="contained"
               color="primary"
               disabled={updating}
            >
               Save Changes & Close
            </Button>
         </DialogActions>
      </>
   );
};
const ManageEndOfEventDialog = ({ open, handleClose, eventData, group }) => {
   const classes = useStyles();

   const onClose = () => {
      handleClose();
   };

   return (
      <div className={classes.root}>
         <Dialog maxWidth="lg" fullWidth open={open} onClose={onClose}>
            <Content group={group} onClose={onClose} eventData={eventData} />
         </Dialog>
      </div>
   );
};

ManageEndOfEventDialog.propTypes = {
   handleClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
};

export default ManageEndOfEventDialog;
