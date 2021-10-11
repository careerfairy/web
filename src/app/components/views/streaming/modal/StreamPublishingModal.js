import React, { useEffect, useRef, useState } from "react";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CheckIcon from "@material-ui/icons/Check";
import {
   DialogTitle,
   Typography,
   Slide,
   DialogContent as MuiDialogContent,
   DialogActions as MuiDialogActions,
   Dialog,
   Button,
   FormControl,
   InputLabel,
   Select,
   OutlinedInput,
   Grid,
   MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SoundLevelDisplayer from "components/views/common/SoundLevelDisplayer";

const useStyles = makeStyles((theme) => ({
   actions: {},
   button: {
      height: "100%",
   },
}));

function StreamPublishingModal({
   displayableMediaStream,
   devices,
   mediaControls,
   open,
   setOpen,
   onConfirmStream,
}) {
   const testVideoRef = useRef(null);
   const inputLabel = useRef(null);
   const [labelWidth, setLabelWidth] = useState(0);

   const classes = useStyles();

   useEffect(() => {
      if (
         open &&
         displayableMediaStream &&
         displayableMediaStream.getTracks().length > 1 &&
         devices
      ) {
         testVideoRef.current.srcObject = displayableMediaStream;
      }
   }, [displayableMediaStream]);

   useEffect(() => {
      if (inputLabel?.current?.offsetWidth) {
         setLabelWidth(inputLabel?.current.offsetWidth);
      }
   }, []);

   const handleChangeCam = (event) => {
      mediaControls.updateVideoSource(event.target.value);
   };

   const handleChangeMic = (event) => {
      mediaControls.updateAudioSource(event.target.value);
   };

   return (
      <Dialog TransitionComponent={Slide} open={open} fullWidth>
         <DialogTitle
            disableTypography
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "flex-end",
            }}
            align="center"
         >
            <PersonAddIcon
               style={{ marginRight: "0.5rem" }}
               fontSize="medium"
            />{" "}
            <Typography
               style={{ fontSize: "1.2em", fontWeight: 500 }}
               variant="h5"
            >
               Join the Stream
            </Typography>
         </DialogTitle>
         <MuiDialogContent dividers>
            <Grid container spacing={2}>
               <Grid
                  item
                  className={classes.actions}
                  lg={6}
                  md={6}
                  sm={6}
                  xs={12}
               >
                  <FormControl
                     disabled={!devices.videoDeviceList.length}
                     style={{
                        marginBottom: 20,
                        fontSize: "0.8rem",
                        width: "100%",
                        maxHeight: 200,
                     }}
                     size="small"
                     variant="outlined"
                  >
                     <InputLabel shrink ref={inputLabel} htmlFor="cameraSelect">
                        Select Camera
                     </InputLabel>
                     <Select
                        value={mediaControls.videoSource || ""}
                        onChange={handleChangeCam}
                        variant="outlined"
                        id="cameraSelect"
                        input={
                           <OutlinedInput
                              notched
                              labelWidth={labelWidth}
                              name="camera"
                              id="cameraSelect"
                           />
                        }
                        label="Select Camera"
                     >
                        <MenuItem value="" disabled>
                           Select Camera
                        </MenuItem>
                        {devices.videoDeviceList.map((device) => {
                           return (
                              <MenuItem key={device.value} value={device.value}>
                                 {device.text}
                              </MenuItem>
                           );
                        })}
                     </Select>
                  </FormControl>
                  <video
                     style={{
                        boxShadow: "0 0 3px rgb(200,200,200)",
                        borderRadius: "5px",
                        width: "100%",
                        maxHeight: 150,
                        background: "black",
                     }}
                     ref={testVideoRef}
                     muted={true}
                     autoPlay
                  />
               </Grid>
               <Grid item lg={6} md={6} sm={6} xs={12}>
                  <FormControl
                     style={{ marginBottom: 10 }}
                     disabled={!devices.audioInputList.length}
                     fullWidth
                     variant="outlined"
                     size="small"
                  >
                     <InputLabel id="microphoneSelect">
                        Select Microphone
                     </InputLabel>
                     <Select
                        value={mediaControls.audioSource || ""}
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
                  <SoundLevelDisplayer audioLevel={mediaControls.audioLevel} />
               </Grid>
            </Grid>
         </MuiDialogContent>
         <MuiDialogActions>
            <Button
               children="Join Now"
               variant="contained"
               color="primary"
               startIcon={<CheckIcon />}
               onClick={onConfirmStream}
            />
         </MuiDialogActions>
      </Dialog>
   );
}

export default StreamPublishingModal;
