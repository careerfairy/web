import { Box, Grid, Typography } from "@mui/material"
import CustomRichTextEditor from "components/util/CustomRichTextEditor"
import { datePickerDefaultStyles } from "components/views/calendar/utils"
import BrandedTextField, {
   FormBrandedTextField,
} from "components/views/common/inputs/BrandedTextField"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import GBLocale from "date-fns/locale/en-GB"
import { useFormikContext } from "formik"
import { MutableRefObject } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Briefcase } from "react-feather"
import { useSelector } from "react-redux"
import { jobsFormSelectedJobIdSelector } from "store/selectors/adminJobsSelectors"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { JobFormValues } from "./types"

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
   const { moveToPrev } = useStepper()
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const {
      values: { additionalInfo: additionalInfoValues, basicInfo },
      setFieldValue,
      errors: { additionalInfo: additionalInfoErrors = {} },
      touched: { additionalInfo: additionalInfoTouched = {} },
      submitForm,
      isSubmitting,
      dirty,
   } = useFormikContext<JobFormValues>()

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
                           {basicInfo.title}
                        </Typography>
                     </Box>
                     <Grid xs={12} item>
                        <FormBrandedTextField
                           name="additionalInfo.salary"
                           label="Salary Range"
                           placeholder="E.g., 85’000-95’000 CHF"
                           fullWidth
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <FormBrandedTextField
                           name="additionalInfo.description"
                           label="Job Description (Required)"
                           placeholder="Tell your viewers more on what to expect about this job"
                           fullWidth
                           multiline
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
                              selected={additionalInfoValues.deadline}
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
                                    name="additionalInfo.deadline"
                                    label="Application Deadline (Required)"
                                    placeholder="Insert date"
                                    fullWidth
                                    error={Boolean(
                                       additionalInfoTouched.deadline &&
                                          additionalInfoErrors.deadline
                                    )}
                                    // @ts-ignore
                                    helperText={
                                       additionalInfoTouched.deadline &&
                                       additionalInfoErrors.deadline
                                          ? additionalInfoErrors.deadline
                                          : null
                                    }
                                 />
                              }
                              onChange={(value) =>
                                 setFieldValue("additionalInfo.deadline", value)
                              }
                           />
                        </Box>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormBrandedTextField
                           name="additionalInfo.postingUrl"
                           label="Job posting URL (required)"
                           placeholder="E.g., www.careerpage.com/role"
                           fullWidth
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
                  variant="contained"
                  color="secondary"
                  onClick={submitForm}
                  loading={isSubmitting}
                  disabled={isSubmitting || !dirty}
               >
                  {selectedJobId ? "Update" : "Create"}
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobAdditionalDetails
