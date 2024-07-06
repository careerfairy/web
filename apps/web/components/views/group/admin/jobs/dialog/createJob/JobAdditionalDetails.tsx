import { Box, Grid, Typography } from "@mui/material"
import useGroupHasUpcomingLivestreams from "components/custom-hook/live-stream/useGroupHasUpcomingLivestreams"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import CustomRichTextEditor from "components/util/CustomRichTextEditor"
import { datePickerDefaultStyles } from "components/views/calendar/utils"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import GBLocale from "date-fns/locale/en-GB"
import { MutableRefObject, useCallback, useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Briefcase } from "react-feather"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { JobDialogStep } from ".."
import { additionalInfoSchema } from "./schemas"

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
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   form: {
      my: "24px",
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
   wrapperContainer: {
      height: { xs: "80dvh", md: "auto !important" },
      maxHeight: "800px",
   },
   subtitle2: {
      display: "flex",
      alignItems: { md: "center" },
      ml: 1.5,
   },
   subText: {
      fontSize: { xs: "16px", md: "18px" },
      fontWeight: "600",
      lineHeight: { xs: "24px", md: "28px" },
      color: (theme) => theme.palette.neutral[600],
      ml: 1,
   },
})

type Props = {
   quillInputRef: MutableRefObject<any>
}

const JobAdditionalDetails = ({ quillInputRef }: Props) => {
   const [stepIsValid, setStepIsValid] = useState(false)
   const { moveToPrev, goToStep } = useStepper()
   const { group } = useGroupFromState()
   const groupHasUpcomingLivestreams = useGroupHasUpcomingLivestreams(group.id)

   const {
      formState: { isSubmitting },
      watch,
      setValue,
   } = useFormContext()

   const watchedFields = watch([
      "basicInfo.title",
      "additionalInfo.salary",
      "additionalInfo.description",
      "additionalInfo.deadline",
      "additionalInfo.postingUrl",
   ])
   const fieldNames = [
      "title",
      "salary",
      "description",
      "deadline",
      "postingUrl",
   ]

   // Convert watchedFields array to an object
   const watchedFieldsObject = fieldNames.reduce((acc, fieldName, index) => {
      acc[fieldName] = watchedFields[index]
      return acc
   }, {} as any)

   const { title, deadline } = watchedFieldsObject

   // This effect validates the additional info fields and updates the step validity state
   useEffect(() => {
      const { description, deadline, postingUrl } = watchedFieldsObject

      const fieldsToValidate = {
         description,
         deadline,
         postingUrl,
      }

      setStepIsValid(
         additionalInfoSchema(quillInputRef).isValidSync(fieldsToValidate)
      )
   }, [quillInputRef, watchedFieldsObject])

   const handleNext = useCallback(() => {
      if (groupHasUpcomingLivestreams) {
         goToStep(JobDialogStep.FORM_LINKED_LIVE_STREAMS.key)
      } else if (group.publicSparks) {
         goToStep(JobDialogStep.FORM_LINKED_SPARKS.key)
      } else {
         goToStep(JobDialogStep.NO_LINKED_CONTENT.key)
      }
   }, [goToStep, group.publicSparks, groupHasUpcomingLivestreams])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapperContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <>
                  <SteppedDialog.Title sx={styles.title}>
                     Additional{" "}
                     <Box component="span" color="secondary.main">
                        details
                     </Box>
                  </SteppedDialog.Title>

                  <SteppedDialog.Subtitle sx={styles.subtitle}>
                     Complete additional details to finish and publish your job
                     listing.
                  </SteppedDialog.Subtitle>

                  <Grid container spacing={1.5} sx={styles.form}>
                     <Box sx={styles.subtitle2}>
                        <Briefcase color="grey" size={20} />
                        <Typography variant={"h6"} sx={styles.subText}>
                           {title}
                        </Typography>
                     </Box>
                     <Grid xs={12} item>
                        <ControlledBrandedTextField
                           name="additionalInfo.salary"
                           label="Salary Range"
                           fullWidth
                           disabled={isSubmitting}
                           placeholder="E.g., 85’000-95’000 CHF"
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <ControlledBrandedTextField
                           name="additionalInfo.description"
                           label="Job Description"
                           fullWidth
                           multiline
                           disabled={isSubmitting}
                           placeholder="Tell your viewers more on what to expect about this job"
                           requiredText="(required)"
                           inputRef={quillInputRef}
                           InputProps={{
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              inputComponent: CustomRichTextEditor as any,
                           }}
                        />
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <Box
                           sx={[
                              datePickerDefaultStyles.datePicker,
                              {
                                 zIndex: 99,
                                 mt: "unset",
                              },
                           ]}
                        >
                           <DatePicker
                              name="additionalInfo.deadline"
                              selected={deadline}
                              minDate={DateUtil.getTomorrowDate()}
                              dateFormat={"dd/MM/yyyy"}
                              locale={GBLocale}
                              formatWeekDay={(nameOfDay) =>
                                 nameOfDay.substr(0, 1)
                              }
                              placeholderText="Insert date"
                              shouldCloseOnSelect={true}
                              customInput={
                                 <BrandedTextField
                                    label="Application Deadline (Required)"
                                    placeholder="Insert date"
                                    fullWidth
                                 />
                              }
                              onChange={(value) =>
                                 setValue("additionalInfo.deadline", value)
                              }
                           />
                        </Box>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <ControlledBrandedTextField
                           name="additionalInfo.postingUrl"
                           label="Job posting URL"
                           fullWidth
                           requiredText="(required)"
                           disabled={isSubmitting}
                           placeholder="E.g., www.careerpage.com/role"
                        />
                     </Grid>
                  </Grid>
               </>
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
                  disabled={isSubmitting || !stepIsValid}
               >
                  Next
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobAdditionalDetails
