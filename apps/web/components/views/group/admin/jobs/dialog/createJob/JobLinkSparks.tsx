import { Box, Grid } from "@mui/material"
import useGroupSparks from "components/custom-hook/spark/useGroupSparks"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"

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

const FIELD_NAME = "sparkIds"

const JobLinkSparks = () => {
   const { moveToPrev, moveToNext } = useStepper()
   const { group } = useGroupFromState()
   const { data: publishedSparks } = useGroupSparks(group.id, {
      isPublished: true,
   })

   const {
      formState: { isSubmitting },
      watch,
      setValue,
   } = useFormContext()

   const sparkIds = watch(FIELD_NAME)

   const handleCardClick = useCallback(
      (sparkId: string) => {
         if (sparkIds.includes(sparkId)) {
            setValue(
               FIELD_NAME,
               sparkIds.filter((id: string) => id !== sparkId)
            )
         } else {
            setValue(FIELD_NAME, [...sparkIds, sparkId])
         }
      },
      [sparkIds, setValue]
   )

   const adaptGrid = publishedSparks?.length > 2

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
                  to Sparks
               </SteppedDialog.Title>

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
                        xs={adaptGrid ? 4 : 6}
                        sx={{ height: "360px" }}
                     >
                        <SparkCarouselCard
                           spark={spark}
                           onClick={() => handleCardClick(spark.id)}
                           isSelectable
                           selected={sparkIds.includes(spark.id)}
                           disableAutoPlay
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
                  onClick={moveToNext}
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

export default JobLinkSparks
