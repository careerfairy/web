import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   ListItem,
   ListItemIcon,
   ListItemText,
   Switch,
} from "@mui/material";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { useRouter } from "next/router";

const BreakoutRoomSettings = ({ classes, handleClose, onClick }) => {
   const {
      query: { livestreamId },
   } = useRouter();
   const {
      listenToBreakoutRoomSettings,
      updateCanReturnToMainStream,
   } = useFirebaseService();
   const [breakoutRoomSettings, setBreakoutRoomSettings] = useState({});

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = listenToBreakoutRoomSettings(
            livestreamId,
            (settingsSnap) => {
               const newSettings = settingsSnap.data() || {};
               setBreakoutRoomSettings(newSettings);
            }
         );

         return () => unsubscribe();
      }
   }, [livestreamId]);

   const assignOptions = [
      {
         primaryText: "Main Room Availability",
         secondaryText: "Allow participants to return the main event stream",
         onClick: () =>
            updateCanReturnToMainStream(
               livestreamId,
               !Boolean(breakoutRoomSettings?.canReturnToMainStream)
            ),
         checked: Boolean(breakoutRoomSettings?.canReturnToMainStream),
      },
   ];

   return (
      <React.Fragment>
         <Box display="flex" alignItems="center" justifyContent="space-between">
            <DialogTitle>Room Settings</DialogTitle>
            <Box py={2} px={1.5}>
               <Button onClick={onClick}>Back</Button>
            </Box>
         </Box>
         <DialogContent className={classes.breakoutRoomsContent} dividers>
            <List>
               {assignOptions.map(
                  ({ checked, secondaryText, primaryText, onClick }) => (
                     <ListItem
                        key={primaryText}
                        onClick={onClick}
                        selected={checked}
                        button
                     >
                        <ListItemText
                           primary={primaryText}
                           secondary={secondaryText}
                        />
                        <ListItemIcon style={{ minWidth: 0 }}>
                           <Switch
                              checked={checked}
                              value={checked}
                              name="radio-buttons"
                              inputProps={{ "aria-label": "A" }}
                           />
                        </ListItemIcon>
                     </ListItem>
                  )
               )}
            </List>
         </DialogContent>
         <DialogActions>
            <Button color="grey" onClick={handleClose}>
               Cancel
            </Button>
         </DialogActions>
      </React.Fragment>
   );
};

BreakoutRoomSettings.propTypes = {
   onClick: PropTypes.func,
   classes: PropTypes.any,
   handleClose: PropTypes.any,
};

export default BreakoutRoomSettings;
