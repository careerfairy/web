import { Box, Grid } from "@mui/material"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { JobDialogStep } from ".."

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      mt: 1,
   },
   wrapperContainer: {
      height: { xs: "80dvh", md: "auto !important" },
      maxHeight: "800px",
      px: { md: "24px !important" },
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   cancelBtn: {
      color: "neutral.500",
   },
   centerGrid: {
      justifyContent: "center",
   },
})

const FIELD_NAME = "livestreamIds"

const JobLinkLiveStreams = () => {
   const { moveToPrev, moveToNext, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const upcomingLiveStreams = useListenToStreams({ filterByGroupId: group.id })

   const {
      formState: { isSubmitting },
      watch,
      setValue,
   } = useFormContext()

   const livestreamIds = watch(FIELD_NAME)

   const handleNext = useCallback(() => {
      if (group.publicSparks) {
         moveToNext()
      } else {
         goToStep(JobDialogStep.FORM_PREVIEW.key)
      }
   }, [goToStep, group.publicSparks, moveToNext])

   const handleCardClick = useCallback(
      (eventId: string) => {
         if (livestreamIds.includes(eventId)) {
            setValue(
               FIELD_NAME,
               livestreamIds.filter((id: string) => id !== eventId)
            )
         } else {
            setValue(FIELD_NAME, [...livestreamIds, eventId])
         }
      },
      [livestreamIds, setValue]
   )

   const adaptGrid = upcomingLiveStreams?.length > 2

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapperContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <SteppedDialog.Title sx={styles.title}>
                  Link your{" "}
                  <Box component="span" color="secondary.main">
                     job
                  </Box>{" "}
                  to a live stream
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  Select at least one upcoming live stream to link to this job
                  so it can be visible to talent.
               </SteppedDialog.Subtitle>

               <Grid
                  container
                  spacing={2}
                  mt={2}
                  sx={adaptGrid ? null : styles.centerGrid}
               >
                  {upcomingLiveStreams?.map((event) => (
                     <Grid item key={event.id} xs={adaptGrid ? 4 : 6}>
                        <EventPreviewCard
                           key={event.id}
                           event={event}
                           hideChipLabels
                           onCardClick={() => handleCardClick(event.id)}
                           isSelectable
                           selected={livestreamIds.includes(event.id)}
                        />
                     </Grid>
                  ))}
               </Grid>
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <SteppedDialog.Button
                  variant="outlined"
                  color="grey"
                  onClick={moveToPrev}
                  sx={styles.cancelBtn}
               >
                  Back
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  onClick={handleNext}
                  variant="contained"
                  color="secondary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
               >
                  Next
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobLinkLiveStreams
