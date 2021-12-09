import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import GroupLogo from "../common/GroupLogo";
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
} from "@material-ui/core";
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { useRouter } from "next/router";
import { useFirebase } from "../../../../../context/firebase";
import { useFormik } from "formik";

const useStyles = makeStyles((theme) => ({
   root: {},
}));

const maxQuestionLength = 170;
const minQuestionLength = 15;
const QuestionCreateForm = () => {
   const { handleNext, group, livestream, handleGoToLast } = useContext(
      RegistrationContext
   );
   const classes = useStyles();
   const { replace } = useRouter();
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
            await putLivestreamQuestion(livestream.id, newQuestion);
            customHandleNext();
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

   const customHandleNext = () => {
      const isAlreadyInTalentPool =
         userData?.talentPools &&
         livestream &&
         userData.talentPools.includes(livestream.companyId);
      if (livestream.hasNoTalentPool || isAlreadyInTalentPool) {
         // go to final step
         handleGoToLast();
      } else {
         // go to next talent pool step
         handleNext();
      }
   };

   return (
      <>
         <GroupLogo logoUrl={group.logoUrl} />
         <DialogTitle align="center">
            ASK YOUR QUESTION. GET THE ANSWER DURING THE LIVE STREAM.
         </DialogTitle>
         <DialogContent className={classes.content}>
            <Box p={2}>
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
            </Box>
         </DialogContent>
         <DialogActions>
            <Button
               variant="text"
               disabled={isSubmitting}
               size="large"
               onClick={customHandleNext}
               color="primary"
               autoFocus
            >
               Skip
            </Button>
            <Button
               variant="contained"
               size="large"
               onClick={handleSubmit}
               color="primary"
               autoFocus
               disabled={isSubmitting}
            >
               Submit
            </Button>
         </DialogActions>
      </>
   );
};

export default QuestionCreateForm;
