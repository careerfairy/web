import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { Formik } from "formik"
import { useCallback } from "react"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import {
   FeedbackQuestionFormValues,
   feedbackQuestionValidationSchema,
} from "../commons"
import FeedbackQuestionForm from "./FeedbackQuestionForm"

const styles = sxStyles({
   wrapContainer: {
      height: {
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      mt: 1,
   },
   form: {
      my: "40px",
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      position: "absolute !important",
      backgroundColor: "#FFFFFF !important",
      width: "96% !important",
      marginLeft: "2%",
   },
})

type FeedbackQuestionEditDialogProps = {
   question: FeedbackQuestionFormValues
   handleClose: () => void
}

const FeedbackQuestionEditDialog = ({
   question,
   handleClose,
}: FeedbackQuestionEditDialogProps) => {
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()
   const isEdit = Boolean(!question.isNew)
   const initialValues = question

   const handleSubmit = useCallback(
      (newQuestion) => {
         if (isEdit) {
            setFieldValue(
               "questions.feedbackQuestions",
               questions.feedbackQuestions.map((q) =>
                  q.id === newQuestion.id ? newQuestion : q
               )
            )
         } else {
            setFieldValue("questions.feedbackQuestions", [
               ...questions.feedbackQuestions,
               { ...newQuestion, isNew: false },
            ])
         }
         handleClose()
      },
      [isEdit, questions, setFieldValue, handleClose]
   )

   return (
      <Formik<FeedbackQuestionFormValues>
         initialValues={initialValues}
         onSubmit={undefined}
         validationSchema={feedbackQuestionValidationSchema}
         enableReinitialize
      >
         {({ values, dirty, isValid }) => (
            <SteppedDialog.Container
               containerSx={styles.content}
               sx={styles.wrapContainer}
               withActions
               handleCloseIconClick={handleClose}
            >
               <>
                  <SteppedDialog.Content sx={styles.container}>
                     <>
                        <SteppedDialog.Title sx={styles.title}>
                           <DialogTitle isEdit={isEdit} />
                        </SteppedDialog.Title>

                        <SteppedDialog.Subtitle sx={styles.subtitle}>
                           Automatically ask your audience feedback questions
                           during the live stream
                        </SteppedDialog.Subtitle>

                        <Box sx={styles.form}>
                           <FeedbackQuestionForm questionFormValues={values} />
                        </Box>
                     </>
                  </SteppedDialog.Content>

                  <SteppedDialog.Actions sx={styles.actions}>
                     <SteppedDialog.Button
                        variant="outlined"
                        color="grey"
                        onClick={handleClose}
                     >
                        Cancel
                     </SteppedDialog.Button>

                     <SteppedDialog.Button
                        variant="contained"
                        color={"secondary"}
                        disabled={!isValid || !dirty}
                        type="submit"
                        onClick={() => handleSubmit(values)}
                     >
                        {isEdit ? "Save" : "Create"}
                     </SteppedDialog.Button>
                  </SteppedDialog.Actions>
               </>
            </SteppedDialog.Container>
         )}
      </Formik>
   )
}

type DialogTitleProps = {
   isEdit: boolean
}

const DialogTitle = ({ isEdit }: DialogTitleProps) => (
   <>
      {isEdit ? "Edit your" : "Add"}{" "}
      <Box component="span" color="secondary.main">
         feedback{" "}
      </Box>
      question
   </>
)

export default FeedbackQuestionEditDialog
