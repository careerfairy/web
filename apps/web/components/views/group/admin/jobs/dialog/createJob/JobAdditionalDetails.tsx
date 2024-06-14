import { Box, Grid } from "@mui/material"
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
import { FC, MutableRefObject } from "react"
import DatePicker from "react-datepicker"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { JobFormValues } from "../CustomJobFormikProvider"

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
      my: "40px",
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
      height: { md: "auto !important" },
      maxHeight: "800px",
   },
})

type Props = {
   quillInputRef: MutableRefObject<undefined>
}

const JobAdditionalDetails: FC<Props> = ({ quillInputRef }) => {
   const { moveToNext, moveToPrev } = useStepper()
   const { values, setFieldValue, errors } = useFormikContext<JobFormValues>()

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

                  <Grid container spacing={2} sx={styles.form}>
                     <Grid xs={12} item>
                        <FormBrandedTextField
                           name="salary"
                           label="Salary Range"
                           placeholder="E.g., 85’000-95’000 CHF"
                           fullWidth
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <FormBrandedTextField
                           name="description"
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
                              selected={values.deadline}
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
                                    name="deadline"
                                    label="Application Deadline (Required)"
                                    placeholder="Insert date"
                                    fullWidth
                                    error={Boolean(errors.deadline)}
                                    // @ts-ignore
                                    helperText={
                                       errors.deadline ? errors.deadline : null
                                    }
                                 />
                              }
                              onChange={(value) =>
                                 setFieldValue("deadline", value)
                              }
                           />
                        </Box>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormBrandedTextField
                           name="postingUrl"
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
                  onClick={moveToNext}
               >
                  Next
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobAdditionalDetails
