import React, { Fragment, useCallback, useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import {
   Chip,
   MenuItem,
   TextField,
   Typography,
   useMediaQuery,
} from "@mui/material"
import {
   LivestreamGroupQuestion,
   LivestreamGroupQuestions,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/dist/livestreams"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"
import { convertDictToDocArray } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   FormikErrors,
   FormikHandlers,
   FormikHelpers,
   FormikTouched,
} from "formik"

interface Props {
   groupQuestions: LivestreamGroupQuestions
   setFieldValue: FormikHelpers<LivestreamGroupQuestionsMap>["setFieldValue"]
   handleBlur: FormikHandlers["handleBlur"]
   errors: FormikErrors<LivestreamGroupQuestionsMap>
   touched: FormikTouched<LivestreamGroupQuestionsMap>
}
const LivestreamGroupQuestionsSelector = ({
   groupQuestions,
   setFieldValue,
   errors,
   touched,
   handleBlur,
}: Props) => {
   const [questions, setQuestions] = useState<LivestreamGroupQuestion[]>([])

   useEffect(() => {
      setQuestions(
         Object.values(groupQuestions.questions).sort(dynamicSort("name"))
      )
   }, [groupQuestions.questions])

   return (
      <Fragment>
         {questions.map((question) => {
            const errorText =
               errors[groupQuestions.groupId]?.questions?.[question.id]
                  ?.selectedOptionId
            const touchedEl =
               touched[groupQuestions.groupId]?.questions?.[question.id]
            return (
               <QuestionSelect
                  key={question.id}
                  handleBlur={handleBlur}
                  errorText={errorText && touchedEl && errorText}
                  inputName={`${groupQuestions.groupId}.questions.${question.id}.selectedOptionId`}
                  question={question}
                  setFieldValue={setFieldValue}
               />
            )
         })}
      </Fragment>
   )
}

interface QuestionSelectProps {
   inputName: string
   question: LivestreamGroupQuestion
   handleBlur: FormikHandlers["handleBlur"]
   errorText: string
   setFieldValue: FormikHelpers<LivestreamGroupQuestionsMap>["setFieldValue"]
}
const QuestionSelect = ({
   inputName,
   question,
   setFieldValue,
   handleBlur,
   errorText,
}: QuestionSelectProps) => {
   const theme = useTheme()
   const native = useMediaQuery(theme.breakpoints.down("sm"))
   const [options] = useState(
      convertDictToDocArray(question.options).sort(dynamicSort("name"))
   )
   const handleChange = useCallback(
      (event: React.ChangeEvent<{ value: unknown }>) =>
         setFieldValue(inputName, event.target.value),
      [inputName, setFieldValue]
   )

   const isNew = question.isNew && !question.selectedOptionId

   return (
      <TextField
         id={`${inputName}`}
         select
         name={inputName}
         label={
            <Typography variant={"inherit"}>
               {isNew && (
                  <Chip
                     sx={{ mr: 0.5 }}
                     size={"small"}
                     color="primary"
                     label={"New!"}
                  />
               )}
               {question.name}
            </Typography>
         }
         onBlur={handleBlur}
         error={!!errorText}
         helperText={errorText}
         value={question.selectedOptionId || ""}
         onChange={handleChange}
         SelectProps={{
            native: native,
         }}
      >
         {native && <option value="" disabled></option>}
         {options.map((option) => {
            if (native) {
               return (
                  <option key={option.id} value={option.id}>
                     {option.name}
                  </option>
               )
            } else {
               return (
                  <MenuItem key={option.id} value={option.id}>
                     <Typography variant="inherit" noWrap>
                        {option.name}
                     </Typography>
                  </MenuItem>
               )
            }
         })}
      </TextField>
   )
}
export default LivestreamGroupQuestionsSelector
