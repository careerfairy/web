import { BusinessFunctionsTagValues } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJobWorkplace,
   jobTypeOptions,
   workplaceOptions,
   workplaceOptionsMap,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Grid } from "@mui/material"
import { useLocationSearch } from "components/custom-hook/countries/useLocationSearch"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { useCustomJobForm } from "../CustomJobFormProvider"
import { basicInfoSchema } from "./schemas"

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
   wrapperContainer: {
      width: { md: "700px" },
      height: { xs: "auto", md: "auto !important" },
   },
   listBox: {
      py: 0,
      backgroundColor: "white",
      borderRadius: "8px",
      my: 1.5,
      boxShadow: {
         sm: "none",
         md: "0px 4px 16px rgba(0, 0, 0, 0.08)",
      },
      "& .MuiAutocomplete-option": {
         p: "16px",
      },
   },
})

const JobBasicInfo = () => {
   const [stepIsValid, setStepIsValid] = useState(false)

   const { moveToNext } = useStepper()
   const { watch, setValue } = useFormContext()

   const { isSubmitting } = useCustomJobForm()

   const watchFields = watch([
      "basicInfo.title",
      "basicInfo.jobType",
      "basicInfo.businessTags",
      "basicInfo.jobLocation",
      "basicInfo.workplace",
   ])

   const { data: locationOptions = [], isLoading: isSearching } =
      useLocationSearch()

   const transformedLocationOptions = locationOptions.map((option) => ({
      id: option.id,
      value: option.name,
   }))

   // This effect validates the basic info fields and updates the step validity state
   useEffect(() => {
      const [title, jobType, businessTags, jobLocation, workplace] = watchFields

      const fieldsToValidate = {
         title,
         jobType,
         businessTags,
         jobLocation,
         workplace,
      }

      setStepIsValid(basicInfoSchema.isValidSync(fieldsToValidate))
   }, [watchFields])

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
                        <ControlledBrandedTextField
                           name="basicInfo.title"
                           label="Job Title"
                           fullWidth
                           requiredText="(required)"
                           disabled={isSubmitting}
                           placeholder="E.g., Mechanical Engineer"
                           // InputProps={
                           //    {
                           //       sx: {
                           //          height: "72px"
                           //       }
                           //    }
                           // }
                        />
                     </Grid>
                     <Grid xs={12} item>
                        <ControlledBrandedAutoComplete
                           label="Business function"
                           name={"basicInfo.businessTags"}
                           options={BusinessFunctionsTagValues}
                           multiple
                           limit={5}
                           showCheckbox
                           autocompleteProps={{
                              id: "businessTags",
                              disabled: isSubmitting,
                              autoHighlight: true,
                              disableCloseOnSelect: true,
                              getOptionLabel: (option: any) =>
                                 option.name || "",
                              ChipProps: { color: "secondary" },
                           }}
                           textFieldProps={{
                              requiredText: "(required)",
                              placeholder: "Select an option",
                              sx: BaseStyles.chipInput,
                           }}
                        />
                     </Grid>
                     <Grid xs={12} item>
                        <ControlledBrandedAutoComplete
                           label={"Job location"}
                           name={"basicInfo.jobLocation"}
                           options={transformedLocationOptions}
                           multiple
                           showCheckbox
                           textFieldProps={{
                              requiredText: null,
                              placeholder: "Insert a location",
                              sx: BaseStyles.chipInput,
                           }}
                           loading={isSearching}
                           autocompleteProps={{
                              id: "locationSearch",
                              autoHighlight: true,
                              disableCloseOnSelect: true,
                              disabled: isSubmitting,
                              disableClearable: true,
                              loadingText: "Searching locations...",
                              selectOnFocus: false,
                              PaperComponent: ({ children }) => (
                                 <Box>{children}</Box>
                              ),
                              ListboxProps: {
                                 sx: styles.listBox,
                              },
                           }}
                        />
                     </Grid>
                     <Grid xs={12} item>
                        <ControlledBrandedAutoComplete
                           label="Workplace"
                           name="basicInfo.workplace"
                           options={workplaceOptions}
                           autocompleteProps={{
                              id: "workplace",
                              disabled: isSubmitting,
                              autoHighlight: true,
                              disableClearable: true,
                              PaperComponent: ({ children }) => (
                                 <Box>{children}</Box>
                              ),
                              ListboxProps: {
                                 sx: styles.listBox,
                              },
                              getOptionLabel(option) {
                                 if (typeof option === "string")
                                    return (
                                       workplaceOptionsMap[
                                          option as CustomJobWorkplace
                                       ]?.label || ""
                                    )
                                 return option?.label || ""
                              },
                              onChange: (
                                 e,
                                 value: {
                                    id: CustomJobWorkplace
                                    value: CustomJobWorkplace
                                    label: string
                                 }
                              ) => {
                                 e.preventDefault()
                                 e.stopPropagation()

                                 setValue("basicInfo.workplace", value?.id)
                              },
                           }}
                        />
                     </Grid>
                     <Grid xs={12} item>
                        <ControlledBrandedAutoComplete
                           label="Job Type"
                           name="basicInfo.jobType"
                           options={jobTypeOptions}
                           autocompleteProps={{
                              id: "jobType",
                              disabled: isSubmitting,
                              autoHighlight: true,
                              disableClearable: true,
                           }}
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
                  disabled={!stepIsValid}
               >
                  Next
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobBasicInfo
