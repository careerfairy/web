import {
   Box,
   Dialog,
   DialogActions,
   DialogContent,
   Drawer,
   Grid,
} from "@mui/material"
import { CameraSelect, MicrophoneSelect } from "../streaming/DeviceSelect"
import {
   MicActionButton,
   ResponsiveStreamButton,
   VideoActionButton,
} from "../Buttons"

import { Fragment } from "react"
import { SetupCameraVideo } from "./SetupCameraVideo"
import { sxStyles } from "types/commonTypes"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useStreamingContext } from "../../context"
import { VideoEffectsButtons } from "../VideoEffectsButtons"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 600,
         maxWidth: 600,
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   actions: {
      pt: 0,
      px: 4,
      pb: 2.5,
   },
   dialogContent: {
      p: 4,
      pb: 3,
      borderBottom: "none",
   },
})

export const StreamSetupWidget = () => {
   const isMobile = useStreamIsMobile()

   const { shouldStream, isReady } = useStreamingContext()

   if (!shouldStream || isReady) {
      // If the user is not streaming, we don't want to show the setup widget
      return null
   }

   if (isMobile) {
      return (
         <Drawer open={!isReady} sx={styles.drawer} anchor="bottom">
            <Box>
               <Content />
            </Box>
         </Drawer>
      )
   }
   return (
      <Dialog maxWidth={false} sx={styles.dialog} open={!isReady}>
         <Content />
      </Dialog>
   )
}

const Content = () => {
   const { setIsReady } = useStreamingContext()

   return (
      <Fragment>
         <DialogContent sx={styles.dialogContent} dividers>
            <Box>
               <SetupCameraVideo />
               <Box pb={1.5} />
               <VideoEffectsButtons />
               <Box pb={{ xs: 1.5, sm: 3 }} />
               <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                     <MicrophoneSelect />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <CameraSelect />
                  </Grid>
               </Grid>
            </Box>
         </DialogContent>
         <DialogActions sx={styles.actions} disableSpacing>
            <MicActionButton />
            <Box mr={2.5} ml={1.5}>
               <VideoActionButton />
            </Box>
            <ResponsiveStreamButton
               variant="contained"
               color="primary"
               onClick={() => setIsReady(true)}
            >
               Join live stream
            </ResponsiveStreamButton>
         </DialogActions>
      </Fragment>
   )
}
