import {
   maxQuestionLength,
   minQuestionLength,
} from "@careerfairy/shared-lib/constants/forms"
import {
   LivestreamEvent,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Button, CircularProgress, TextField } from "@mui/material"
import { livestreamService } from "data/firebase/LivestreamService"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { FC } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { errorLogAndNotify } from "../../../../util/CommonUtil"

const styles = {
   root: {
      width: "100%",
      padding: (theme) => theme.spacing(1, 2),
   },
}

type Props = {
   livestream: LivestreamEvent
   onQuestionAdded: (question: LivestreamQuestion) => void
}
const CreateQuestion: FC<Props> = ({ livestream, onQuestionAdded }) => {
   const { authenticatedUser, userData, userPresenter, isLoggedIn } = useAuth()
   const dispatch = useDispatch()
   const { replace, asPath } = useRouter()
   const {
      handleChange,
      values,
      touched,
      handleSubmit,
      errors,
      handleBlur,
      isSubmitting,
   } = useFormik({
      initialValues: {
         questionTitle: "",
      },
      onSubmit: async (values, { resetForm, setFieldError }) => {
         if (!isLoggedIn) {
            return replace({
               pathname: "/signup",
               query: { absolutePath: asPath },
            })
         }
         try {
            const newlyCreatedQuestion = await livestreamService.createQuestion(
               livestreamService.getLivestreamRef(livestream.id),
               {
                  title: values.questionTitle,
                  author: authenticatedUser.uid,
                  displayName: userPresenter?.getDisplayName?.() || null,
                  badges: [],
               }
            )

            dispatch(
               actions.sendSuccessMessage(
                  "Thanks, your question has successfully been submitted!"
               )
            )
            onQuestionAdded(newlyCreatedQuestion)
            resetForm()

            recommendationServiceInstance.createdQuestion(livestream, userData)
         } catch (e) {
            errorLogAndNotify(e, {
               message: "There was an issue submitting the question",
               livestreamId: livestream.id,
               userId: authenticatedUser.uid,
            })
            setFieldError(
               "questionTitle",
               "There was an issue submitting the question"
            )
         }
      },
      validate: (values) => {
         const errors: { questionTitle?: string } = {}
         if (!values.questionTitle) {
            errors.questionTitle = "Please enter a title"
         }
         if (values.questionTitle.length < minQuestionLength) {
            errors.questionTitle = `Must be at least ${minQuestionLength} characters`
         }
         if (values.questionTitle.length > maxQuestionLength) {
            errors.questionTitle = `Must be less than ${maxQuestionLength} characters`
         }
         return errors
      },
   })
   return (
      <Box sx={styles.root}>
         <TextField
            variant="outlined"
            id="questionTitle"
            name="questionTitle"
            label="Your Question"
            value={values.questionTitle}
            placeholder={"What would like to ask our speaker?"}
            // @ts-ignore
            maxLength="170"
            error={touched.questionTitle ? Boolean(errors.questionTitle) : null}
            helperText={touched.questionTitle ? errors.questionTitle : null}
            inputProps={{ maxLength: maxQuestionLength }}
            fullWidth
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={isSubmitting}
         />
         <Box
            sx={{
               my: 2,
               display: "flex",
               justifyContent: "flex-start",
            }}
         >
            {/* @ts-ignore */}
            <Button
               variant="contained"
               onClick={handleSubmit}
               style={{ width: 250 }}
               color="primary"
               size="large"
               startIcon={
                  isSubmitting ? (
                     <CircularProgress size={10} color="inherit" />
                  ) : null
               }
               disabled={isSubmitting}
            >
               {isSubmitting ? "submitting" : "Submit Your question"}
            </Button>
         </Box>
      </Box>
   )
}

export default CreateQuestion
