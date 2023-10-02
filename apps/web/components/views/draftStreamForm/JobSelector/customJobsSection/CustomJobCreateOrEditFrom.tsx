import {
   Autocomplete,
   Box,
   Button,
   CircularProgress,
   Collapse,
   FormControl,
   Grid,
   TextField,
} from "@mui/material"
import { Formik } from "formik"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
   JobType,
   jobTypeOptions,
   PublicCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import * as yup from "yup"
import { URL_REGEX } from "../../../../util/constants"
import { datePickerDefaultStyles } from "../../../calendar/utils"
import GBLocale from "date-fns/locale/en-GB"
import { sxStyles } from "../../../../../types/commonTypes"
import { v4 as uuidv4 } from "uuid"
import { useMemo } from "react"
import { Timestamp } from "../../../../../data/firebase/FirebaseInstance"

const schema = yup.object().shape({
   title: yup.string().required("Required"),
   description: yup.string().required("Required"),
   salary: yup.string(),
   deadline: yup
      .date()
      .nullable()
      .min(new Date(), `The date must be in the future`),
   postingUrl: yup
      .string()
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required("Required"),
   jobType: yup.string().required("Required"),
})

/**
 * Ensure that the 'jobType' field is initialized as an empty string at the start of any form.
 * Additionally, use the 'Date' data type instead of 'Timestamp' within the form.
 */
type CustomJobObj = {
   jobType: string
   deadline: Date
} & Omit<PublicCustomJob, "jobType" | "deadline">

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
   wrapper: {
      p: 3,
      mt: 3,
      border: "1px solid #BCBCBC",
      borderRadius: 2,
   },
   actions: {
      display: "flex",
      justifyContent: "end",
      mt: 1,
   },
   btn: {
      height: 40,
      width: 105,
      textTransform: "none",
   },
})

type Props = {
   groupId?: string
   handleCreateNewJob: (customJob: PublicCustomJob) => void
   handleCancelCreateNewJob: () => void
   job?: PublicCustomJob
}

