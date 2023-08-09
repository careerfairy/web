import { PlusCircle } from "react-feather"
import { useEffect, useState } from "react"
import { Button, Stack, Typography } from "@mui/material"

import { sxStyles } from "types/commonTypes"
import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import RegistrationQuestion from "./ResgistrationQuestion"
import { createAGroupQuestion } from "./createAGroupQuestion"

const styles = sxStyles({
   stack: {
      display: "flex",
      padding: "16px",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "24px",
      alignSelf: "stretch",
      width: "-webkit-fill-available",
   },
   addOptionButton: {
      display: "flex",
      padding: "12px 0px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "43px",
      border: "1.5px solid #6749EA",
      color: "#6749EA",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
   },
   addNewQuestionButton: {
      display: "flex",
      height: "74px",
      padding: "28px",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      alignSelf: "stretch",
      borderRadius: "8px",
      border: "1px solid #ECECEC",
      background: "#FEFEFE",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "16px",
   },
})

type Questionnaire = {
   questions: GroupQuestion[]
}

type Props = {
   initialData?: Questionnaire
}

const QuestionarieCreation = ({ initialData }: Props) => {
   const [inputMode, setInputMode] = useState<boolean[]>(
      Array(initialData.questions.length).fill(false)
   )
   const [questions, setQuestions] = useState(initialData.questions ?? [])

   useEffect(() => {
      setQuestions(initialData.questions)
   }, [initialData])

   const addQuestionnarieQuestion = () => {
      const newQuestionsList = [...questions]
      newQuestionsList.push(createAGroupQuestion())
      setQuestions(newQuestionsList)
      const newInputMode = [...inputMode]
      newInputMode.push(true)
      setInputMode([...newInputMode])
   }

   const handleQuestionRemove = (questionId) => {
      const newQuestionsList = [
         ...questions.filter((question) => question.id !== questionId),
      ]
      setQuestions(newQuestionsList)
   }

   const handleSetInputMode = (value, questionId) => {
      const newInputModeList = [...inputMode]
      newInputModeList[questionId] = value
      setInputMode([...newInputModeList])
   }

   return (
      <Stack sx={styles.stack}>
         {questions.map((question, index) => (
            <RegistrationQuestion
               key={question.id}
               initialValues={question}
               inputMode={inputMode[index]}
               setInputMode={(value) => handleSetInputMode(value, index)}
               onRemove={handleQuestionRemove}
            />
         ))}
         <Button
            sx={{
               ...styles.addNewQuestionButton,
               color: inputMode ? "#D9D9D9" : "#6749EA",
            }}
            onClick={() => addQuestionnarieQuestion()}
         >
            <PlusCircle />
            <Typography variant="button">Add question</Typography>
         </Button>
      </Stack>
   )
}

export default QuestionarieCreation
