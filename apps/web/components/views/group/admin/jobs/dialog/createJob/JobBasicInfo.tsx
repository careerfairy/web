import { jobTypeOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid } from "@mui/material"
import { getTextFieldProps } from "components/helperFunctions/streamFormFunctions"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useFormikContext } from "formik"
import { sxStyles } from "types/commonTypes"
import { JobFormValues } from "../CustomJobFormikProvider"

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
   },
})

const JobBasicInfo = () => {
   const { moveToNext } = useStepper()
   const { values, setFieldValue, errors, touched } =
      useFormikContext<JobFormValues>()

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
                     Job basic{" "}
                     <Box component="span" color="secondary.main">
                        info
                     </Box>
                  </SteppedDialog.Title>

                  <SteppedDialog.Subtitle sx={styles.subtitle}>
                     Provide fundamental details about the job opening.
                  </SteppedDialog.Subtitle>

                  <Grid container spacing={2} sx={styles.form}>
                     <Grid xs={12} item>
                        <FormBrandedTextField
                           name="title"
                           label="Job Title (required)"
                           placeholder="E.g., Mechanical Engineer"
                           fullWidth
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <BrandedAutocomplete
                           id={"jobType"}
                           options={jobTypeOptions}
                           defaultValue={values.jobType}
                           getOptionLabel={(option) => option.label || ""}
                           isOptionEqualToValue={(option, value) =>
                              option.value === value.value
                           }
                           value={getValue(values.jobType)}
                           disableClearable
                           textFieldProps={getTextFieldProps(
                              "Job Type (Required)",
                              "jobType",
                              touched,
                              errors
                           )}
                           onChange={(_, selected) =>
                              setFieldValue("jobType", selected?.value)
                           }
                        />
                     </Grid>

                     <Grid xs={12} item>
                        {/* TODO-GS add here the new tag input */}
                     </Grid>
                  </Grid>
               </>
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
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

const getValue = (value: string) =>
   value ? { value: value, label: value } : null

export default JobBasicInfo
