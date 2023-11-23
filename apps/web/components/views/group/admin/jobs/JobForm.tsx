import { useFormikContext } from "formik"
import { JobFormValues } from "./JobFormDialog"
import { Box, Grid } from "@mui/material"
import DatePicker from "react-datepicker"
import BrandedTextField, {
   BrandedTextFieldField,
} from "../../../common/inputs/BrandedTextField"
import { jobTypeOptions } from "@careerfairy/shared-lib/groups/customJobs"
import { getTextFieldProps } from "../../../../helperFunctions/streamFormFunctions"
import BrandedAutocomplete from "../../../common/inputs/BrandedAutocomplete"
import { datePickerDefaultStyles } from "../../../calendar/utils"
import GBLocale from "date-fns/locale/en-GB"

const JobForm = () => {
   const { values, setFieldValue, errors, touched } =
      useFormikContext<JobFormValues>()

   return (
      <Grid container spacing={2}>
         <Grid xs={12} item>
            <BrandedTextFieldField
               name="title"
               label="Job title (required)"
               placeholder="E.g., Mechanical Engineer"
               fullWidth
            />
         </Grid>

         <Grid xs={12} md={6} item>
            <BrandedTextFieldField
               name="salary"
               label="Salary Range"
               placeholder="E.g., 85’000-95’000 CHF"
               fullWidth
            />
         </Grid>
         <Grid xs={12} md={6} item>
            <BrandedAutocomplete
               id={"jobType"}
               options={jobTypeOptions}
               defaultValue={values.jobType}
               getOptionLabel={(option) => option.label || ""}
               isOptionEqualToValue={(option, value) =>
                  option.value === value.value
               }
               value={values.jobType ? getValue(values.jobType) : null}
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
            <BrandedTextFieldField
               name="description"
               label="Job Description (Required)"
               placeholder="Tell your viewers more on what to expect about this job"
               fullWidth
               multiline
               rows={7}
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
                  minDate={new Date()}
                  dateFormat={"dd/MM/yyyy"}
                  locale={GBLocale}
                  formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 1)}
                  placeholderText="Insert date"
                  shouldCloseOnSelect={true}
                  customInput={
                     <BrandedTextField
                        name="deadline"
                        label="Application Deadline"
                        placeholder="Insert date"
                        fullWidth
                     />
                  }
                  onChange={(value) => setFieldValue("deadline", value)}
               />
            </Box>
         </Grid>
         <Grid xs={12} md={6} item>
            <BrandedTextFieldField
               name="postingUrl"
               label="Job posting URL (required)"
               placeholder="E.g., www.careerpage.com/role"
               fullWidth
            />
         </Grid>
      </Grid>
   )
}

const getValue = (value: string) => ({ value: value, label: value })

export default JobForm
