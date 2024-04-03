import React, { memo } from "react"
import { Collapse, Grid, TextField } from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { useRef } from "react"
import CustomRichTextEditor from "components/util/CustomRichTextEditor"



const JobPostingCtaForm = memo(
   ({ formik, maxMessageLength, onEntered, onExited }) => {
      const now = new Date()
      const quillInputRef = useRef()

      return (
         <Grid container spacing={3}>
            <Grid xs={12} item>
               <Collapse unmountOnExit in={true}>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="jobTitle"
                     name="jobData.jobTitle"
                     disabled={formik.isSubmitting}
                     autoFocus={true}
                     inputProps={{
                        maxLength: maxMessageLength,
                     }}
                     placeholder="Mechanical Engineer"
                     label="Job Title*"
                     value={formik.values.jobData.jobTitle}
                     onChange={formik.handleChange}
                     error={
                        Boolean(formik.touched.jobData?.jobTitle) &&
                        Boolean(formik.errors.jobData?.jobTitle)
                     }
                     helperText={
                        Boolean(formik.touched.jobData?.jobTitle) &&
                        Boolean(formik.errors.jobData?.jobTitle)
                     }
                  />
               </Collapse>
            </Grid>

            <Grid xs={12} sm={8} item>
               <Collapse unmountOnExit in={true}>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="salary"
                     name="jobData.salary"
                     disabled={formik.isSubmitting}
                     autoFocus={true}
                     inputProps={{
                        maxLength: maxMessageLength,
                     }}
                     placeholder="CHF - 82'000"
                     label="Salary"
                     value={formik.values.jobData.salary}
                     onChange={formik.handleChange}
                     error={
                        Boolean(formik.touched.jobData?.salary) &&
                        Boolean(formik.errors.jobData?.salary)
                     }
                     helperText={
                        Boolean(formik.touched.jobData?.salary) &&
                        Boolean(formik.errors.jobData?.salary)
                     }
                  />
               </Collapse>
            </Grid>
            <Grid xs={12} sm={4} item>
               <Collapse unmountOnExit in={true}>
                  <DateTimePicker
                     id="applicationDeadline"
                     clearable
                     disablePast
                     slots={{
                        textField: (params) => (
                           <TextField fullWidth {...params} />
                        ),
                     }}
                     label="Application deadline"
                     value={formik.values.jobData.applicationDeadline}
                     name="jobData.applicationDeadline"
                     onChange={(value) => {
                        const newValue = value ? new Date(value) : null
                        formik.setFieldValue(
                           "jobData.applicationDeadline",
                           newValue,
                           true
                        )
                     }}
                     disabled={formik.isSubmitting}
                     minDate={now}
                     inputVariant="outlined"
                     error={
                        Boolean(formik.touched.jobData?.applicationDeadline) &&
                        Boolean(formik.errors.jobData?.applicationDeadline)
                     }
                     helperText={
                        Boolean(formik.touched.jobData?.applicationDeadline) &&
                        Boolean(formik.errors.jobData?.applicationDeadline)
                     }
                  />
               </Collapse>
            </Grid>
            <Grid xs={12} item>
               <Collapse
                  onEntered={onEntered}
                  onExited={onExited}
                  unmountOnExit
                  in={true}
               >
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="message"
                     name="message"
                     disabled={formik.isSubmitting}
                     multiline
                     autoFocus
                     minRows={3}
                     maxRows={12}
                     inputProps={{
                        maxLength: maxMessageLength,
                     }}
                     placeholder="Click here to see our open positions"
                     label="Job Description"
                     value={formik.values.message}
                     onChange={formik.handleChange}
                     error={
                        Boolean(formik.touched.message) &&
                        Boolean(formik.errors.message)
                     }
                     helperText={
                        Boolean(formik.touched.message) &&
                        Boolean(formik.errors.message)
                     }
                     inputRef={quillInputRef}
                     InputProps={{
                        inputComponent: CustomRichTextEditor,
                     }}
                  />
               </Collapse>
            </Grid>
            <Grid xs={12} sm={12} item>
               <Collapse
                  onEntered={onEntered}
                  onExited={onExited}
                  unmountOnExit
                  in={true}
               >
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="buttonUrl"
                     name="buttonUrl"
                     disabled={formik.isSubmitting}
                     placeholder="https://mywebsite.com/careers/"
                     label={`Job Posting Url*`}
                     value={formik.values.buttonUrl}
                     onChange={formik.handleChange}
                     error={
                        Boolean(formik.touched.buttonUrl) &&
                        Boolean(formik.errors.buttonUrl)
                     }
                     helperText={
                        Boolean(formik.touched.buttonUrl) &&
                        Boolean(formik.errors.buttonUrl)
                     }
                  />
               </Collapse>
            </Grid>
         </Grid>
      )
   }
)

JobPostingCtaForm.displayName = "JobPostingCtaForm"

export default JobPostingCtaForm
