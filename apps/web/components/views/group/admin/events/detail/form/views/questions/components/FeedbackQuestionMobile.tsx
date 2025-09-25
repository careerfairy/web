import { sxStyles } from "@careerfairy/shared-ui"
import { Button, Stack, Typography } from "@mui/material"
import { Formik } from "formik"
import { useCallback, useMemo, useState } from "react"
import { Trash2 as DeleteIcon, Edit2 as EditIcon, Save } from "react-feather"
import { useLivestreamCreationContext } from "../../../../LivestreamCreationContext"
import { ESTIMATED_DURATIONS } from "../../../commons"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import {
   FeedbackQuestionFormValues,
   FeedbackQuestionsLabels,
   feedbackQuestionValidationSchema,
} from "../commons"
import FeedbackQuestionForm from "./FeedbackQuestionForm"

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
   buttonExtraSmall: {
      fontSize: {
         xs: "1rem",
         sm: "initial",
      },
   },
})

type FeedbackQuestionMobileProps = {
   key: string | number
   question: FeedbackQuestionFormValues
   handleRemove: () => void
}

const FeedbackQuestionMobile = ({
   key,
   question,
   handleRemove,
}: FeedbackQuestionMobileProps) => {
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const [isEditing, setIsEditing] = useState(Boolean(question.isNew))

   const handleEdit = useCallback(
      (editedQuestion) => {
         const updatedQuestions = questions.feedbackQuestions.map((q) =>
            q.id === editedQuestion.id ? { ...editedQuestion, isNew: false } : q
         )
         setFieldValue("questions.feedbackQuestions", updatedQuestions)
         setIsEditing(false)
      },
      [questions, setFieldValue]
   )

   const appearAfterLabel = useMemo(
      () =>
         ESTIMATED_DURATIONS.find(
            (duration) => duration.minutes === question.appearAfter
         )?.name,
      [question.appearAfter]
   )

   const initialValues = question

   return (
      <Stack key={key} sx={styles.container}>
         {isEditing ? (
            <Formik<FeedbackQuestionFormValues>
               initialValues={initialValues}
               onSubmit={undefined}
               validationSchema={feedbackQuestionValidationSchema}
               enableReinitialize
            >
               {({ values, isValid }) => {
                  const isEditingNew =
                     values.question === undefined ||
                     values.type === undefined ||
                     values.appearAfter === undefined

                  return (
                     <>
                        <FeedbackQuestionForm questionFormValues={values} />
                        <Stack sx={styles.actionButtonsContainer}>
                           <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                 setIsEditing(false)
                                 handleRemove()
                              }}
                              endIcon={<DeleteIcon />}
                              sx={styles.buttonExtraSmall}
                           >
                              Remove question
                           </Button>
                           <Button
                              variant="contained"
                              color="secondary"
                              disabled={!isValid || isEditingNew}
                              onClick={() => handleEdit(values)}
                              endIcon={<Save />}
                              sx={styles.buttonExtraSmall}
                           >
                              Save
                           </Button>
                        </Stack>
                     </>
                  )
               }}
            </Formik>
         ) : (
            <>
               <Typography>{question.question}</Typography>
               <Typography>{FeedbackQuestionsLabels[question.type]}</Typography>
               <Typography>{appearAfterLabel}</Typography>
               {!livestream.hasEnded && (
                  <Button
                     sx={styles.editButton}
                     endIcon={<EditIcon />}
                     onClick={() => setIsEditing(true)}
                     fullWidth
                  >
                     Edit
                  </Button>
               )}
            </>
         )}
      </Stack>
   )
}

export default FeedbackQuestionMobile
