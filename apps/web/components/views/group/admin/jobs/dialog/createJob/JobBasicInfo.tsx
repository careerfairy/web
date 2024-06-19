import { BusinessFunctionsTagValues } from "@careerfairy/shared-lib/constants/tags"
import { jobTypeOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getTextFieldProps } from "components/helperFunctions/streamFormFunctions"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useFormikContext } from "formik"
import { sxStyles } from "types/commonTypes"
import { JobDialogStepEnum } from ".."
import { basicInfoSchema } from "../CustomJobFormikProvider"
import { JobFormValues } from "./types"

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
      height: { xs: "unset", md: "auto !important" },
   },
   mobileDialog: {
      top: "calc(100dvh - 480px)",
   },
})

const JobBasicInfo = () => {
   const { moveToNext, currentStep } = useStepper()
   const isMobile = useIsMobile()
   const {
      values: { basicInfo: basicInfoValues },
      setFieldValue,
      errors: { basicInfo: basicInfoErrors = {} },
      touched: { basicInfo: basicInfoTouched = {} },
   } = useFormikContext<JobFormValues>()

   const dialogElement: HTMLElement = document.querySelector('[role="dialog"]')

   if (dialogElement) {
      dialogElement.style.top =
         isMobile && currentStep === JobDialogStepEnum.FORM_BASIC_INFO
            ? styles.mobileDialog.top
            : "revert-layer"
   }

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
                           name="basicInfo.title"
                           label="Job Title (required)"
                           placeholder="E.g., Mechanical Engineer"
                           fullWidth
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <BrandedAutocomplete
                           id={"jobType"}
                           options={jobTypeOptions}
                           defaultValue={basicInfoValues.jobType}
                           getOptionLabel={(option) => option.label || ""}
                           isOptionEqualToValue={(option, value) =>
                              option.value === value.value
                           }
                           value={getValue(basicInfoValues.jobType)}
                           disableClearable
                           textFieldProps={getTextFieldProps(
                              "Job Type",
                              "jobType",
                              basicInfoTouched,
                              basicInfoErrors
                           )}
                           onChange={(_, selected) =>
                              setFieldValue(
                                 "basicInfo.jobType",
                                 selected?.value
                              )
                           }
                        />
                     </Grid>

                     <Grid xs={12} item>
                        <BrandedAutocomplete
                           id={"businessTags"}
                           options={BusinessFunctionsTagValues}
                           defaultValue={basicInfoValues.businessTags}
                           getOptionLabel={(option) => option.name || ""}
                           isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                           }
                           value={basicInfoValues.businessTags}
                           disableCloseOnSelect
                           multiple
                           limit={5}
                           textFieldProps={getTextFieldProps(
                              "Business function (Required)",
                              "businessTags",
                              basicInfoTouched,
                              basicInfoErrors
                           )}
                           onChange={(_, selected) =>
                              setFieldValue("basicInfo.businessTags", selected)
                           }
                        />
                     </Grid>
                  </Grid>
               </>
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <SteppedDialog.Button
                  variant="contained"
                  color="secondary"
                  onClick={moveToNext}
                  disabled={!basicInfoSchema.isValidSync(basicInfoValues)}
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
