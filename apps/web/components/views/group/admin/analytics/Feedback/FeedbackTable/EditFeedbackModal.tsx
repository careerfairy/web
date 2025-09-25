import React, { useCallback, useMemo } from "react"
import {
   Button,
   Checkbox,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   FormControlLabel,
   FormHelperText,
   FormLabel,
   InputLabel,
   MenuItem,
   Radio,
   RadioGroup,
   Select,
   Slide,
   TextField,
} from "@mui/material"
import { Formik } from "formik"
import { useFirebaseService } from "../../../../../../../context/firebase/FirebaseServiceContext"
import { LONG_NUMBER } from "../../../../../../util/constants"
import { getMinutes } from "../../../../../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import Collapse from "@mui/material/Collapse"
import {
   EventRating,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import SentimentRating from "../../../../../viewer/rating-container/SentimentRating"
import NormalRating from "../../../../../viewer/rating-container/NormalRating"
import * as yup from "yup"
import useSnackbarNotifications from "../../../../../../custom-hook/useSnackbarNotifications"

const marks = [
   5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
   100, 110, 120, 130, 140, 150, 160, 180,
]
// JUst to ensure LONG_NUMBER is always last
marks.push(LONG_NUMBER)
type Props = {
   data: EventRating
   handleClose: () => void
   currentStream: LivestreamEvent
   open: boolean
}

interface FormValues extends Omit<EventRating, "id"> {}
const minQuestionLength = 5

const schema = yup.object().shape({
   hasText: yup.boolean(),
   appearAfter: yup
      .number()
      .oneOf(marks, "Please choose a valid duration")
      .required("Required"),
   question: yup
      .string()
      .trim()
      .min(
         minQuestionLength,
         `Question must be at least ${minQuestionLength} characters long`
      )
      .required("Question is required"),
   isForEnd: yup.boolean(),
   noStars: yup.boolean().when("hasText", {
      is: false,
      then: yup
         .boolean()
         .required("Review needs to have a written review or a rating system")
         .oneOf(
            [false],
            "Review needs to have a written review or a rating system"
         ),
   }),
   isSentimentRating: yup.boolean(),
})
const FeedbackModal = ({ open, data, handleClose, currentStream }: Props) => {
   const firebase = useFirebaseService()
   const mobile = useIsMobile()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const isForEnd = useCallback((appearAfter) => {
      return Boolean(appearAfter === marks[marks.length - 1])
   }, [])

   const initialValues: FormValues = useMemo(
      () =>
         ({
            question: data.question || "",
            appearAfter: data.appearAfter || 15,
            isForEnd: data.isForEnd ?? false,
            hasText: data.hasText ?? false,
            noStars: data.noStars ?? false, // no stars means no rating system
            isSentimentRating: data.isSentimentRating ?? false,
         } as FormValues),
      [data]
   )
   const onSubmit = useCallback(
      async (values, { setFieldError }) => {
         try {
            const { id: feedbackId } = data
            const { id: livestreamId } = currentStream
            if (feedbackId && livestreamId) {
               await firebase.updateFeedbackQuestion(
                  livestreamId,
                  feedbackId,
                  values
               )
               successNotification("Feedback question updated")
            } else if (livestreamId) {
               await firebase.createFeedbackQuestion(livestreamId, values)
               successNotification("Feedback question created")
            }
            handleClose()
         } catch (e) {
            errorNotification(e, "Error updating feedback question")
            setFieldError("appearAfter", "internal error")
         }
      },
      [
         currentStream,
         data,
         errorNotification,
         firebase,
         handleClose,
         successNotification,
      ]
   )

   return (
      <Formik
         initialValues={initialValues}
         enableReinitialize
         validationSchema={schema}
         onSubmit={onSubmit}
      >
         {({
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            dirty,
            setFieldValue,
            isValid,
         }) => (
            <Dialog
               TransitionComponent={Slide}
               open={open}
               fullWidth
               fullScreen={mobile}
               maxWidth="sm"
               component={"form"}
               // @ts-ignore
               onSubmit={handleSubmit}
            >
               <DialogTitle>{currentStream?.company}</DialogTitle>
               <DialogContent>
                  <Stack sx={{ pt: 1 }} spacing={2}>
                     <TextField
                        fullWidth
                        // @ts-ignore
                        helperText={errors.question}
                        label="Question"
                        disabled={isSubmitting}
                        name="question"
                        onChange={handleChange}
                        required
                        error={Boolean(errors.question)}
                        value={values.question}
                        variant="outlined"
                     />
                     <FormControl
                        error={Boolean(errors.appearAfter)}
                        variant="outlined"
                        fullWidth
                        required
                     >
                        <InputLabel htmlFor="appearAfter" shrink>
                           This Question will automatically appear in the stream
                           after:
                        </InputLabel>
                        <Select
                           label="This Question will automatically appear in the stream after:"
                           name="appearAfter"
                           id="appearAfter"
                           onChange={(e) => {
                              handleChange(e)
                              if (isForEnd(e.target.value)) {
                                 setFieldValue("isForEnd", true)
                              } else if (values.isForEnd) {
                                 setFieldValue("isForEnd", false)
                              }
                           }}
                           value={values.appearAfter}
                        >
                           {marks.map((value) => (
                              <MenuItem key={value} value={value}>
                                 {getMinutes(value)}
                              </MenuItem>
                           ))}
                        </Select>
                        <FormHelperText>
                           {/* @ts-ignore */}
                           {errors.appearAfter}
                        </FormHelperText>
                     </FormControl>

                     <FormControl
                        error={Boolean(errors.hasText)}
                        variant="outlined"
                        fullWidth
                        required
                     >
                        <FormControlLabel
                           onChange={handleChange}
                           name="hasText"
                           control={
                              <Checkbox
                                 checked={values.hasText}
                                 color="primary"
                              />
                           }
                           label="Enable Written Reviews"
                        />
                        <FormHelperText>
                           {/* @ts-ignore */}
                           {errors.hasText}
                        </FormHelperText>
                     </FormControl>
                     <FormControl
                        error={Boolean(errors.noStars)}
                        variant="outlined"
                        fullWidth
                        required
                     >
                        <FormControlLabel // need to use setFieldValue since the checkbox value is the opposite of what we want
                           onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                           ) => {
                              setFieldValue("noStars", !e.target.checked)
                           }}
                           name="noStars"
                           control={
                              <Checkbox
                                 checked={!values.noStars}
                                 color="primary"
                              />
                           }
                           label="Enable Rating System"
                        />
                        <FormHelperText>
                           {/* @ts-ignore */}
                           {errors.noStars}
                        </FormHelperText>
                     </FormControl>
                     <Collapse in={!values.noStars}>
                        <Stack spacing={2}>
                           <FormControl variant="outlined" fullWidth required>
                              <FormLabel id="rating-system-buttons-group">
                                 Rating system type
                              </FormLabel>
                              <RadioGroup
                                 aria-labelledby="rating-system-buttons-group"
                                 name="isSentimentRating"
                                 value={values.isSentimentRating}
                                 onBlur={handleBlur}
                                 onChange={(e) => {
                                    setFieldValue(
                                       "isSentimentRating",
                                       e.target.value === "true"
                                    )
                                 }}
                              >
                                 <Stack direction={"row"} spacing={2}>
                                    <FormControlLabel
                                       value={false}
                                       control={<Radio />}
                                       label="Star Rating"
                                    />
                                    <NormalRating value={4} />
                                 </Stack>
                                 <Stack direction={"row"} spacing={2}>
                                    <FormControlLabel
                                       value={true}
                                       control={<Radio />}
                                       label="Sentiment Rating"
                                    />
                                    <SentimentRating
                                       name={"demo sentiment"}
                                       value={1}
                                       highlightSelectedOnly={false}
                                       hideLabel
                                    />
                                 </Stack>
                              </RadioGroup>
                           </FormControl>
                        </Stack>
                     </Collapse>
                  </Stack>
               </DialogContent>
               <DialogActions>
                  <Button color="grey" onClick={handleClose}>
                     Cancel
                  </Button>
                  <Button
                     variant="contained"
                     endIcon={
                        isSubmitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     disabled={!dirty || isSubmitting || !isValid}
                     color="primary"
                     type="submit"
                  >
                     {isSubmitting ? "Saving" : "Confirm"}
                  </Button>
               </DialogActions>
            </Dialog>
         )}
      </Formik>
   )
}

export default FeedbackModal
