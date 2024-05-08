import {
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useLivestreamCreationContext } from "../../../../LivestreamCreationContext"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import { FeedbackQuestionsLabels, getNewQuestionFormValues } from "../commons"
import AddQuestionButton from "./AddQuestionButton"
import FeedbackQuestionAddEditDialog from "./FeedbackQuestionAddEditDialog"
import FeedbackQuestionRemoveDialog from "./FeedbackQuestionRemoveDialog"
import MoreMenuWithEditAndRemoveOptions from "./MoreMenu"

const styles = sxStyles({
   table: {
      container: (theme) => ({
         borderRadius: "12px",
         border: `1px solid ${theme.brand.white[500]}`,
         tr: {
            "td, th": {
               borderBottom: `1px solid ${theme.brand.white[500]}`,
            },
            "&:last-child td, &:last-child th": {
               border: 0,
            },
         },
      }),
      head: {
         background: "#F6F6FA",
         th: {
            color: "#5C5C6A",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            letterSpacing: "0em",
            padding: "8px 16px 8px 16px",
         },
      },
      body: (theme) => ({
         background: `linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, ${theme.brand.white[500]}, ${theme.brand.white[500]})`,
         "td, th": {
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0em",
            color: "neutral.600",
            pading: "16px",
         },
      }),
   },
})

const FeedbackQuestionsDesktop = () => {
   const {
      values: { questions },
      setFieldValue,
   } = useLivestreamFormValues()
   const { livestream } = useLivestreamCreationContext()
   const [currentQuestion, setCurrentQuestion] = useState(null)

   const [
      isAddEditDialogOpen,
      handleAddEditOpenDialog,
      handleAddEditCloseDialog,
   ] = useDialogStateHandler()

   const handleAddQuestionClick = useCallback(() => {
      setCurrentQuestion(getNewQuestionFormValues)
      handleAddEditOpenDialog()
   }, [handleAddEditOpenDialog])

   const handleEdit = useCallback(
      (_, question) => {
         setCurrentQuestion(question)
         handleAddEditOpenDialog()
      },
      [handleAddEditOpenDialog]
   )

   const [isRemoveDialogOpen, handleRemoveOpenDialog, handleRemoveCloseDialog] =
      useDialogStateHandler()

   const handleRemoveDialogOpen = useCallback(
      (_, question) => {
         setCurrentQuestion(question)
         handleRemoveOpenDialog()
      },
      [handleRemoveOpenDialog]
   )

   const handleRemoveClick = useCallback(() => {
      setFieldValue(
         "questions.feedbackQuestions",
         questions.feedbackQuestions.map((question) => {
            if (question.id === currentQuestion?.id) {
               return {
                  ...currentQuestion,
                  deleted: true,
               }
            } else {
               return question
            }
         })
      )
      handleRemoveCloseDialog()
   }, [
      currentQuestion,
      handleRemoveCloseDialog,
      questions.feedbackQuestions,
      setFieldValue,
   ])

   const hasFeedbackQuestions = useMemo(
      () =>
         questions.feedbackQuestions &&
         questions.feedbackQuestions.filter((question) => !question.deleted)
            .length > 0,
      [questions.feedbackQuestions]
   )

   return (
      <>
         {Boolean(hasFeedbackQuestions) && (
            <TableContainer sx={styles.table.container}>
               <Table aria-label="Feedback questions table">
                  <TableHead sx={styles.table.head}>
                     <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Appear after</TableCell>
                        {!livestream.hasEnded && <TableCell />}
                     </TableRow>
                  </TableHead>
                  <TableBody sx={styles.table.body}>
                     {questions.feedbackQuestions
                        .filter((question) => !question.deleted)
                        .map((question, index) => (
                           <TableRow key={index}>
                              <TableCell component="th" scope="row">
                                 {question.question}
                              </TableCell>
                              <TableCell>
                                 {FeedbackQuestionsLabels[question.type]}
                              </TableCell>
                              <TableCell>{`${question.appearAfter} minutes`}</TableCell>
                              {!livestream.hasEnded && (
                                 <TableCell>
                                    <MoreMenuWithEditAndRemoveOptions
                                       handleEdit={(event) =>
                                          handleEdit(event, question)
                                       }
                                       handleRemove={(event) =>
                                          handleRemoveDialogOpen(
                                             event,
                                             question
                                          )
                                       }
                                       labels={[
                                          "Edit question",
                                          "Remove question",
                                       ]}
                                    />
                                 </TableCell>
                              )}
                           </TableRow>
                        ))}
                  </TableBody>
               </Table>
            </TableContainer>
         )}
         {!livestream.hasEnded && (
            <>
               <AddQuestionButton handleClick={handleAddQuestionClick} />
               <FeedbackQuestionAddEditDialog
                  question={currentQuestion}
                  isDialogOpen={isAddEditDialogOpen}
                  handleCloseDialog={handleAddEditCloseDialog}
               />
               <FeedbackQuestionRemoveDialog
                  isDialogOpen={isRemoveDialogOpen}
                  handleRemoveClick={handleRemoveClick}
                  handleCloseDialog={handleRemoveCloseDialog}
               />
            </>
         )}
      </>
   )
}

export default FeedbackQuestionsDesktop
