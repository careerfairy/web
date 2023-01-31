import React from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useFormik } from "formik"
import {
   maxQuestionLength,
   minQuestionLength,
} from "../../../../constants/forms"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { Box, Button, CircularProgress, TextField } from "@mui/material"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { recommendationServiceInstance } from "data/firebase/RecommendationService"

const styles = {
   root: {
      width: "100%",
      padding: (theme) => theme.spacing(1, 2),
   },
}
const CreateQuestion = ({ livestream, reFetchQuestions }) => {
   const { putLivestreamQuestion } = useFirebaseService()
   const { authenticatedUser, userData } = useAuth()
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
         if (!authenticatedUser) {
            return replace({
               pathname: "/signup",
               query: { absolutePath: asPath },
            })
         }
         try {
            const newQuestion = {
               title: values.questionTitle,
               votes: 0,
               type: "new",
               author: authenticatedUser.email,
            }
            await putLivestreamQuestion(livestream.id, newQuestion)
            dispatch(
               actions.sendSuccessMessage(
                  "Thanks, your question has successfully been submitted!"
               )
            )
            reFetchQuestions()
            resetForm()
            dataLayerEvent("event_question_submit", {
               livestreamId: livestream.id,
            })
            recommendationServiceInstance.addPopularityEvent(
               "CREATED_QUESTION",
               livestream,
               {
                  user: userData,
                  customId: userData?.authId,
               }
            )
         } catch (e) {
            setFieldError(
               "questionTitle",
               "There was an issue submitting the question"
            )
         }
      },
      validate: (values) => {
         let errors: { questionTitle?: string } = {}
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
            error={touched.questionTitle && Boolean(errors.questionTitle)}
            helperText={touched.questionTitle && errors.questionTitle}
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
                  isSubmitting && <CircularProgress size={10} color="inherit" />
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
