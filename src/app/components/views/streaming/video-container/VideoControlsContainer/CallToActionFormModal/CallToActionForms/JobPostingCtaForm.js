const { memo, useEffect, useState, useMemo } = require("react");
import { Button } from "@material-ui/core";
import {
   Collapse,
   Grid,
   FormControl,
   InputLabel,
   Typography,
   TextField,
   MenuItem,
   Select,
   Box,
} from "@material-ui/core";
import { DateTimePicker } from "@material-ui/pickers";
import SmartRecruitersDataAccess from "data/dataAccess/SmartRecruitersDataAccess";

const JobPostingCtaForm = memo(
   ({ formik, maxMessageLength, onEntered, onExited }) => {
      const now = new Date();
      const [atsPositions, setAtsPositions] = useState([]);
      const [selectedAtsPosition, setSelectedAtsPosition] = useState(null);

      useEffect(() => {
         const COMPANY_SMARTRECRUITERS_ID = "5241b1d0e4b0ed152cd9d36a";
         SmartRecruitersDataAccess.getCompanyPositions().then((response) => {
            let positions = response.data.jobs.filter((job) => {
               return job.company.cid === COMPANY_SMARTRECRUITERS_ID;
            });
            console.log(positions);
            setAtsPositions(positions);
         });
      }, []);

      const atsPositionElements = useMemo(() => {
         return atsPositions.map((position) => {
            return (
               <MenuItem value={position}>
                  <Typography>{position.name}</Typography>
               </MenuItem>
            );
         });
      }, [atsPositions]);

      const handleChange = (event) => {
         setSelectedAtsPosition(event.target.value);
         formik.setFieldValue(
            "jobData.jobTitle",
            event.target.value.name,
            false
         );
         formik.setFieldValue("buttonUrl", event.target.value.applyUrl, false);
         formik.setFieldValue("isAtsPosition", true, false);
         formik.setFieldValue("atsUuid", event.target.value.uuid, false);
      };

      const handleReset = () => {
         setSelectedAtsPosition(null);
         formik.setFieldValue("isAtsPosition", false, false);
         formik.setFieldValue("atsUuid", false, false);
      };

      return (
         <Grid container spacing={3}>
            <Grid xs={12} sm={8} item>
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
            </Grid>
            <Grid xs={12} item>
               <Collapse unmountOnExit in={!selectedAtsPosition}>
                  <Box>
                     <Typography>
                        - OR SEND VIEWERS TO ANOTHER PLATFORM -
                     </Typography>
                  </Box>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="jobTitle"
                     name="jobData.jobTitle"
                     disabled={formik.isSubmitting || selectedAtsPosition}
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
               <Collapse unmountOnExit in={!selectedAtsPosition}>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="salary"
                     name="jobData.salary"
                     disabled={formik.isSubmitting || selectedAtsPosition}
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
               <Collapse unmountOnExit in={!selectedAtsPosition}>
                  <DateTimePicker
                     id="applicationDeadline"
                     clearable
                     disablePast
                     label="Application deadline"
                     value={formik.values.jobData.applicationDeadline}
                     name="jobData.applicationDeadline"
                     onChange={(value) => {
                        const newValue = value ? new Date(value) : null;
                        formik.setFieldValue(
                           "jobData.applicationDeadline",
                           newValue,
                           true
                        );
                     }}
                     disabled={formik.isSubmitting || selectedAtsPosition}
                     minDate={now}
                     inputVariant="outlined"
                     fullWidth
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
                  in={!selectedAtsPosition}
               >
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="message"
                     name="message"
                     disabled={formik.isSubmitting || selectedAtsPosition}
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
                  in={!selectedAtsPosition}
               >
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="buttonUrl"
                     name="buttonUrl"
                     disabled={formik.isSubmitting || selectedAtsPosition}
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
      );
   }
);

export default JobPostingCtaForm;
