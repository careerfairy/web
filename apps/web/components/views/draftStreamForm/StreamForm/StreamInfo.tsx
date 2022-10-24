import {
   Box,
   Collapse,
   FormControl,
   FormControlLabel,
   Grid,
   IconButton,
   Switch,
   TextField,
   Tooltip,
   Typography,
} from "@mui/material"
import ImageSelect from "../ImageSelect/ImageSelect"
import { getDownloadUrl } from "../../../helperFunctions/streamFormFunctions"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LanguageSelect } from "../../../helperFunctions/streamFormFunctions/components"
import Stack from "@mui/material/Stack"
import FormGroup from "../FormGroup"
import React, { useEffect, useState } from "react"
import StreamDurationSelect from "../StreamDurationSelect"
import { FormikErrors, FormikValues } from "formik"
import { useTheme } from "@mui/material/styles"
import Section from "components/views/common/Section"
import CloseIcon from "@mui/icons-material/Close"
import { useStreamCreationProvider } from "./StreamCreationProvider"

type Props = {
   isGroupsSelected: boolean
   handleBlur: (e) => void
   values: FormikValues
   isSubmitting: boolean
   errors: FormikErrors<FormikValues>
   touched: any
   handleChange: (e) => void
   selectedGroups: any
   setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
   userData: any
   classes: any
   sectionRef: any
}

