import React, { useEffect, useState } from "react";
import {
   Button,
   FormControl,
   Grid,
   InputLabel,
   MenuItem,
   Select,
   Typography,
} from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { makeStyles } from "@material-ui/core/styles";
import { useAudio } from "../../../../custom-hook/useAudio";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
   actions: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
   },
   button: {
      height: "100%",
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
      width: "100%",
      "& .MuiButton-root": {
         margin: "0 5px",
      },
   },
   speakerTester: {
      padding: "3rem 0",
   },
   buttonContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      "& button": {
         margin: theme.spacing(0, 0.5),
      },
   },
}));

const Step3Speakers = ({
   // setSpeakerSource,
   speakerSource,
   devices,
   // attachSinkId,
   handleMarkComplete,
   isCompleted,
   handleMarkIncomplete,
}) => {
   const classes = useStyles();
   const [playing, toggle, audio, playAudio, stopAudio] = useAudio(
      "https://www.kozco.com/tech/piano2-CoolEdit.mp3"
   );
   const [localSpeakers, setLocalSpeakers] = useState([]);
   const [clickedNo, setClickedNo] = useState(false);
   const [allTested, setAllTested] = useState(false);
   const [loopAudio, setLoopAudio] = useState(true);

   useEffect(() => {
      if (
         devices &&
         devices.audioOutputList &&
         devices.audioOutputList.length
      ) {
         const mappedSpeakers = devices.audioOutputList.map((speaker) => ({
            ...speaker,
            hasBeenChecked: false,
         })); // first speaker in device array is allways selected by default
         mappedSpeakers[0].hasBeenChecked = true;
         setLocalSpeakers(mappedSpeakers);
      }
   }, [devices]);

   useEffect(() => {
      toggle();
      handleMarkIncomplete();
   }, []);

   useEffect(() => {
      if (!playing && loopAudio) {
         toggle();
      }
   }, [playing, loopAudio]);

   useEffect(() => {
      return () => handleStopMusic();
   }, []);

   // useEffect(() => {
   //    if (speakerSource) {
   //       attachSinkId(audio, speakerSource);
   //    }
   // }, [speakerSource]);

   const handleCantHear = () => {
      handleMarkIncomplete();
      if (!clickedNo) {
         setClickedNo(true);
      }
      // const uncheckedSpeakers = [...localSpeakers].filter(
      //    (device) => !device.hasBeenChecked
      // );
      // if (uncheckedSpeakers.length) {
      //    setSpeakerSource(uncheckedSpeakers[0].value);
      //    const index = localSpeakers.findIndex(
      //       (device) => device.value === uncheckedSpeakers[0].value
      //    );
      //    if (index > -1) {
      //       markAsChecked(index);
      //    }
      //    attachSinkId(audio, uncheckedSpeakers[0].value);
      // } else {
      //    setAllTested(true);
      // }
   };

   const handlePlayMusic = () => {
      handleMarkIncomplete();
      setClickedNo(false);
      setLoopAudio(true);
      playAudio();
   };

   const handleStopMusic = () => {
      setLoopAudio(false);
      stopAudio();
   };

   const handleTestAgain = () => {
      setAllTested(false);
      const mappedSpeakers = devices.audioOutputList.map((speaker) => ({
         ...speaker,
         hasBeenChecked: false,
      })); // first speaker in device array is allways selected by default
      const index = localSpeakers.findIndex(
         (device) => device.value === speakerSource
      );
      if (index > -1) {
         mappedSpeakers[index].hasBeenChecked = true;
      }
      setLocalSpeakers(mappedSpeakers);
   };

   // const handleChangeSpeaker = async (event) => {
   //    const value = event.target.value;
   //    setSpeakerSource(value);
   //    const targetIndex = localSpeakers.findIndex(
   //       (device) => device.value === value
   //    );
   //    markAsChecked(targetIndex);
   //    attachSinkId(audio, event.target.value);
   //    handleMarkIncomplete();
   // };

   const markAsChecked = (index) => {
      const newLocalSpeakers = [...localSpeakers];
      if (newLocalSpeakers[index]) {
         newLocalSpeakers[index].hasBeenChecked = true;
      }
      setLocalSpeakers(newLocalSpeakers);
   };

   const handleClickYes = () => {
      setClickedNo(false);
      handleStopMusic();
      handleMarkComplete();
   };

   const getSelected = () => {
      const targetDevice = localSpeakers.find(
         (device) => device.value === speakerSource
      );
      return targetDevice?.text;
   };

   const speakerNumber = () => {
      return localSpeakers.findIndex(
         (device) => device.value === speakerSource
      );
   };

   return (
      <Grid style={{ padding: "1rem 0" }} container spacing={2}>
         {/*{localSpeakers?.[0] && (*/}
         {loopAudio && (
            <Grid xs={12} item>
               <Typography align="center" variant="h4">
                  <b>Do you hear a ringtone?</b>
               </Typography>
               {/*<Typography align="center" variant="subtitle1">*/}
               {/*   Current Speaker: <b>{localSpeakers[0].text}</b>*/}
               {/*</Typography>*/}
            </Grid>
         )}
         {/*)}*/}
         <Grid xs={12} className={classes.buttonContainer} item>
            {loopAudio ? (
               <Button variant="outlined" onClick={handleStopMusic}>
                  Stop Music
               </Button>
            ) : (
               <Button variant="outlined" onClick={handlePlayMusic}>
                  Play Music
               </Button>
            )}
         </Grid>
         {loopAudio && (
            <Grid xs={12} className={classes.buttonContainer} item>
               <Button
                  disabled={isCompleted}
                  onClick={handleClickYes}
                  variant="outlined"
               >
                  Yes
               </Button>
               <Button
                  disabled={clickedNo}
                  onClick={handleCantHear}
                  variant="outlined"
               >
                  No
               </Button>
            </Grid>
         )}
         {clickedNo && (
            <Grid item xs={12}>
               <Alert severity="warning">
                  Please check the volume or change the selected speaker within
                  your operating system if you can't hear the sound being played
               </Alert>
            </Grid>
         )}
      </Grid>
   );
};

export default Step3Speakers;
