import React from "react"
import {
   Box,
   Checkbox,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControlLabel,
   FormHelperText,
   InputLabel,
   MenuItem,
   Select,
   TextField,
   useMediaQuery,
   Slide,
   Button,
   CircularProgress,
   FormControl,
} from "@mui/material"
import { Formik } from "formik"
import { withFirebase } from "../../../../../../../context/firebase/FirebaseServiceContext"
import { useTheme } from "@mui/material/styles"
import { LONG_NUMBER } from "../../../../../../util/constants"
import { getMinutes } from "../../../../../../helperFunctions/HelperFunctions"

const marks = [
   5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
   100, 110, 120, 130, 140, 150, 160, 180,
]
// JUst to ensure LONG_NUMBER is always last
marks.push(LONG_NUMBER)

const FeedbackModal = ({
   state: { open, data },
   handleClose,
   firebase,
   currentStream,
}) => {
   const theme = useTheme()
   const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))

   const isForEnd = (appearAfter) => {
      return Boolean(appearAfter === marks[marks.length - 1])
   }

   return (
      <Formik
         autoComplete="off"
         initialValues={{
            question: data.question || "",
            appearAfter: data.appearAfter || 15,
            hasText: data.hasText ?? false,
            isForEnd: data.isForEnd ?? false,
            noStars: data.noStars ?? false,
         }}
         enableReinitialize
         validate={(values) => {
            let errors = {}
            const minQuestionLength = 5

            if (values.noStars && !values.hasText) {
               errors.hasText =
                  "Review needs to have a written review or a star rating"
               errors.noStars =
                  "Review needs to have a written review or a star rating"
            }
            if (!values.question) {
               errors.question = "Required"
            } else if (values.question.length < minQuestionLength) {
               errors.question = `Must be at least ${minQuestionLength} characters`
            }
            return errors
         }}
         onSubmit={async (values, { setFieldError }) => {
            try {
               const { id: feedbackId } = data
               const { id: livestreamId } = currentStream
               if (feedbackId && livestreamId) {
                  await firebase.updateFeedbackQuestion(
                     livestreamId,
                     feedbackId,
                     values
                  )
               } else if (livestreamId) {
                  await firebase.createFeedbackQuestion(livestreamId, values)
               }
               handleClose()
            } catch (e) {
               console.log("-> e", e)
               setFieldError("appearAfter", "internal error")
            }
         }}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            dirty,
            setFieldValue,
            /* and other goodies */
         }) => {
            return (
               <Dialog
                  TransitionComponent={Slide}
                  open={open}
                  fullWidth
                  fullScreen={fullScreen}
                  maxWidth="sm"
               >
                  <DialogTitle>{currentStream?.company}</DialogTitle>
                  <DialogContent>
                     <Box marginY={2}>
                        <TextField
                           fullWidth
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
                     </Box>
                     <Box marginY={2}>
                        <FormControl
                           error={Boolean(errors.appearAfter)}
                           variant="outlined"
                           fullWidth
                           required
                        >
                           <InputLabel
                              htmlFor="appearAfter"
                              shrink
                              component="legend"
                           >
                              This Question will automatically appear in the
                              stream after:
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
                           <FormHelperText>{errors.appearAfter}</FormHelperText>
                        </FormControl>
                     </Box>
                     <Box marginY={2}>
                        <FormControl
                           error={Boolean(errors.hasText)}
                           variant="outlined"
                           fullWidth
                           required
                        >
                           <FormControlLabel
                              control={
                                 <Checkbox
                                    onChange={(e) => handleChange(e)}
                                    checked={Boolean(values.hasText)}
                                    name="hasText"
                                    color="primary"
                                 />
                              }
                              label="Enable Written Reviews"
                           />
                           <FormHelperText>{errors.hasText}</FormHelperText>
                        </FormControl>
                     </Box>
                     <Box marginY={2}>
                        <FormControl
                           error={Boolean(errors.noStars)}
                           variant="outlined"
                           fullWidth
                           required
                        >
                           <FormControlLabel
                              control={
                                 <Checkbox
                                    onChange={() =>
                                       setFieldValue("noStars", !values.noStars)
                                    }
                                    checked={!values.noStars}
                                    name="noStars"
                                    color="primary"
                                 />
                              }
                              label="Enable Star Rating"
                           />
                           <FormHelperText>{errors.noStars}</FormHelperText>
                        </FormControl>
                     </Box>
                     {/*<Box marginY={2}>*/}
                     {/*    <FormControl disabled={isForEnd(values.appearAfter)} variant="outlined" fullWidth*/}
                     {/*                 required>*/}
                     {/*        <FormControlLabel*/}
                     {/*            control={*/}
                     {/*                <Checkbox*/}
                     {/*                    onChange={(e) => handleChange(e)}*/}
                     {/*                    checked={Boolean(values.isForEnd)}*/}
                     {/*                    name="isForEnd"*/}
                     {/*                    color="primary"*/}
                     {/*                />*/}
                     {/*            }*/}
                     {/*            label="Prompt Question When Stream Ends"*/}
                     {/*        />*/}
                     {/*    </FormControl>*/}
                     {/*</Box>*/}
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
                        disabled={!dirty || isSubmitting}
                        onClick={handleSubmit}
                        color="primary"
                     >
                        {!isSubmitting && "Confirm"}
                     </Button>
                  </DialogActions>
               </Dialog>
            )
         }}
      </Formik>
   )
}

export default withFirebase(FeedbackModal)
