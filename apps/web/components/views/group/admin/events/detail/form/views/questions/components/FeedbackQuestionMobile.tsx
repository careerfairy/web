/* eslint-disable @typescript-eslint/no-unused-vars */
import { Edit2 as EditIcon, Save, Trash2 as DeleteIcon } from "react-feather"
import { Formik } from "formik"
import { FC, useState } from "react"
import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Stack, Typography } from "@mui/material"
import FeedbackQuestionForm from "./FeedbackQuestionForm"
import {
   FeedbackQuestionFormValues,
   feedbackQuestionFormInitialValues,
   feedbackQuestionValidationSchema,
} from "../commons"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import FeedbackQuestionRemoveDialog from "./FeedbackQuestionRemoveDialog"

const styles = sxStyles({
   container: {
      display: "flex",
      padding: "16px",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "20px",
      alignSelf: "stretch",
      borderRadius: "10px",
      border: "1px solid #EBEBEB",
      backgroundColor: "#FFF",
      "& p": {
         color: "#212020",
         width: "100%",
         fontFamily: "Poppins",
         fontSize: "16px",
         fontStyle: "normal",
         fontWeight: 400,
         lineHeight: "20px",
         borderBottom: "1px solid #F2F2F2",
         paddingBottom: "20px",
         ":last-of-type": {
            borderBottom: 0,
            paddingBottom: 0,
         },
      },
   },
   editButton: {
      display: "flex",
      height: "28px",
      padding: "2px 12px",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "stretch",
      borderRadius: "32px",
      background: "#EEE",
      color: "#A0A0A0",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px",
      svg: {
         height: "16px",
      },
   },
   actionButtonsContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 2,
      width: "100%",
      justifyContent: "center",
      ".MuiButtonBase-root": {
         padding: "5px 15px",
      },
   },
})

type FeedbackQuestionMobileProps = {
   key: string | number
   question: FeedbackQuestionFormValues
   handleEdit: (args: unknown) => void
   handleRemove: (args: unknown) => void
}

const FeedbackQuestionMobile: FC<FeedbackQuestionMobileProps> = ({
   key,
   question,
   handleEdit,
   handleRemove,
}) => {
   const [isEditing, setIsEditing] = useState(false)

   const [isRemoveDialogOpen, handleOpenCloseDialog, handleRemoveCloseDialog] =
      useDialogStateHandler()

   const initialValues =
      (question as FeedbackQuestionFormValues) ||
      feedbackQuestionFormInitialValues

   return (
      <Stack key={key} sx={styles.container}>
         {isEditing ? (
            <Formik<FeedbackQuestionFormValues>
               initialValues={initialValues}
               onSubmit={undefined}
               validationSchema={feedbackQuestionValidationSchema}
               enableReinitialize
            >
               {({ dirty, handleSubmit, isSubmitting, isValid }) => (
                  <>
                     <FeedbackQuestionForm />
                     <Stack sx={styles.actionButtonsContainer}>
                        <Button
                           variant="outlined"
                           color="error"
                           onClick={handleRemove}
                           endIcon={<DeleteIcon />}
                        >
                           Remove Question
                        </Button>
                        <Button
                           variant="contained"
                           color="secondary"
                           disabled={!isValid}
                           onClick={() => setIsEditing(false)}
                           endIcon={<Save />}
                        >
                           Save
                        </Button>
                     </Stack>
                  </>
               )}
            </Formik>
         ) : (
            <>
               <Typography>{question.title}</Typography>
               <Typography>{question.type}</Typography>
               <Typography>{question.appearAfter}</Typography>
               <Button
                  sx={styles.editButton}
                  endIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  fullWidth
               >
                  Edit
               </Button>
            </>
         )}
      </Stack>
   )
}

export default FeedbackQuestionMobile
