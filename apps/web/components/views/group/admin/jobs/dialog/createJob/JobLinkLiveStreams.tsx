import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useIsMobile from "components/custom-hook/useIsMobile"
import useListenToStreams from "components/custom-hook/useListenToStreams"
import CardTopCheckBox from "components/views/common/CardTopCheckBox"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useCallback, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { JobDialogStep } from ".."
import { useCustomJobForm } from "../CustomJobFormProvider"

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
      px: { md: "24px !important" },
      minWidth: { md: "750px" },
   },
   title: {
      maxWidth: { xs: "90%", md: "unset" },
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

type Props = {
   job: CustomJob
   handleSecondaryButton?: () => void
   handlePrimaryButton?: () => void
   primaryButtonMessage?: string
   secondaryButtonMessage?: string
}

const JobLinkLiveStreams = ({
   job,
   handleSecondaryButton,
   handlePrimaryButton,
   primaryButtonMessage,
   secondaryButtonMessage,
}: Props) => {
   const { moveToPrev, moveToNext, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const isMobile = useIsMobile()
   const upcomingLiveStreams = useListenToStreams({
      filterByGroupId: group.groupId,
   })
   const linkedLiveStreams = useCustomJobLinkedLivestreams(job)
   const { isSubmitting } = useCustomJobForm()

   const allLivesStreams = useMemo(
      () => [
         ...new Map(
            [
               ...(linkedLiveStreams ? linkedLiveStreams : []),
               ...(upcomingLiveStreams ? upcomingLiveStreams : []),
            ].map((stream) => [stream.id, stream])
         ).values(),
      ],
      [linkedLiveStreams, upcomingLiveStreams]
   )

   const { watch, setValue } = useFormContext()

   const livestreamIds = watch(FIELD_NAME)

   const handlePrimaryClick = useCallback(() => {
      if (handlePrimaryButton) {
         handlePrimaryButton()
         return
      }

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
   }, [
      goToStep,
      group.publicSparks,
      handlePrimaryButton,
      livestreamIds.length,
      moveToNext,
   ])

   const handleSecondaryClick = useCallback(() => {
      if (handleSecondaryButton) {
         handleSecondaryButton()
      } else {
         moveToPrev()
      }
   }, [handleSecondaryButton, moveToPrev])

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

   const title = useMemo(
      () =>
         group.publicSparks ? (
            <SteppedDialog.Title sx={styles.title}>
               Link your{" "}
               <Box component="span" color="secondary.main">
                  job
               </Box>{" "}
               to a live stream
            </SteppedDialog.Title>
         ) : (
            <SteppedDialog.Title sx={styles.title}>
               Where to{" "}
               <Box component="span" color="secondary.main">
                  promote
               </Box>
            </SteppedDialog.Title>
         ),
      [group.publicSparks]
   )

   const selectInput = useCallback(
      (eventId: string) => (
         <CardTopCheckBox
            id={eventId}
            selected={livestreamIds.includes(eventId)}
         />
      ),
      [livestreamIds]
   )

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapperContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               {title}

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
                           selectInput={selectInput(event.id)}
                           selected={livestreamIds.includes(event.id)}
                           disableClick={isSubmitting}
                        />
                     </Grid>
                  ))}
               </Grid>
            </SteppedDialog.Content>

            <SteppedDialog.Actions sx={styles.actions}>
               <SteppedDialog.Button
                  variant="outlined"
                  color="grey"
                  onClick={handleSecondaryClick}
                  sx={styles.cancelBtn}
               >
                  {secondaryButtonMessage || "Back"}
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  onClick={handlePrimaryClick}
                  variant="contained"
                  color="secondary"
               >
                  {primaryButtonMessage || "Next"}
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobLinkLiveStreams
