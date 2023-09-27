import React, { FC } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
   Grid,
   Typography,
   Collapse,
   TextField,
   FormControl,
   Fab,
   Autocomplete,
   Box,
} from "@mui/material"
import { FormikValues } from "formik"
import { sxStyles } from "../../../../types/commonTypes"
import { handleDeleteSection } from "../../../helperFunctions/streamFormFunctions"
import DeleteIcon from "@mui/icons-material/Delete"
import {
   jobTypeOptions,
   PublicCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import GBLocale from "date-fns/locale/en-GB"
import { datePickerDefaultStyles } from "../../calendar/utils"

const styles = sxStyles({
   header: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
   },
   datePicker: {
      zIndex: 99,
      mt: "unset",
   },
})

type JobsFormSectionProps = {
   index: number
   setValues: (values: any) => void
   objectKey: string
   titleError: () => void
   salaryError: () => void
   descriptionError: () => void
   postingUrlError: () => void
   jobTypeError: () => void
   job: PublicCustomJob
   values: FormikValues
   setFieldValue: any // handle this type
   isSubmitting: boolean
   handleBlur: (e: any) => void
}

const JobsInfoSection: FC<JobsFormSectionProps> = ({
   index,
   setValues,
   objectKey,
   titleError,
   salaryError,
   descriptionError,
   postingUrlError,
   jobTypeError,
   job,
   values,
   setFieldValue,
   isSubmitting,
   handleBlur,
}) => {
   return (
      <Grid xs={12} item>
         <Grid container xs={12} spacing={2}>
            <Grid md={12} sx={styles.header} item>
               <Typography fontWeight="bold" variant="h5">
                  Job opening {index + 1}
               </Typography>

               <Fab
                  size="small"
                  color="secondary"
                  onClick={() =>
                     handleDeleteSection(
                        "customJobs",
                        objectKey,
                        values,
                        setValues
                     )
                  }
               >
                  <DeleteIcon />
               </Fab>
            </Grid>

            <Grid xs={12} id={objectKey} item>
               <FormControl fullWidth>
                  <TextField
                     name={`customJobs.${objectKey}.title`}
                     id={`customJobs.${objectKey}.title`}
                     placeholder="Eg. Spfware Engineer"
                     variant="outlined"
                     fullWidth
                     disabled={isSubmitting}
                     onBlur={handleBlur}
                     label="Job title (Required)"
                     inputProps={{ maxLength: 70 }}
                     value={job.title}
                     error={Boolean(titleError)}
                     onChange={({ currentTarget: { value } }) =>
                        setFieldValue(`customJobs.${objectKey}.title`, value)
                     }
                  />
                  <Collapse in={Boolean(titleError)} style={{ color: "red" }}>
                     {titleError}
                  </Collapse>
               </FormControl>
            </Grid>

            <Grid xs={12} md={6} id={objectKey} item>
               <FormControl fullWidth>
                  <TextField
                     name={`customJobs.${objectKey}.salary`}
                     id={`customJobs.${objectKey}.salary`}
                     placeholder="E.g. 85’000-95’000 CHF"
                     variant="outlined"
                     fullWidth
                     disabled={isSubmitting}
                     onBlur={handleBlur}
                     label="Salary Range"
                     inputProps={{ maxLength: 70 }}
                     value={job.salary}
                     error={Boolean(salaryError)}
                     onChange={({ currentTarget: { value } }) =>
                        setFieldValue(`customJobs.${objectKey}.salary`, value)
                     }
                  />
                  <Collapse in={Boolean(salaryError)} style={{ color: "red" }}>
                     {salaryError}
                  </Collapse>
               </FormControl>
            </Grid>

            <Grid xs={12} md={6} id={objectKey} item>
               <FormControl fullWidth>
                  <Autocomplete
                     id={`customJobs.${objectKey}.jobType`}
                     options={jobTypeOptions}
                     isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                     }
                     getOptionLabel={(option) => option.label || ""}
                     value={getValue(job.jobType)}
                     onChange={(
                        value,
                        newValue: { value: string; label: string }
                     ) =>
                        setFieldValue(
                           `customJobs.${objectKey}.jobType`,
                           newValue?.value
                        )
                     }
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label="Job Type (Required)"
                           variant="outlined"
                           error={Boolean(jobTypeError)}
                           fullWidth
                        />
                     )}
                  />
                  <Collapse in={Boolean(jobTypeError)} style={{ color: "red" }}>
                     {jobTypeError}
                  </Collapse>
               </FormControl>
            </Grid>

            <Grid xs={12} id={objectKey} item>
               <FormControl fullWidth>
                  <TextField
                     className="multiLineInput"
                     name={`customJobs.${objectKey}.description`}
                     id={`customJobs.${objectKey}.description`}
                     placeholder="Tell your viewers more on what to expect about this job"
                     variant="outlined"
                     fullWidth
                     multiline
                     disabled={isSubmitting}
                     onBlur={handleBlur}
                     label="Job Description (Required)"
                     maxRows={10}
                     inputProps={{ maxLength: 5000 }}
                     value={job.description}
                     error={Boolean(descriptionError)}
                     onChange={({ currentTarget: { value } }) =>
                        setFieldValue(
                           `customJobs.${objectKey}.description`,
                           value
                        )
                     }
                     sx={{ minHeight: "95px", textAlign: "start" }}
                  />
                  <Collapse
                     in={Boolean(descriptionError)}
                     style={{ color: "red" }}
                  >
                     {descriptionError}
                  </Collapse>
               </FormControl>
            </Grid>

            <Grid xs={12} md={6} id={objectKey} item>
               <FormControl fullWidth>
                  <Box
                     sx={[
                        datePickerDefaultStyles.datePicker,
                        styles.datePicker,
                     ]}
                  >
                     <DatePicker
                        selected={job.deadline}
                        onChange={(value) =>
                           setFieldValue(
                              `customJobs.${objectKey}.deadline`,
                              new Date(value)
                           )
                        }
                        minDate={new Date()}
                        dateFormat={"dd/MM/yyyy"}
                        locale={GBLocale}
                        formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 1)}
                        placeholderText="Insert date"
                        shouldCloseOnSelect={true}
                        customInput={
                           <TextField
                              name={`customJobs.${objectKey}.deadline`}
                              id={`customJobs.${objectKey}.deadline`}
                              fullWidth
                              variant="outlined"
                              label="Application Deadline"
                              placeholder="Insert date"
                           />
                        }
                     />
                  </Box>
               </FormControl>
            </Grid>

            <Grid xs={12} md={6} id={objectKey} item>
               <FormControl fullWidth>
                  <TextField
                     name={`customJobs.${objectKey}.postingUrl`}
                     id={`customJobs.${objectKey}.postingUrl`}
                     placeholder="E.g., www.careerpage.com/role"
                     variant="outlined"
                     fullWidth
                     disabled={isSubmitting}
                     onBlur={handleBlur}
                     label="Job posting URL (required)"
                     inputProps={{ maxLength: 70 }}
                     value={job.postingUrl}
                     error={Boolean(postingUrlError)}
                     onChange={({ currentTarget: { value } }) =>
                        setFieldValue(
                           `customJobs.${objectKey}.postingUrl`,
                           value
                        )
                     }
                  />
                  <Collapse
                     in={Boolean(postingUrlError)}
                     style={{ color: "red" }}
                  >
                     {postingUrlError}
                  </Collapse>
               </FormControl>
            </Grid>
         </Grid>
      </Grid>
   )
}

export default JobsInfoSection

const getValue = (value: string) => ({ value: value, label: value })
