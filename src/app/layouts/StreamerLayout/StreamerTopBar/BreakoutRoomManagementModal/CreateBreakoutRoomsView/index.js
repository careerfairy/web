import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useFirebase } from "context/firebase";
import * as actions from "store/actions";

import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   FormControl,
   MenuItem,
   Select,
   Typography,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { DynamicColorButton } from "materialUI/GlobalButtons/GlobalButtons";
import { MAX_BREAKOUT_ROOMS } from "constants/breakoutRooms";

const options = Array.from({ length: MAX_BREAKOUT_ROOMS }, (_, i) => i + 1);
const CreateBreakoutRoomsView = ({ handleClose }) => {
   const dispatch = useDispatch();
   const {
      query: { livestreamId },
   } = useRouter();
   const [numberOfRooms, setNumberOfRooms] = useState(1);
   const [assignType, setAssignType] = useState("manually");
   const [loading, setLoading] = useState(false);
   const { createMultipleBreakoutRooms } = useFirebase();

   const handleChangeNumberOfRooms = (event) => {
      setNumberOfRooms(event.target.value);
   };
   const handleChangeAssignType = (value) => {
      setAssignType(value);
   };

   const handleCreateRooms = async () => {
      try {
         setLoading(true);
         await createMultipleBreakoutRooms(livestreamId, numberOfRooms);
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setLoading(false);
   };

   const assignOptions = [
      {
         primaryText: "Manually",
         secondaryText: "Assign people to rooms individually",
         onClick: () => handleChangeAssignType("manually"),
         value: "manually",
      },
      {
         primaryText: "Passively",
         secondaryText:
            "Once created, your participants will be able to move between rooms freely",
         onClick: () => handleChangeAssignType("passively"),
         value: "passively",
      },
   ];

   return (
      <React.Fragment>
         <DialogTitle>Create Breakout Rooms</DialogTitle>
         <DialogContent dividers>
            <Box p={1}>
               <Typography variant="h6">Rooms</Typography>
               <Box display="flex" justifyContent="space-between">
                  <DialogContentText>
                     How many breakout rooms do you need?
                  </DialogContentText>
                  <FormControl>
                     <Select
                        labelId="number-of-rooms-select"
                        id="number-of-rooms-select"
                        value={numberOfRooms}
                        onChange={handleChangeNumberOfRooms}
                        // input={<OutlinedInput label="Age"/>}
                     >
                        {options.map((value) => (
                           <MenuItem key={value} value={value}>
                              {value}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Box>
            </Box>
            {/*<Divider/>*/}
            {/*<Box p={1}>*/}
            {/*    <Typography variant="h6">*/}
            {/*        Participants*/}
            {/*    </Typography>*/}
            {/*    <DialogContentText>*/}
            {/*        How do you want to assign people to rooms?*/}
            {/*    </DialogContentText>*/}
            {/*    <List>*/}
            {/*        {assignOptions.map(({value, secondaryText, primaryText, onClick}) => (*/}
            {/*            <ListItem key={value}*/}
            {/*                      onClick={onClick}*/}
            {/*                      selected={assignType === value}*/}
            {/*                      button>*/}
            {/*                <ListItemText*/}
            {/*                    primary={primaryText}*/}
            {/*                    secondary={secondaryText}*/}
            {/*                />*/}
            {/*                <ListItemIcon style={{minWidth: 0}}>*/}
            {/*                    <Radio*/}
            {/*                        checked={assignType === value}*/}
            {/*                        value={value}*/}
            {/*                        name="radio-buttons"*/}
            {/*                        inputProps={{'aria-label': 'A'}}*/}
            {/*                    />*/}
            {/*                </ListItemIcon>*/}
            {/*            </ListItem>*/}
            {/*        ))}*/}
            {/*    </List>*/}
            {/*</Box>*/}
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <DynamicColorButton
               color="primary"
               loading={loading}
               variant="contained"
               onClick={handleCreateRooms}
            >
               Create Rooms
            </DynamicColorButton>
         </DialogActions>
      </React.Fragment>
   );
};

export default CreateBreakoutRoomsView;