const StreamInfo = ({
   isGroupsSelected,
   handleBlur,
   values,
   isSubmitting,
   errors,
   touched,
   handleChange,
   selectedGroups,
   setFieldValue,
   userData,
   classes,
   sectionRef,
}: Props) => {
   const { palette } = useTheme()
   const [showStartTooltip, setShowStartToolTip] = useState(false)
   const { setShowPromotionInputs } = useStreamCreationProvider()

   useEffect(() => {
      const { start } = values
      if (start) {
         const now = new Date()
         const oneMonthAgo = new Date(new Date().setDate(now.getDate() + 30))

         // The tooltip will show only if the start date is between today and one month ago.
         // The promotion inputs is the opposite, wil be only shown if the start date is between today and one month ago.
         if (start < oneMonthAgo) {
            setShowStartToolTip(true)
            setShowPromotionInputs(false)
         } else {
            setShowStartToolTip(false)
            setShowPromotionInputs(true)
         }
      }
   }, [setShowPromotionInputs, values.start])

   const buildHiddenMessage = () => {
      // Creates the group names string separated by commas and an "and" at the end
      const groupNames = selectedGroups
         .map((group) => group.universityName)
         .join(", ")
         .replace(/, ([^,]*)$/, " and $1")
      return `By enabling this you are making this stream only visible to members of ${groupNames}.`
   }

   // @ts-ignore
   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"streamInfoSection"}
         className={classes.section}
      >
         <Typography fontWeight="bold" variant="h4">
            Stream Info
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Basic information about the stream
         </Typography>
         <FormGroup container boxShadow={0}>
            <Grid xs={12} md={isGroupsSelected ? 9 : 12} item>
               <FormControl fullWidth>
                  <TextField
                     name="title"
                     variant="outlined"
                     fullWidth
                     id="title"
                     label="Livestream Title"
                     inputProps={{ maxLength: 104 }}
                     onBlur={handleBlur}
                     value={values.title}
                     disabled={isSubmitting}
                     placeholder={"Enter the Live Stream title here"}
                     error={Boolean(errors.title && touched.title)}
                     onChange={handleChange}
                  />
                  <Collapse
                     className={classes.errorMessage}
                     in={Boolean(errors.title && touched.title)}
                  >
                     {errors.title}
                  </Collapse>
               </FormControl>
            </Grid>
            {isGroupsSelected && (
               <Grid
                  xs={12}
                  md={3}
                  sx={{
                     display: "grid",
                     placeItems: { xs: "start", md: "center" },
                  }}
                  item
               >
                  <Tooltip
                     placement="top"
                     arrow
                     disableHoverListener={Boolean(!selectedGroups.length)}
                     title={<Typography>{buildHiddenMessage()}</Typography>}
                  >
                     <FormControlLabel
                        labelPlacement="end"
                        label="Make Exclusive"
                        disabled={Boolean(!selectedGroups.length)}
                        control={
                           <Switch
                              checked={Boolean(values.hidden)}
                              onChange={handleChange}
                              disabled={Boolean(
                                 !selectedGroups.length || isSubmitting
                              )}
                              color="secondary"
                              id="hidden"
                              name="hidden"
                              inputProps={{
                                 "aria-label": "secondary checkbox",
                              }}
                           />
                        }
                     />
                  </Tooltip>
               </Grid>
            )}
            <Grid xs={12} lg={6} item>
               <ImageSelect
                  getDownloadUrl={getDownloadUrl}
                  setFieldValue={setFieldValue}
                  isSubmitting={isSubmitting}
                  path="company-logos"
                  label="Your Company Logo"
                  formName="companyLogoUrl"
                  changeImageButtonLabel="Change Logo"
                  value={values.companyLogoUrl}
                  error={
                     errors.companyLogoUrl &&
                     touched.companyLogoUrl &&
                     errors.companyLogoUrl
                  }
                  resolution={"640 x 480"}
               />
            </Grid>
            <Grid xs={12} lg={6} item>
               <ImageSelect
                  getDownloadUrl={getDownloadUrl}
                  setFieldValue={setFieldValue}
                  isSubmitting={isSubmitting}
                  path="illustration-images"
                  label="Your Company Background"
                  formName="backgroundImageUrl"
                  changeImageButtonLabel="Change Background"
                  value={values.backgroundImageUrl}
                  error={
                     errors.backgroundImageUrl &&
                     touched.backgroundImageUrl &&
                     errors.backgroundImageUrl
                  }
                  resolution={"1280 x 960"}
               />
            </Grid>
            <Grid xs={12} sm={6} md={4} item>
               <DateTimePicker
                  inputFormat={"dd/MM/yyyy HH:mm"}
                  disablePast
                  ampm={false}
                  renderInput={(params) => (
                     <Tooltip
                        placement="top"
                        arrow
                        open={showStartTooltip}
                        title={
                           <Box display="flex">
                              <Typography>
                                 Promotion won’t available if the event happens
                                 within 30 days
                              </Typography>
                              <IconButton
                                 onClick={() => setShowStartToolTip(false)}
                                 size="small"
                                 color="info"
                              >
                                 <CloseIcon />
                              </IconButton>
                           </Box>
                        }
                     >
                        <TextField
                           fullWidth
                           {...params}
                           id="start"
                           onBlur={handleBlur}
                           sx={{ svg: { color: palette.secondary.main } }}
                           error={Boolean(errors.start && touched.start)}
                        />
                     </Tooltip>
                  )}
                  disabled={isSubmitting}
                  label="Live Stream Start Date"
                  value={values.start}
                  onClose={() => handleBlur({ target: { name: "start" } })}
                  onChange={(value) => {
                     setFieldValue("start", new Date(value), true)
                  }}
               />
               <Collapse
                  className={classes.errorMessage}
                  in={Boolean(errors.start && touched.start)}
               >
                  {errors.start}
               </Collapse>
            </Grid>
            <Grid xs={12} sm={6} md={4} item>
               <StreamDurationSelect
                  value={values.duration}
                  start={values.start}
                  disabled={isSubmitting}
                  label="Estimated Duration"
                  setFieldValue={setFieldValue}
                  fullWidth
                  variant="outlined"
               />
            </Grid>
            <Grid xs={12} sm={6} md={4} item>
               <LanguageSelect
                  value={values.language}
                  setFieldValue={setFieldValue}
                  name="language"
               />
            </Grid>
            <Grid xs={12} item>
               <FormControl fullWidth>
                  <TextField
                     name="company"
                     variant="outlined"
                     fullWidth
                     id="company"
                     label="Company Name"
                     inputProps={{ maxLength: 70 }}
                     onBlur={handleBlur}
                     value={values.company}
                     disabled={isSubmitting}
                     error={Boolean(errors.company && touched.company)}
                     onChange={handleChange}
                     placeholder="Enter your company name"
                  />
                  <Collapse
                     className={classes.errorMessage}
                     in={Boolean(errors.company && touched.company)}
                  >
                     {errors.company}
                  </Collapse>
               </FormControl>
            </Grid>

            <Grid xs={12} item>
               <FormControl fullWidth>
                  <TextField
                     className="multiLineInput"
                     name="summary"
                     variant="outlined"
                     fullWidth
                     multiline
                     id="summary"
                     label="Summary"
                     maxRows={10}
                     inputProps={{ maxLength: 5000 }}
                     onBlur={handleBlur}
                     value={values.summary}
                     disabled={isSubmitting}
                     error={Boolean(errors.summary && touched.summary)}
                     onChange={handleChange}
                     placeholder="Write something about this stream"
                     sx={{ minHeight: "100px", textAlign: "start" }}
                  />
                  <Collapse
                     className={classes.errorMessage}
                     in={Boolean(errors.summary && touched.summary)}
                  >
                     {errors.summary}
                  </Collapse>
               </FormControl>
            </Grid>

            {userData?.isAdmin && (
               <Grid xs={12} item>
                  <Stack direction="row" spacing={2}>
                     <Box pl={2} display="flex" alignItems="center">
                        Settings only for CF Admins:
                     </Box>
                     <Tooltip
                        placement="top"
                        arrow
                        title={
                           <Typography>
                              By disabling questions the participants will no
                              longer be able to use the Q&A section during the
                              livestream and create questions during the
                              registration process.
                           </Typography>
                        }
                     >
                        <FormControlLabel
                           labelPlacement="start"
                           label="Disable Q&A"
                           control={
                              <Switch
                                 checked={Boolean(values.questionsDisabled)}
                                 onChange={handleChange}
                                 disabled={Boolean(isSubmitting)}
                                 color="secondary"
                                 id="questionsDisabled"
                                 name="questionsDisabled"
                                 inputProps={{
                                    "aria-label": "secondary checkbox",
                                 }}
                              />
                           }
                        />
                     </Tooltip>
                  </Stack>
               </Grid>
            )}
         </FormGroup>
      </Section>
   )
}

export default StreamInfo
