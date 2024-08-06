import { Box, Grid } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useIsMobile from "components/custom-hook/useIsMobile"
import CardTopCheckBox from "components/views/common/CardTopCheckBox"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
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
   card: {
      height: { xs: "600px", md: "360px" },
      mx: { xs: 4, md: "unset" },
   },
   actions: {
      zIndex: (theme) => theme.zIndex.tooltip,
   },
})

const FIELD_NAME = "sparkIds"

type Props = {
   handlePrimaryButton?: () => void
   handleSecondaryButton?: () => void
   primaryButtonMessage?: string
   secondaryButtonMessage?: string
}

const JobLinkSparks = ({
   handlePrimaryButton,
   handleSecondaryButton,
   primaryButtonMessage,
   secondaryButtonMessage,
}: Props) => {
   const { moveToPrev, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const { data: publishedSparks } = useGroupSparks(group.groupId, {
      isPublished: true,
   })
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )
   const isMobile = useIsMobile()
   const { isSubmitting } = useCustomJobForm()

   const { watch, setValue, getValues } = useFormContext()

   const sparkIds = watch(FIELD_NAME)

   const handleCardClick = useCallback(
      (sparkId: string) => {
         if (isSubmitting) {
            return
         }

         if (sparkIds.includes(sparkId)) {
            setValue(
               FIELD_NAME,
               sparkIds.filter((id: string) => id !== sparkId)
            )
         } else {
            setValue(FIELD_NAME, [...sparkIds, sparkId])
         }
      },
      [isSubmitting, sparkIds, setValue]
   )

   const handleSecondaryClick = useCallback(() => {
      const selectedLivestreams = getValues("livestreamIds")

      // If there are no upcoming livestreams and no livestreams are selected, navigate to the FORM_ADDITIONAL_DETAILS step
      if (!groupHasUpcomingLivestreams && selectedLivestreams.length === 0) {
         if (handleSecondaryButton) {
            handleSecondaryButton()
         } else {
            goToStep(JobDialogStep.FORM_ADDITIONAL_DETAILS.key)
         }
      } else if (handleSecondaryButton) {
         handleSecondaryButton()
      }
      // Otherwise, move to the previous step
      else {
         moveToPrev()
      }
   }, [
      getValues,
      goToStep,
      groupHasUpcomingLivestreams,
      handleSecondaryButton,
      moveToPrev,
   ])

   const handlePrimaryClick = useCallback(() => {
      if (handlePrimaryButton) {
         handlePrimaryButton()
         return
      }

      const [selectedLivestreams, selectedSparks] = getValues([
         "livestreamIds",
         FIELD_NAME,
      ])

      // If at least one livestream or spark is selected, move to the preview step.
      if (selectedLivestreams.length > 0 || selectedSparks.length > 0) {
         goToStep(JobDialogStep.FORM_PREVIEW.key)
      }
      // If no content is selected, navigate to the "No Linked Content" step.
      else {
         goToStep(JobDialogStep.NO_LINKED_CONTENT.key)
      }
   }, [getValues, goToStep, handlePrimaryButton])

   const adaptGrid = publishedSparks?.length > 2 && !isMobile

   const title = useMemo(() => {
      const selectedLivestreams = getValues("livestreamIds")

      return selectedLivestreams.length > 0 ? (
         <SteppedDialog.Title sx={styles.title}>
            Link your{" "}
            <Box component="span" color="secondary.main">
               job
            </Box>{" "}
            also to Sparks
         </SteppedDialog.Title>
      ) : (
         <SteppedDialog.Title sx={styles.title}>
            Link your{" "}
            <Box component="span" color="secondary.main">
               job
            </Box>{" "}
            to Sparks
         </SteppedDialog.Title>
      )
   }, [getValues])

   const selectInput = useCallback(
      (sparkId: string) => (
         <CardTopCheckBox id={sparkId} selected={sparkIds.includes(sparkId)} />
      ),
      [sparkIds]
   )

   return (
      <SteppedDialog.Container containerSx={styles.content} withActions>
         <>
            <SteppedDialog.Content sx={styles.container}>
               {title}

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  Select at least one Spark to link to this job so it&apos;s
                  made visible to talent.
               </SteppedDialog.Subtitle>

               <Grid
                  container
                  spacing={2}
                  mt={2}
                  sx={adaptGrid ? null : styles.centerGrid}
               >
                  {publishedSparks?.map((spark) => (
                     <Grid
                        item
                        key={spark.id}
                        xs={isMobile ? 12 : adaptGrid ? 4 : 6}
                        sx={styles.card}
                     >
                        <SparkCarouselCard
                           spark={spark}
                           onClick={() => handleCardClick(spark.id)}
                           selectInput={selectInput(spark.id)}
                           selected={sparkIds.includes(spark.id)}
                           disableAutoPlay
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

export default JobLinkSparks
