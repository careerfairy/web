import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import * as yup from "yup"
import Question from "./QuestionName"
import QuestionOption from "./QuestionOption"
import { Box, Button, Stack, Typography } from "@mui/material"
import { PlusCircle } from "react-feather"
import SaveChangesButton from "components/views/admin/company-information/SaveChangesButton"

import { sxStyles } from "types/commonTypes"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "components/custom-hook/useStreamRef"
import { Form, useFormik } from "formik"
import { v4 as uuidv4 } from "uuid"
import {
   GroupQuestion,
   GroupQuestionOption,
   convertGroupQuestionOptionsToSortedArray,
} from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import { convertDictToDocArray } from "@careerfairy/shared-lib/BaseFirebaseRepository"
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

const validationSchema = yup.object({
   question: yup
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters long")
      .required("Question is required"),
   options: yup
      .array()
      .of(
         yup.object({
            text: yup
               .string()
               .trim()
               .min(1, "Option must be at least 1 character")
               .required("Option is required"),
         })
      )
      .min(2, "At least 2 options are required")
      .max(5, "Max 5 options are allowed"),
})

const INITIAL_QUESTION_OPTIONS: GroupQuestionOption[] = [
   {
      id: uuidv4(),
      name: "",
   },
   {
      id: uuidv4(),
      name: "",
   },
]

const initialOptionsObject: Record<
   GroupQuestionOption["id"],
   GroupQuestionOption
> = INITIAL_QUESTION_OPTIONS.reduce((acc, option) => {
   acc[option.id] = option
   return acc
}, {} as Record<GroupQuestionOption["id"], GroupQuestionOption>)

type Questionnaire = {
   questions: GroupQuestion[]
}

type Props = {
   initialData?: Questionnaire
}

const QuestionarieCreation = ({ initialData }: Props) => {
   const [inputMode, setInputMode] = useState(false)
   const [questions, setQuestions] = useState(initialData.questions ?? [])

   useEffect(() => {
      setQuestions(initialData.questions)
   }, [initialData])

   const addQuestionnarieQuestion = () => {
      const newQuestionsList = [...questions]
      newQuestionsList.push(createAGroupQuestion())
      setQuestions(newQuestionsList)
   }
   return (
      <Stack sx={styles.stack}>
         {questions.map((question) => (
            <RegistrationQuestion
               key={question.id}
               initialValues={question}
               inputMode={inputMode}
               setInputMode={setInputMode}
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
