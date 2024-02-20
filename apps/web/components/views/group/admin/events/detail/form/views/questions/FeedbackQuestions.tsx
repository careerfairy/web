import {
   Box,
   Button,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from "@mui/material"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
import { MoreVertical, PlusCircle } from "react-feather"

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
   addQuestion: {
      container: {
         display: "flex",
         justifyContent: "center",
         width: "100%",
         height: "74px",
         border: "1px solid #F3F3F5",
         borderRadius: "12px",
         background:
            "linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, #F3F3F5, #F3F3F5)",
      },
      button: {
         fontWeight: 600,
         padding: "28px",
         borderRadius: "0",
      },
   },
})

const dummyFeedbackQuestions = [
   {
      title: "How happy are you with the content shared by us?",
      type: "Star rating",
      appearAfter: 30,
   },
   {
      title: "Help us to improve: How can they make the experience more useful to you and other students?",
      type: "Written review",
      appearAfter: 40,
   },
]

const newDummyFeedbackQuestion = {
   title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
   type: new Date().toString(),
   appearAfter: 40,
}

const FeedbackQuestions = () => {
   const [feedbackQuestions, setFeedbackQuestions] = useState(
      dummyFeedbackQuestions
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
                  {feedbackQuestions.map((row, index) => (
                     <TableRow key={index}>
                        <TableCell component="th" scope="row">
                           {row.title}
                        </TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{`${row.appearAfter} minutes`}</TableCell>
                        <TableCell>
                           <MoreVertical />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
         <Box sx={styles.addQuestion.container}>
            <Button
               sx={styles.addQuestion.button}
               startIcon={<PlusCircle strokeWidth={2.5} />}
               color="secondary"
               fullWidth
               onClick={() => {
                  setFeedbackQuestions([
                     ...feedbackQuestions,
                     newDummyFeedbackQuestion,
                  ])
               }}
            >
               Add question
            </Button>
         </Box>
      </>
   )
}

export default FeedbackQuestions
