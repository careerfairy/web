import {
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { FeedbackQuestionFormValues } from "../commons"
import MoreMenuWithEditAndRemoveOptions from "./MoreMenu"
import { FC, useCallback, useState } from "react"
import FeedbackQuestionAddEditDialog from "./FeedbackQuestionAddEditDialog"
import FeedbackQuestionRemoveDialog from "./FeedbackQuestionRemoveDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import AddQuestionButton from "./AddQuestionButton"

const styles = sxStyles({
   table: {
      container: {
         borderRadius: "12px",
         border: "1px solid #F3F3F5",
         tr: {
            "td, th": {
               borderBottom: "1px solid #F3F3F5",
            },
            "&:last-child td, &:last-child th": {
               border: 0,
            },
         },
      },
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
      body: {
         background:
            "linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, #F3F3F5, #F3F3F5)",
         "td, th": {
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0em",
            color: "#5C5C6A",
            pading: "16px",
         },
      },
   },
})

type FeedbackQuestionsDesktopProps = {
   questions: FeedbackQuestionFormValues[]
}

const FeedbackQuestionsDesktop: FC<FeedbackQuestionsDesktopProps> = ({
   questions,
}) => {
   const [currentQuestion, setCurrentQuestion] = useState(null)

   const [
      isAddEditDialogOpen,
      handleAddEditOpenDialog,
      handleAddEditCloseDialog,
   ] = useDialogStateHandler()

   const handleAddQuestionClick = useCallback(() => {
      setCurrentQuestion(null)
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

   const handleRemove = useCallback(
      (_, question) => {
         setCurrentQuestion(question)
         handleRemoveOpenDialog()
      },
      [handleRemoveOpenDialog]
   )

   return (
      <>
         <TableContainer sx={styles.table.container}>
            <Table aria-label="Feedback questions table">
               <TableHead sx={styles.table.head}>
                  <TableRow>
                     <TableCell>Question</TableCell>
                     <TableCell>Type</TableCell>
                     <TableCell>Appear after</TableCell>
                     <TableCell></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody sx={styles.table.body}>
                  {questions.map((question, index) => (
                     <TableRow key={index}>
                        <TableCell component="th" scope="row">
                           {question.title}
                        </TableCell>
                        <TableCell>{question.type}</TableCell>
                        <TableCell>{`${question.appearAfter} minutes`}</TableCell>
                        <TableCell>
                           <MoreMenuWithEditAndRemoveOptions
                              handleEdit={(event) =>
                                 handleEdit(event, question)
                              }
                              handleRemove={(event) =>
                                 handleRemove(event, question)
                              }
                           />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
         <AddQuestionButton handleClick={handleAddQuestionClick} />
         <FeedbackQuestionAddEditDialog
            question={currentQuestion}
            isDialogOpen={isAddEditDialogOpen}
            handleCloseDialog={handleAddEditCloseDialog}
         />
         <FeedbackQuestionRemoveDialog
            question={currentQuestion}
            isDialogOpen={isRemoveDialogOpen}
            handleCloseDialog={handleRemoveCloseDialog}
         />
      </>
   )
}

export default FeedbackQuestionsDesktop
