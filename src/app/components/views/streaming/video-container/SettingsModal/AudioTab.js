import React, { useEffect, useRef, useState } from "react";
import {
   Box,
   Button,
   DialogContent,
   FormControl,
   Grid,
   InputLabel,
   MenuItem,
   Select,
   Typography,
} from "@material-ui/core";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import { makeStyles } from "@material-ui/core/styles";
import { useAudio } from "components/custom-hook/useAudio";

const useStyles = makeStyles((theme) => ({
   button: {
      marginTop: 10,
      marginBottom: 10,
   },
   warning: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
   },
   buttons: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 5,
      "& .MuiButton-root": {
         margin: "0 5px",
      },
   },
   label: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   emphasis: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& <": {
         margin: "0 5px",
      },
   },
}));

const AudioTab = ({ audioLevel, audioSource, devices, setAudioSource }) => {
   const classes = useStyles();
   const [playing, toggle, audio] = useAudio(
      "https://www.kozco.com/tech/piano2-CoolEdit.mp3"
   );

   const handleChangeMic = (event) => {
      setAudioSource(event.target.value);
   };

   return (
      <Grid container spacing={2}>
         {devices.audioInputList.length && (
            <Grid item lg={12} md={12} sm={12} xs={12}>
               <FormControl
                  style={{ marginBottom: 10 }}
                  disabled={!devices.audioInputList.length}
                  fullWidth
                  variant="outlined"
               >
                  <InputLabel id="microphoneSelect">
                     Select Microphone
                  </InputLabel>
                  <Select
                     value={audioSource}
                     fullWidth
                     onChange={handleChangeMic}
                     variant="outlined"
                     id="microphoneSelect"
                     label="Select Microphone"
                  >
                     <MenuItem value="" disabled>
                        Select a Microphone
                     </MenuItem>
                     {devices.audioInputList.map((device) => {
                        return (
                           <MenuItem key={device.value} value={device.value}>
                              {device.text}
                           </MenuItem>
                        );
                     })}
                  </Select>
               </FormControl>
               <SoundLevelDisplayer audioLevel={audioLevel} />
            </Grid>
         )}
         {devices.audioOutputList.length && (
            <Grid item lg={12} md={12} sm={12} xs={12}>
               <Button
                  variant="outlined"
                  onClick={toggle}
                  className={classes.button}
               >
                  {playing ? "Stop playing" : "Play some music"}
               </Button>
               {playing && (
                  <Typography>
                     If you cannot hear the music, try changing the speaker on
                     your computer or increase the volume on your device.
                  </Typography>
               )}
            </Grid>
         )}
      </Grid>
   );
};

export default AudioTab;
