import { Box, Grid } from "@mui/material"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useIsMobile from "components/custom-hook/useIsMobile"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useCallback, useMemo } from "react"
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
   actions: {
      zIndex: 99,
   },
})

const FIELD_NAME = "livestreamIds"

const JobLinkLiveStreams = () => {
   const { moveToPrev, moveToNext, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const isMobile = useIsMobile()
   const upcomingLiveStreams = useListenToStreams({
      filterByGroupId: group.id ?? group.groupId,
   })
   const pastLiveStreams = useListenToStreams({
      filterByGroupId: group.id ?? group.groupId,
      listenToPastEvents: true,
   })

   const allLivesStreams = useMemo(
      () => [
         ...new Map(
            [
               ...(upcomingLiveStreams ? upcomingLiveStreams : []),
               ...(pastLiveStreams ? pastLiveStreams : []),
            ].map((stream) => [stream.id, stream])
         ).values(),
      ],
      [pastLiveStreams, upcomingLiveStreams]
   )

   const { watch, setValue } = useFormContext()

   const livestreamIds = watch(FIELD_NAME)

   const handleNext = useCallback(() => {
      // If the group has public sparks, move to the next step
      if (group.publicSparks) {
         moveToNext()
      }
      // If there are no livestream IDs selected and has no public sparks, go to the NO_LINKED_CONTENT step
      else if (livestreamIds.length === 0) {
         goToStep(JobDialogStep.NO_LINKED_CONTENT.key)
      }
      // Otherwise, go to the FORM_PREVIEW step
      else {
         goToStep(JobDialogStep.FORM_PREVIEW.key)
      }
   }, [goToStep, group.publicSparks, livestreamIds.length, moveToNext])

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

   const adaptGrid = allLivesStreams?.length > 2 && !isMobile

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
                  {allLivesStreams?.map((event) => (
                     <Grid
                        item
                        key={event.id}
                        xs={isMobile ? 12 : adaptGrid ? 4 : 6}
                     >
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

            <SteppedDialog.Actions sx={styles.actions}>
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
               >
                  Next
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobLinkLiveStreams
