import { sxStyles } from "@careerfairy/shared-ui"
import { Stack, useTheme } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useCallback } from "react"
import { AlertTriangle } from "react-feather"
import { JobDialogStep } from ".."

const styles = sxStyles({
   wrapContainer: {
      width: { xs: "100%", md: "450px" },
      height: {
         xs: "310px",
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   title: {
      fontSize: "20px !important",
   },
   subtitle: {
      fontSize: "16px ",
   },
   btn: {
      width: "100%",
   },
   actions: {
      border: "none !important",
   },
})

const NoLinkedContentDialog = () => {
   const theme = useTheme()
   const { moveToPrev, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )

   const handlePrevClick = useCallback(() => {
      if (group.publicSparks) {
         moveToPrev()
      } else if (groupHasUpcomingLivestreams) {
         goToStep(JobDialogStep.FORM_LINKED_LIVE_STREAMS.key)
      } else {
         goToStep(JobDialogStep.FORM_ADDITIONAL_DETAILS.key)
      }
   }, [goToStep, group.publicSparks, groupHasUpcomingLivestreams, moveToPrev])

   const handleNextClick = useCallback(() => {
      goToStep(JobDialogStep.FORM_PREVIEW.key)
   }, [goToStep])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Stack spacing={2} sx={styles.info}>
                  <AlertTriangle
                     color={theme.palette.secondary[500]}
                     size={48}
                  />

                  <SteppedDialog.Title sx={styles.title}>
                     Make your job visible!
                  </SteppedDialog.Title>

                  <SteppedDialog.Subtitle
                     maxWidth={"unset"}
                     textAlign={"center"}
                     sx={styles.subtitle}
                  >
                     Linking your job opening to Sparks or upcoming live streams
                     is necessary for qualified candidates to see it.
                  </SteppedDialog.Subtitle>
               </Stack>
            </SteppedDialog.Content>

            <SteppedDialog.Actions sx={styles.actions}>
               <SteppedDialog.Button
                  variant="outlined"
                  color={"grey"}
                  sx={styles.btn}
                  onClick={handleNextClick}
               >
                  I&apos;ll do it later
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  variant="contained"
                  color={"secondary"}
                  sx={styles.btn}
                  onClick={handlePrevClick}
               >
                  Link content
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default NoLinkedContentDialog
