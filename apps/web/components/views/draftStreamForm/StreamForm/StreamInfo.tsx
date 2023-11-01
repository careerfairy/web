import {
   Box,
   Collapse,
   Container,
   FormControl,
   FormControlLabel,
   Grid,
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
import React, { useCallback, useEffect, useState } from "react"
import StreamDurationSelect from "../StreamDurationSelect"
import { FormikErrors, FormikValues } from "formik"
import { useTheme } from "@mui/material/styles"
import Section from "components/views/common/Section"
import CloseIcon from "@mui/icons-material/Close"
import { useStreamCreationProvider } from "./StreamCreationProvider"
import DateUtil from "../../../../util/DateUtil"
import LogoUploaderWithCropping from "components/views/common/logos/LogoUploaderWithCropping"

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
   publishDate: Date | null
   isPastStream: boolean
}

const PROMOTION_MIN_DAYS = 30

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
   publishDate,
   isPastStream,
}: Props) => {
   const { palette } = useTheme()
   const [showStartTooltip, setShowStartToolTip] = useState(false)
   const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
   const [disableStartDatePicker, setDisableStartDatePicker] = useState(false)
   const { setShowPromotionInputs, setIsPromotionInputsDisabled } =
      useStreamCreationProvider()

   const handleShowPromotions = (disabled = false) => {
      setShowStartToolTip(false)
      setShowPromotionInputs(true)
      setIsPromotionInputsDisabled(disabled)
   }

   const handleHidePromotions = () => {
      setShowStartToolTip(true)
      setShowPromotionInputs(false)
   }

   // To handle all the logic of the promotions and DatePicker Tooltip visibility
   useEffect(() => {
      const { start } = values

      if (start) {
         const now = new Date()
         const hasPromotion = hasPromotions(values)

         // If it doesn't have publishDate it means is a Draft
         // so only needs to validate, is the selected date (start) between today and one month ago
         if (!publishDate) {
            if (
               DateUtil.getDifferenceInDays(now, start) >= PROMOTION_MIN_DAYS
            ) {
               handleShowPromotions()
            } else {
               handleHidePromotions()
            }
            return
         }

         // If it is a Past Stream
         // we should disable the Date Picker and the Promotions input and only show promotions if there's any
         if (isPastStream) {
            setDisableStartDatePicker(true)
            if (hasPromotion) {
               handleShowPromotions(true)
            } else {
               setShowStartToolTip(false)
               setShowPromotionInputs(false)
            }
            return
         }

         // If it is an Upcoming Stream we have 4 possible scenarios
         if (publishDate) {
            // Handle promotions if the selected date (start) is more than 30 days apart from today
            if (
               DateUtil.getDifferenceInDays(now, start) >= PROMOTION_MIN_DAYS
            ) {
               handleShowPromotions()
               return
            }

            // Don't accept promotions if the selected and publish date are less than 30 days from the selected date
            if (
               DateUtil.getDifferenceInDays(now, start) < PROMOTION_MIN_DAYS &&
               DateUtil.getDifferenceInDays(publishDate, start) <
                  PROMOTION_MIN_DAYS
            ) {
               handleHidePromotions()
               return
            }

            // Handle promotions if the selected and publish date are less than 30 days from the selected date
            // but had already promotions set
            if (
               DateUtil.getDifferenceInDays(now, start) < PROMOTION_MIN_DAYS &&
               DateUtil.getDifferenceInDays(publishDate, start) >=
                  PROMOTION_MIN_DAYS &&
               hasPromotion
            ) {
               handleShowPromotions(true)
               return
            }

            // Don't accept promotions if the selected and publish date are less than 30 days from the selected date
            // and doesn't have already promotions set
            if (
               DateUtil.getDifferenceInDays(now, start) < PROMOTION_MIN_DAYS &&
               DateUtil.getDifferenceInDays(publishDate, start) >=
                  PROMOTION_MIN_DAYS &&
               !hasPromotion
            ) {
               handleHidePromotions()
               return
            }
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

   const handleStartDatePickerClose = useCallback(() => {
      setStartDatePickerOpen(false)
      handleBlur({ target: { name: "start" } })
   }, [handleBlur])

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
                     label="Live Stream Title"
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
            <Grid xs={12} lg={4} item>
               {/*<ImageSelect
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
               />*/}
               <Container
                  sx={{
                     display: "flex",
                     justifyContent: "center",
                     paddingTop: "2.5%",
                     width: "95%",
                     height: "95%",
                  }}
               >
                  <LogoUploaderWithCropping
                     logoUrl={values.companyLogoUrl}
                     handleSubmit={async (fileObject) => {
                        const newLogoUrl = URL.createObjectURL(fileObject)
                        setFieldValue("companyLogoUrl", newLogoUrl, true)
                     }}
                  />
               </Container>
            </Grid>
            <Grid xs={12} lg={8} item>
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
                  // renderInput={(params) => (
                  //    <Tooltip
                  //       placement="top"
                  //       arrow
                  //       open={showStartTooltip && !startDatePickerOpen}
                  //       title={
                  //          <Box display="flex">
                  //             <Typography>
                  //                Promotion won’t available if the event happens
                  //                within 30 days
                  //             </Typography>
                  //             <IconButton
                  //                onClick={() => setShowStartToolTip(false)}
                  //                size="small"
                  //                color="info"
                  //             >
                  //                <CloseIcon />
                  //             </IconButton>
                  //          </Box>
                  //       }
                  //    >
                  //       <TextField
                  //          fullWidth
                  //          {...params}
                  //          id="start"
                  //          onBlur={handleBlur}
                  //          sx={{ svg: { color: palette.secondary.main } }}
                  //          error={Boolean(errors.start && touched.start)}
                  //          disabled={disableStartDatePicker}
                  //       />
                  //    </Tooltip>
                  // )}
                  renderInput={(params) => (
                     <TextField
                        fullWidth
                        {...params}
                        id="start"
                        onBlur={handleBlur}
                        sx={{ svg: { color: palette.secondary.main } }}
                        error={Boolean(errors.start && touched.start)}
                        disabled={disableStartDatePicker}
                     />
                  )}
                  disabled={isSubmitting || disableStartDatePicker}
                  label="Live Stream Start Date"
                  value={values.start}
                  onClose={handleStartDatePickerClose}
                  onChange={(value) => {
                     setFieldValue("start", new Date(value), true)
                  }}
                  open={startDatePickerOpen}
                  onOpen={() => setStartDatePickerOpen(true)}
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
                     label="What Is the Live Stream About?"
                     maxRows={10}
                     inputProps={{ maxLength: 5000 }}
                     onBlur={handleBlur}
                     value={values.summary}
                     disabled={isSubmitting}
                     error={Boolean(errors.summary && touched.summary)}
                     onChange={handleChange}
                     placeholder={
                        "Describe your live stream\n" +
                        "  - [Company] is one of the leading companies in the [industry]. We have [XYZ] employees globally...\n" +
                        "  - We are going to present how a day in the life of our consultants looks like\n" +
                        "  - Agenda: 30 minutes presentation and 30 minutes Q&A"
                     }
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

            <Grid xs={12} item>
               <FormControl fullWidth>
                  <TextField
                     className="multiLineInput"
                     name="reasonsToJoinLivestream"
                     variant="outlined"
                     fullWidth
                     multiline
                     id="reasonsToJoinLivestream"
                     label="3 Reasons Why Talent Should Join Your Live Stream"
                     maxRows={10}
                     inputProps={{ maxLength: 5000 }}
                     onBlur={handleBlur}
                     value={values.reasonsToJoinLivestream}
                     disabled={isSubmitting}
                     error={Boolean(
                        errors.reasonsToJoinLivestream &&
                           touched.reasonsToJoinLivestream
                     )}
                     onChange={handleChange}
                     placeholder={
                        "Provide three bullet points describing why young talent should join your live stream:\n" +
                        "  - Find out, which job benefits await you as a [title of open position/program]\n" +
                        "  - Learn what skills from your studies you can apply in this working environment\n" +
                        "  - Start job application process in-stream and skip first round of interviews"
                     }
                     sx={{ minHeight: "100px", textAlign: "start" }}
                  />
                  <Collapse
                     className={classes.errorMessage}
                     in={Boolean(
                        errors.reasonsToJoinLivestream &&
                           touched.reasonsToJoinLivestream
                     )}
                  >
                     {errors.reasonsToJoinLivestream}
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
                              live stream and create questions during the
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

const hasPromotions = (values: FormikValues) => {
   const {
      promotionChannelsCodes,
      promotionCountriesCodes,
      promotionUniversitiesCodes,
   } = values
   return (
      promotionChannelsCodes.length ||
      promotionCountriesCodes.length ||
      promotionUniversitiesCodes.length
   )
}

export default StreamInfo
