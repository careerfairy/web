import {
   Box,
   Dialog,
   DialogActions,
   DialogContent,
   Drawer,
   Grid,
   Stack,
} from "@mui/material"
import {
   MicActionButton,
   ResponsiveStreamButton,
   VideoActionButton,
} from "../Buttons"
import { CameraSelect, MicrophoneSelect } from "../streaming/DeviceSelect"

import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { LoadingButton } from "@mui/lab"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { VideoEffectsButtons } from "../VideoEffectsButtons"
import { SetupCameraVideo } from "./SetupCameraVideo"

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
   actionsMobile: {
      pt: 0,
      p: 1.5,
   },
   dialogContent: {
      p: 4,
      pb: 3,
      borderBottom: "none",
   },
   dialogContentMobile: {
      p: 1.5,
      pb: 2,
      borderBottom: "none",
   },
})

export const StreamSetupWidget = () => {
   const isMobile = useStreamIsMobile()

   const { shouldStream, isReady } = useStreamingContext()

   const showSetupWidget = shouldStream && !isReady

   if (!showSetupWidget) {
      // If the user is not streaming, we don't want to show the setup widget
      return null
   }

   if (isMobile) {
      return (
         <Drawer open={showSetupWidget} sx={styles.drawer} anchor="bottom">
            <Box>
               <Content />
            </Box>
         </Drawer>
      )
   }
   return (
      <Dialog maxWidth={false} sx={styles.dialog} open={showSetupWidget}>
         <Content />
      </Dialog>
   )
}

const Content = () => {
   const { setIsReady, agoraUserId, livestreamId, isHost } =
      useStreamingContext()

   const { userHandRaiseIsActive: isHandRaiseActive, userCanJoinPanel } =
      useUserHandRaiseState(livestreamId, agoraUserId)

   const streamIsMobile = useStreamIsMobile()

   const {
      trigger: updateUserHandRaiseState,
      isMutating: isUpdatingUserHandRaiseState,
   } = useUpdateUserHandRaiseState(livestreamId)

   // To help brain understand the code
   const isViewer = !isHost

   return (
      <Fragment>
         <DialogContent
            sx={
               streamIsMobile
                  ? styles.dialogContentMobile
                  : styles.dialogContent
            }
            dividers
         >
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
         <DialogActions
            sx={streamIsMobile ? styles.actionsMobile : styles.actions}
            disableSpacing
         >
            <MicActionButton />
            <Box mr={2.5} ml={1.5}>
               <VideoActionButton />
            </Box>
            <Stack direction="row" spacing={1}>
               {Boolean(isHandRaiseActive && isViewer) && (
                  <LoadingButton
                     variant="outlined"
                     color="grey"
                     size="small"
                     onClick={async () => {
                        await updateUserHandRaiseState({
                           state: HandRaiseState.unrequested,
                           handRaiseId: agoraUserId,
                        })
                     }}
                     loading={isUpdatingUserHandRaiseState}
                  >
                     Cancel
                  </LoadingButton>
               )}
               <LoadingButton
                  component={ResponsiveStreamButton}
                  variant="contained"
                  color="primary"
                  loading={isUpdatingUserHandRaiseState}
                  onClick={async () => {
                     if (isViewer) {
                        if (!isHandRaiseActive) return

                        if (!userCanJoinPanel) {
                           // Request to join the panel if hand raiser
                           await updateUserHandRaiseState({
                              state: HandRaiseState.requested,
                              handRaiseId: agoraUserId,
                           })
                        }
                     }
                     setIsReady(true)
                  }}
               >
                  {isHandRaiseActive && isViewer && !userCanJoinPanel
                     ? "Raise hand"
                     : "Join live stream"}
               </LoadingButton>
            </Stack>
         </DialogActions>
      </Fragment>
   )
}