const CustomJobCreateOrEditFrom = ({
   groupId,
   handleCreateNewJob,
   handleCancelCreateNewJob,
   job,
}: Props) => {
   const initialValues: CustomJobObj = useMemo(() => {
      // If the 'job' field is received, it indicates the intention to edit an existing job.
      if (job) {
         return {
            ...job,
            deadline: job.deadline.toDate(),
         }
      }

      return {
         id: uuidv4(),
         groupId: groupId,
         title: "",
         salary: "",
         description: "",
         deadline: null,
         postingUrl: "",
         jobType: "",
      }
   }, [groupId, job])

   return (
      <Box sx={styles.wrapper}>
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
               const formatValues: PublicCustomJob = {
                  ...values,
                  jobType: values.jobType as JobType,
                  deadline: Timestamp.fromDate(values.deadline),
               }

               handleCreateNewJob(formatValues)

               setSubmitting(false)
               resetForm()
            }}
         >
            {({
               values,
               errors,
               touched,
               handleBlur,
               handleSubmit,
               isSubmitting,
               setFieldValue,
               resetForm,
            }) => (
               <form>
                  <Grid container spacing={2}>
                     <Grid xs={12} item>
                        <FormControl fullWidth>
                           <TextField
                              name={`title`}
                              id={`title`}
                              placeholder="Eg. Spfware Engineer"
                              variant="outlined"
                              fullWidth
                              disabled={isSubmitting}
                              onBlur={handleBlur}
                              label="Job title (Required)"
                              inputProps={{ maxLength: 70 }}
                              value={values.title}
                              error={Boolean(errors.title && touched.title)}
                              onChange={({ currentTarget: { value, name } }) =>
                                 setFieldValue(name, value)
                              }
                           />
                           <Collapse
                              in={Boolean(errors.title && touched.title)}
                              style={{ color: "red" }}
                           >
                              {errors.title}
                           </Collapse>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormControl fullWidth>
                           <TextField
                              name={`salary`}
                              id={`salary`}
                              placeholder="E.g. 85’000-95’000 CHF"
                              variant="outlined"
                              fullWidth
                              disabled={isSubmitting}
                              onBlur={handleBlur}
                              label="Salary Range"
                              inputProps={{ maxLength: 70 }}
                              value={values.salary}
                              error={Boolean(errors.salary && touched.salary)}
                              onChange={({ currentTarget: { value, name } }) =>
                                 setFieldValue(name, value)
                              }
                           />
                           <Collapse
                              in={Boolean(errors.salary && touched.salary)}
                              style={{ color: "red" }}
                           >
                              {errors.salary}
                           </Collapse>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormControl fullWidth>
                           <Autocomplete
                              id={`jobType`}
                              options={jobTypeOptions}
                              isOptionEqualToValue={(option, value) =>
                                 option.value === value.value
                              }
                              getOptionLabel={(option) => option.label || ""}
                              value={getValue(values.jobType)}
                              onChange={(
                                 _,
                                 newValue: { value: string; label: string }
                              ) => setFieldValue("jobType", newValue?.value)}
                              renderInput={(params) => (
                                 <TextField
                                    {...params}
                                    label="Job Type (Required)"
                                    variant="outlined"
                                    error={Boolean(
                                       errors.jobType && touched.jobType
                                    )}
                                    fullWidth
                                 />
                              )}
                           />
                           <Collapse
                              in={Boolean(errors.jobType && touched.jobType)}
                              style={{ color: "red" }}
                           >
                              {errors.jobType}
                           </Collapse>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} item>
                        <FormControl fullWidth>
                           <TextField
                              className="multiLineInput"
                              name={`description`}
                              id={`description`}
                              placeholder="Tell your viewers more on what to expect about this job"
                              variant="outlined"
                              fullWidth
                              multiline
                              disabled={isSubmitting}
                              onBlur={handleBlur}
                              label="Job Description (Required)"
                              maxRows={10}
                              inputProps={{ maxLength: 5000 }}
                              value={values.description}
                              error={Boolean(
                                 errors.description && touched.description
                              )}
                              onChange={({ currentTarget: { value, name } }) =>
                                 setFieldValue(name, value)
                              }
                              sx={{ minHeight: "95px", textAlign: "start" }}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.description && touched.description
                              )}
                              style={{ color: "red" }}
                           >
                              {errors.description}
                           </Collapse>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormControl fullWidth>
                           <Box
                              sx={[
                                 datePickerDefaultStyles.datePicker,
                                 styles.datePicker,
                              ]}
                           >
                              <DatePicker
                                 selected={values.deadline}
                                 minDate={new Date()}
                                 dateFormat={"dd/MM/yyyy"}
                                 locale={GBLocale}
                                 formatWeekDay={(nameOfDay) =>
                                    nameOfDay.substr(0, 1)
                                 }
                                 placeholderText="Insert date"
                                 shouldCloseOnSelect={true}
                                 customInput={
                                    <TextField
                                       name={`deadline`}
                                       id={`deadline`}
                                       fullWidth
                                       variant="outlined"
                                       label="Application Deadline"
                                       placeholder="Insert date"
                                    />
                                 }
                                 onChange={(value) =>
                                    setFieldValue("deadline", value)
                                 }
                              />
                           </Box>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} md={6} item>
                        <FormControl fullWidth>
                           <TextField
                              name={`postingUrl`}
                              id={`postingUrl`}
                              placeholder="E.g., www.careerpage.com/role"
                              variant="outlined"
                              fullWidth
                              disabled={isSubmitting}
                              onBlur={handleBlur}
                              label="Job posting URL (required)"
                              inputProps={{ maxLength: 70 }}
                              value={values.postingUrl}
                              error={Boolean(
                                 errors.postingUrl && touched.postingUrl
                              )}
                              onChange={({ currentTarget: { value, name } }) =>
                                 setFieldValue(name, value)
                              }
                           />
                           <Collapse
                              in={Boolean(
                                 errors.postingUrl && touched.postingUrl
                              )}
                              style={{ color: "red" }}
                           >
                              {errors.postingUrl}
                           </Collapse>
                        </FormControl>
                     </Grid>

                     <Grid xs={12} item sx={styles.actions}>
                        <Button
                           sx={styles.btn}
                           size={"small"}
                           variant="outlined"
                           color="grey"
                           disabled={isSubmitting}
                           onClick={() => {
                              handleCancelCreateNewJob()
                              resetForm()
                           }}
                        >
                           Cancel
                        </Button>

                        <Button
                           sx={{ ...styles.btn, ml: 2 }}
                           variant="contained"
                           color="secondary"
                           disabled={isSubmitting || !touched}
                           startIcon={
                              isSubmitting ? (
                                 <CircularProgress size={20} color="inherit" />
                              ) : null
                           }
                           onClick={() => handleSubmit()}
                        >
                           {isSubmitting ? "Creating" : "Create"}
                        </Button>
                     </Grid>
                  </Grid>
               </form>
            )}
         </Formik>
      </Box>
   )
}

const getValue = (value: string) => ({ value: value, label: value })

export default CustomJobCreateOrEditFrom
