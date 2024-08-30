import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { AlertTriangle } from "react-feather"
import ReactPlayer from "react-player"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialog: {
      ".MuiPaper-root": {
         borderRadius: "12px",
         flexDirection: "row",
         paddingRight: "16px",
         gap: "20px",
         display: "inline-flex",
         justifyContent: "center",
         alignItems: "center",
         maxWidth: "767px",
      },
   },
   videoContainer: {
      display: "flex",
      padding: "15px 25px 16px 25px",
      justifyContent: "center",
      alignItems: "center",
      background: "#D1F6ED",
   },
   title: {
      fontWeight: 700,
   },
   actions: {
      alignItems: "center",
      gap: "12px",
      alignSelf: "stretch",
      flexDirection: "row",
   },
   startButton: {
      width: "170px",
   },
   attention: {
      color: (theme) => theme.palette.error[500],
   },
   skipButton: (theme) => ({
      color: theme.palette.neutral[500],
      "&:hover": {
         backgroundColor: `${theme.palette.black[400]} !important`,
      },
   }),
})

export const StartTutorialDialog = ({ open, handleStart, handleSkip }) => {
   return (
      <>
         <Dialog open={open} sx={styles.dialog}>
            <Box width="362px" height="362px" sx={styles.videoContainer}>
               <ReactPlayer
                  alt="Live stream tutorial"
                  url={
                     "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-videos%2F-9aca-428b-8096-8595b4dd50b6.mp4?alt=media&token=2ffb5f56-234c-43dd-86e7-f6d30579c8e7"
                  }
                  width="331px"
                  height="331px"
                  playing
                  playsinline
               />
            </Box>
            <Stack spacing={4} width="366px">
               <Stack spacing={1.5}>
                  <Typography variant="brandedH3" sx={styles.title}>
                     Welcome to your live stream room!
                  </Typography>
                  <Typography variant="brandedBody">
                     Learn how to set up and run your live stream with ease.
                     This short tutorial will help you get everything ready
                     before you go live.
                  </Typography>
               </Stack>
               <Stack sx={styles.actions}>
                  <Button
                     variant="contained"
                     sx={styles.startButton}
                     onClick={handleStart}
                  >
                     Start tour
                  </Button>
                  <Button
                     variant="text"
                     sx={styles.skipButton}
                     onClick={handleSkip}
                  >
                     Skip tour
                  </Button>
               </Stack>
            </Stack>
         </Dialog>
      </>
   )
}

export const SkipConfirmationDialog = ({ open, handleStart, handleSkip }) => {
   return (
      <ConfirmationDialog
         open={open}
         title="Skip guided tour?"
         icon={<Box component={AlertTriangle} sx={styles.attention} />}
         description={
            "Are you sure you want to skip the tour? You might miss important features."
         }
         primaryAction={{
            text: "Skip tour",
            color: "error",
            callback: handleSkip,
            variant: "contained",
         }}
         secondaryAction={{
            text: "Continue tour",
            color: "grey",
            callback: handleStart,
            variant: "outlined",
         }}
      />
   )
}

export const EndTutorialDialog = ({ open, handleClose }) => {
   return (
      <ConfirmationDialog
         open={open}
         title="Tour completed!"
         icon={
            <Box
               component={"img"}
               src="/Party-popper2.png"
               alt="party popper"
               width={68}
               height={68}
            />
         }
         description={
            "You're all set! You've explored the key features. Ready to start streaming?"
         }
         primaryAction={{
            text: "Continue to live stream room",
            callback: handleClose,
            variant: "contained",
         }}
      />
   )
}
