import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import CustomJobAdminDetails from "components/views/jobs/components/b2b/CustomJobAdminDetails"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { Timestamp } from "firebase/firestore"
import { useCallback, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { JobDialogStep } from ".."
import { useCustomJobForm } from "../CustomJobFormProvider"
import { JobFormValues } from "./schemas"

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
   },
   content: {
      mt: 1,
   },
   wrapperContainer: {
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
   previewWrapper: {
      mt: 3,
      background: "#F7F8FC",
      borderRadius: "15px",
   },
})

const JobFormPreview = () => {
   const { group } = useGroupFromState()
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(
      group.groupId
   )
   const { goToStep } = useStepper()
   const { handleSubmit, isSubmitting } = useCustomJobForm()
   const { getValues } = useFormContext()

   const fieldsValues = getValues([
      "basicInfo.title",
      "basicInfo.jobType",
      "basicInfo.businessTags",
      "additionalInfo.description",
      "additionalInfo.salary",
      "additionalInfo.deadline",
      "livestreamIds",
      "sparkIds",
      "basicInfo.jobLocation",
      "basicInfo.workplace",
   ])

   const fieldNames = [
      "title",
      "jobType",
      "businessTags",
      "description",
      "salary",
      "deadline",
      "livestreamIds",
      "sparkIds",
      "jobLocation",
      "workplace",
   ]

   // Convert fieldsValues array to an object
   const fieldValuesObject = fieldNames.reduce((acc, fieldName, index) => {
      acc[fieldName] = fieldsValues[index]
      return acc
   }, {} as any)

   const handlePrevClickV2 = useCallback(() => {
      if (group.publicSparks) {
         goToStep(JobDialogStep.FORM_LINKED_SPARKS.key)
      } else if (groupHasUpcomingLivestreams) {
         goToStep(JobDialogStep.FORM_LINKED_LIVE_STREAMS.key)
      } else {
         goToStep(JobDialogStep.FORM_ADDITIONAL_DETAILS.key)
      }
   }, [goToStep, group.publicSparks, groupHasUpcomingLivestreams])

   const previewJob = useMemo<CustomJob>(() => {
      const {
         deadline,
         jobType,
         businessTags,
         livestreamIds,
         sparkIds,
         jobLocation,
         workplace,
      } = fieldValuesObject

      const businessTagsValues: string[] = businessTags?.map(
         (el: OptionGroup) => el.id
      )

      return {
         ...fieldValuesObject,
         jobType: jobType ? jobType.value : null,
         deadline: Timestamp.fromDate(deadline),
         businessFunctionsTagIds: businessTagsValues,
         livestreams: livestreamIds,
         sparks: sparkIds,
         groupId: group.groupId,
         jobLocation: jobLocation?.map((location) => ({
            id: location.id,
            name: location.value,
         })),
         workplace: workplace,
      }
   }, [fieldValuesObject, group])

   const onClick = useCallback(() => {
      const values = getValues() as JobFormValues

      handleSubmit(values)
   }, [getValues, handleSubmit])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapperContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <SteppedDialog.Title sx={styles.title}>
                  Review your{" "}
                  <Box component="span" color="secondary.main">
                     job details
                  </Box>
               </SteppedDialog.Title>
               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  You&apos;re almost there! Just make sure that everything is in
                  place
               </SteppedDialog.Subtitle>

               <Box sx={styles.previewWrapper}>
                  <CustomJobAdminDetails
                     job={previewJob}
                     companyName={group.universityName}
                     companyLogoUrl={group.logoUrl}
                  />
               </Box>
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <SteppedDialog.Button
                  variant="outlined"
                  color="grey"
                  onClick={handlePrevClickV2}
                  sx={styles.cancelBtn}
                  disabled={isSubmitting}
               >
                  Back
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  variant="contained"
                  color="secondary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={onClick}
               >
                  Publish job
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobFormPreview
