import { PlusCircle } from "react-feather"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { Box, Button, Stack, Typography } from "@mui/material"

import { sxStyles } from "types/commonTypes"
import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import RegistrationQuestion from "./ResgistrationQuestion"
import { createAGroupQuestion } from "./QuestionaireCreationUtils"
import { TransitionGroup } from "react-transition-group"
import { Collapse } from "@mui/material"

const styles = sxStyles({
   stack: {
      display: "flex",
      p: 2,
      flexDirection: "column",
      alignItems: "flex-end",
      alignSelf: "stretch",
      width: "inherit",
   },
   addNewQuestionButton: {
      display: "flex",
      height: "74px",
      borderRadius: 2,
      border: "1px solid #ECECEC",
      background: "#FEFEFE",
      fontSize: "1.28571rem",
      fontWeight: 600,
   },
})

type Props = {
   groupQuestions: GroupQuestion[]
}

type QuestionsForm = (GroupQuestion & {
   isEditMode: boolean
})[]

const QuestionarieCreation: FC<Props> = ({ groupQuestions }) => {
   const [questionsForm, setQuestionsForm] = useState<QuestionsForm>(() =>
      groupQuestions.map((question) => ({
         ...question,
         isEditMode: true,
      }))
   )

   const hasTempQuestion = useMemo(
      () => questionsForm.some((q) => q.id.includes("temp-")),
      [questionsForm]
   )

   useEffect(() => {
      setQuestionsForm((prevQuestionsForm) => {
         return groupQuestions.map((groupQuestion) => {
            const existingQuestion = prevQuestionsForm.find(
               (questionForm) => questionForm.id === groupQuestion.id
            )
            return existingQuestion
               ? {
                    ...existingQuestion,
                    ...groupQuestion,
                 }
               : {
                    ...groupQuestion,
                    isEditMode: true,
                 }
         })
      })
   }, [groupQuestions])

   const addQuestionnarieQuestion = useCallback(() => {
      setQuestionsForm((prev) => {
         const newForm = [
            ...prev,
            {
               ...createAGroupQuestion(),
               isEditMode: true,
            },
         ]
         return newForm
      })
   }, [])

   useEffect(() => {
      if (questionsForm.length === 0 && !hasTempQuestion) {
         addQuestionnarieQuestion()
      }
   }, [addQuestionnarieQuestion, hasTempQuestion, questionsForm.length])

   const handleQuestionRemove = (questionId: string) => {
      setQuestionsForm((prevQuestions) =>
         prevQuestions.filter((question) => question.id !== questionId)
      )
   }

   const handleSetEditMode = (value: boolean, questionIndex: number) => {
      setQuestionsForm((prev) => {
         const newForm = [...prev]
         newForm[questionIndex].isEditMode = value
         return newForm
      })
   }

   return (
      <Stack spacing={2} sx={styles.stack}>
         <Stack width="100%" spacing={2} component={TransitionGroup}>
            {questionsForm.map(({ isEditMode, ...question }, index) => (
               <Collapse key={question.id}>
                  <Box width="100%" my={2} component="span">
                     <RegistrationQuestion
                        initialValues={question}
                        inputMode={isEditMode}
                        setInputMode={(value) =>
                           handleSetEditMode(value, index)
                        }
                        onRemove={handleQuestionRemove}
                        onCreated={(tempId, newQuestion) => {
                           setQuestionsForm((prev) => {
                              return prev.map((question) => {
                                 if (question.id === tempId) {
                                    newQuestion.id = question.id
                                 }
                                 return question
                              })
                           })
                        }}
                     />
                  </Box>
               </Collapse>
            ))}
         </Stack>
         <Button
            sx={styles.addNewQuestionButton}
            disabled={hasTempQuestion}
            onClick={() => addQuestionnarieQuestion()}
            color="secondary"
            variant="text"
            fullWidth
            startIcon={<PlusCircle />}
         >
            <Typography variant="button">Add question</Typography>
         </Button>
      </Stack>
   )
}

export default QuestionarieCreation
