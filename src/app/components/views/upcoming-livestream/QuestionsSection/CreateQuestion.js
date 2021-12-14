import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { useFormik } from "formik";
import {
   maxQuestionLength,
   minQuestionLength,
} from "../../../../constants/forms";
import { useFirebase } from "../../../../context/firebase";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const CreateQuestion = ({ livestreamId }) => {
   const classes = useStyles();
   const { putLivestreamQuestion } = useFirebase();
   const { authenticatedUser, userData } = useAuth();
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
      onSubmit: async (values) => {
         if (!authenticatedUser) {
            return replace("/signup");
         }
         try {
            const newQuestion = {
               title: values.questionTitle,
               votes: 0,
               type: "new",
               author: authenticatedUser.email,
            };
            await putLivestreamQuestion(livestreamId, newQuestion);
         } catch (e) {}
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
   return <div className={classes.root}></div>;
};

export default CreateQuestion;
