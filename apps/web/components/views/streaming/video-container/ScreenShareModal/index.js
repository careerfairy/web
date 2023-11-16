import React, { memo, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { GlassDialog } from "../../../../../materialUI/GlobalModals"
import PropTypes from "prop-types"
import GraphicButton from "../../../../../materialUI/GlobalButtons/GraphicButton"

import {
   Button,
   Checkbox,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   FormControlLabel,
   Grid,
   Typography,
} from "@mui/material"
import { demoSlides, demoVideo } from "../../../../util/constants"

const sharAudioDemo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/background-videos%2Fshare-audio-demo.mp4?alt=media&token=d5f55a31-ecbe-4c6a-9689-b7d11ddaf59d"
const useStyles = makeStyles((theme) => ({
   shareAudioVideo: {
      maxWidth: 550,
   },
   shareAudioList: {
      paddingLeft: theme.spacing(2),
   },
   hasSeenShareAudioTip: {
      marginRight: "auto",
   },
   dialogActions: {
      padding: theme.spacing(1, 4),
   },
}))

const ScreenShareModal = ({
   open,
   handleClose,
   handleScreenShare,
   smallScreen,
}) => {
   const [showShareAudioHint, setShowShareAudioHint] = useState(false)
   const [hasSeenShareAudioTip, setHasSeenShareAudioTip] = useState(false)
   const classes = useStyles()

   useEffect(() => {
      const hasSeenShareAudioTip = localStorage.getItem("hasSeenShareAudioTip")
      if (JSON.parse(hasSeenShareAudioTip)) {
         setHasSeenShareAudioTip(true)
      }
   }, [])

   const handleClick = (optimizationMode = "detail") => {
      handleScreenShare(optimizationMode)
      closeScreenShareModal()
   }

   const closeScreenShareModal = () => {
      setShowShareAudioHint(false)
      handleClose()
   }

   const toggleShowShareAudioHint = () => {
      setShowShareAudioHint(!showShareAudioHint)
   }

   const markAsSeen = () => {
      localStorage.setItem("hasSeenShareAudioTip", JSON.stringify(true))
   }

   const handleSeen = () => {
      setHasSeenShareAudioTip(true)
   }

   const handleClickVideoButton = () => {
      if (hasSeenShareAudioTip) {
         return handleClick("motion")
      }
      toggleShowShareAudioHint()
   }

   const handleCheckBox = () => {
      setHasSeenShareAudioTip(!hasSeenShareAudioTip)
   }

   const handleProceed = () => {
      if (hasSeenShareAudioTip) {
         markAsSeen()
      }
      handleClick("motion")
   }

   return (
      <GlassDialog
         fullScreen={smallScreen}
         fullWidth
         maxWidth="sm"
         onClose={closeScreenShareModal}
         open={open}
      >
         {showShareAudioHint ? (
            <React.Fragment>
               <DialogTitle>
                  <Typography align="center" variant="h4">
                     When Sharing a video
                  </Typography>
               </DialogTitle>
               <DialogContent>
                  <DialogContentText color="textPrimary">
                     <ol className={classes.shareAudioList}>
                        <li>
                           After clicking &quot;Proceed&quot;, please click
                           &quot;Chrome Tabs&quot;
                        </li>
                        <li>Select the tab with the video</li>
                        <li>Make sure the share audio checkbox is checked</li>
                        <li>Click share!</li>
                     </ol>
                  </DialogContentText>
                  <Grid container spacing={1}>
                     <Grid item xs={12} sm={12}>
                        <video
                           className={classes.shareAudioVideo}
                           src={sharAudioDemo}
                           loop
                           autoPlay
                           controls={false}
                        />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions className={classes.dialogActions}>
                  <FormControlLabel
                     className={classes.hasSeenShareAudioTip}
                     control={
                        <Checkbox
                           checked={hasSeenShareAudioTip}
                           onChange={handleCheckBox}
                           color="primary"
                           name="hasSeenShareAudioTip"
                        />
                     }
                     label="Don't remind me again"
                  />
                  <Button onClick={toggleShowShareAudioHint}>Back</Button>
                  <Button
                     variant="contained"
                     color="primary"
                     onClick={handleProceed}
                  >
                     Proceed
                  </Button>
               </DialogActions>
            </React.Fragment>
         ) : (
            <React.Fragment>
               <DialogTitle>
                  <Typography align="center" variant="h4">
                     Would you like to share
                  </Typography>
               </DialogTitle>
               <DialogContent>
                  <Grid container spacing={1}>
                     <Grid item xs={12} sm={6}>
                        <GraphicButton
                           buttonTitle="Video"
                           onClick={handleClickVideoButton}
                           videoUrl={demoVideo}
                           buttonText={
                              "Chose this option if you would" +
                              " like to share a fluid video"
                           }
                        />
                     </Grid>
                     <Grid item xs={12} sm={6}>
                        <GraphicButton
                           buttonTitle="Screen"
                           videoUrl={demoSlides}
                           onClick={() => handleClick("detail")}
                           buttonText={
                              "Chose this option if you would like" +
                              " to share a screen in high detail "
                           }
                        />
                     </Grid>
                  </Grid>
               </DialogContent>
               <DialogActions className={classes.dialogActions}>
                  <Button onClick={handleClose}>Close</Button>
               </DialogActions>
            </React.Fragment>
         )}
      </GlassDialog>
   )
}
ScreenShareModal.prototypes = {
   open: PropTypes.bool.isRequired,
   handleClose: PropTypes.func.isRequired,
   handleScreenShare: PropTypes.func.isRequired,
}
export default memo(ScreenShareModal)
