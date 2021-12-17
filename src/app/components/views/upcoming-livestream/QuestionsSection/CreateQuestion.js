import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { useFormik } from "formik";
import {
   maxQuestionLength,
   minQuestionLength,
} from "../../../../constants/forms";
import { useFirebase } from "../../../../context/firebase";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress, TextField } from "@material-ui/core";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      padding: theme.spacing(1, 2),
   },
}));
const CreateQuestion = ({ livestreamId, reFetchQuestions }) => {
   const classes = useStyles();
   const { putLivestreamQuestion } = useFirebase();
   const { authenticatedUser } = useAuth();
   const dispatch = useDispatch();
   const { replace, asPath } = useRouter();
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
            });
         }
         try {
            const newQuestion = {
               title: values.questionTitle,
               votes: 0,
               type: "new",
               author: authenticatedUser.email,
            };
            await putLivestreamQuestion(livestreamId, newQuestion);
            dispatch(
               actions.sendSuccessMessage(
                  "Thanks, your question has successfully been submitted!"
               )
            );
            reFetchQuestions();
            resetForm();
         } catch (e) {
            setFieldError(
               "questionTitle",
               "There was an issue submitting the question"
            );
         }
      },
      validate: (values) => {
         let errors = {};
         if (!values.questionTitle) {
            errors.questionTitle = "Please enter a title";
         }
         if (values.questionTitle.length < minQuestionLength) {
            errors.questionTitle = `Must be at least ${minQuestionLength} characters`;
         }
         if (values.questionTitle.length > maxQuestionLength) {
            errors.questionTitle = `Must be less than ${maxQuestionLength} characters`;
         }
         return errors;
      },
   });
   return (
      <div className={classes.root}>
         <TextField
            variant="outlined"
            id="questionTitle"
            name="questionTitle"
            label="Your Question"
            value={values.questionTitle}
            placeholder={"What would like to ask our speaker?"}
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
            display="flex"
            justifyContent="flex-start"
            marginTop={2}
            marginBottom={2}
         >
            <Button
               variant="contained"
               onClick={handleSubmit}
               style={{ width: 250 }}
               color="primary"
               size="large"
               startIcon={
                  isSubmitting && <CircularProgress size={10} color="inherit" />
               }
               autoFocus
               disabled={isSubmitting}
            >
               {isSubmitting ? "submitting" : "Submit Your question"}
            </Button>
         </Box>
      </div>
   );
};

export default CreateQuestion;
