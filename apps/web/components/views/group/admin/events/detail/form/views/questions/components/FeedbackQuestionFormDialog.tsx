import { FC } from "react"
import { Formik } from "formik"
import { Box } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import FeedbackQuestionForm from "./FeedbackQuestionForm"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import {
   FeedbackQuestionFormValues,
   feedbackQuestionFormInitialValues,
   feedbackQuestionValidationSchema,
} from "../commons"

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
   question?: object
   handleClose: () => void
}

const FeedbackQuestionEditDialog: FC<FeedbackQuestionEditDialogProps> = ({
   question,
   handleClose,
}) => {
   const isEdit = Boolean(question)
   const initialValues =
      (question as FeedbackQuestionFormValues) ||
      feedbackQuestionFormInitialValues

   const handleSubmit = undefined

   return (
      <Formik<FeedbackQuestionFormValues>
         initialValues={initialValues}
         onSubmit={handleSubmit}
         validationSchema={feedbackQuestionValidationSchema}
         enableReinitialize
      >
         {({ dirty, handleSubmit, isSubmitting, isValid }) => (
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
                           <FeedbackQuestionForm />
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
                        disabled={isSubmitting || !isValid || !dirty}
                        type="submit"
                        onClick={() => handleSubmit()}
                        loading={isSubmitting}
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

const DialogTitle: FC<DialogTitleProps> = ({ isEdit }) => (
   <>
      {isEdit ? "Edit your" : "Add"}{" "}
      <Box component="span" color="secondary.main">
         feedback{" "}
      </Box>
      question
   </>
)

export default FeedbackQuestionEditDialog
