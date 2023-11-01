import React, { memo } from "react"
import { Collapse, Grid, TextField } from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"

const JobPostingCtaForm = memo(
   ({ formik, maxMessageLength, onEntered, onExited }) => {
      const now = new Date()

      return (
         <Grid container spacing={3}>
            {/* <Grid xs={12} sm={8} item>
               <Box>
                  <Typography>
                     - SELECT A JOB TO APPLY TO FROM CAREERFAIRY -
                  </Typography>
               </Box>
            </Grid>
            <Grid xs={12} sm={8} item>
               <FormControl fullWidth>
                  <InputLabel>Select ATS Position</InputLabel>
                  <Select
                     autoWidth={true}
                     label="Select ATS Position"
                     value={selectedAtsPosition}
                     onChange={handleChange}
                  >
                     <MenuItem value={null}>
                        <Typography>Select a position</Typography>
                     </MenuItem>
                     {atsPositionElements}
                  </Select>
               </FormControl>
               <FormControl style={{ marginTop: 10 }}>
                  <Button variant="contained" onClick={handleReset}>
                     Reset
                  </Button>
               </FormControl>
            </Grid> */}
            <Grid xs={12} item>
               <Collapse unmountOnExit in={true}>
                  {/* <Box>
                     <Typography>
                        - OR SEND VIEWERS TO ANOTHER PLATFORM -
                     </Typography>
                  </Box> */}
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
                        formik.touched.jobData?.jobTitle &&
                        Boolean(formik.errors.jobData?.jobTitle)
                     }
                     helperText={
                        formik.touched.jobData?.jobTitle &&
                        formik.errors.jobData?.jobTitle
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
                        formik.touched.jobData?.salary &&
                        Boolean(formik.errors.jobData?.salary)
                     }
                     helperText={
                        formik.touched.jobData?.salary &&
                        formik.errors.jobData?.salary
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
                     renderInput={(params) => (
                        <TextField fullWidth {...params} />
                     )}
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
                        formik.touched.jobData?.applicationDeadline &&
                        Boolean(formik.errors.jobData?.applicationDeadline)
                     }
                     helperText={
                        formik.touched.jobData?.applicationDeadline &&
                        formik.errors.jobData?.applicationDeadline
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
                        formik.touched.message && Boolean(formik.errors.message)
                     }
                     helperText={
                        formik.touched.message && formik.errors.message
                     }
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
                        formik.touched.buttonUrl &&
                        Boolean(formik.errors.buttonUrl)
                     }
                     helperText={
                        formik.touched.buttonUrl && formik.errors.buttonUrl
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
