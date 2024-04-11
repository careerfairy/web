import React, { Fragment, useCallback, useMemo } from "react"
import { FormControl, FormHelperText, MenuItem } from "@mui/material"
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
import { sxStyles } from "../../../../../types/commonTypes"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import useIsMobile from "components/custom-hook/useIsMobile"

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
   const questions = useMemo(() => {
      return Object.values(groupQuestions.questions).sort(dynamicSort("name"))
   }, [groupQuestions.questions])

   return (
      <Fragment>
         {questions.map((question: LivestreamGroupQuestion) => {
            const errorText =
               errors[groupQuestions.groupId]?.questions?.[question.id]
                  ?.selectedOptionId
            const touchedEl =
               touched[groupQuestions.groupId]?.questions?.[question.id]

            return (
               <QuestionSelect
                  key={question.id}
                  handleBlur={handleBlur}
                  errorText={errorText && touchedEl ? errorText : null}
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

const styles = sxStyles({
   select: {
      width: "100%",
      "& .MuiMenuItem-root": {
         backgroundColor: "dark.primary",
      },
   },
   formControl: {
      ["& .MuiInputBase-root"]: {
         borderRadius: 30,
         boxShadow: "none",
      },
      ["& .MuiSelect-iconOutlined"]: {
         marginRight: "20px",
         color: ["text.primary", "!important"],
      },
      ["& .MuiInputLabel-shrink"]: {
         paddingLeft: "0 !important",
         left: "10px",
         paddingX: "5px",
      },
      ["& legend"]: {
         marginLeft: "15px",
      },
      ["& .Mui-error"]: {
         pl: 0,
      },
   },
   menuItem: {
      paddingLeft: "40px",
   },
   label: {
      paddingLeft: "30px",
      color: ["text.primary", "!important"],
      fontSize: "16px !important",
   },
   errorText: {
      paddingLeft: "30px",
   },
   question: {
      ["label"]: {
         left: "0 !important",
         paddingLeft: "0 !important",
      },
   },
   placeholder: {
      ["& .MuiInputBase-input"]: {
         color: "neutral.300",
      },
   },
   hideOption: {
      display: "none",
   },
})

const QuestionSelect = ({
   inputName,
   question,
   setFieldValue,
   errorText,
}: QuestionSelectProps) => {
   const isMobile = useIsMobile()
   const options = useMemo(() => {
      return convertDictToDocArray(question.options).sort(dynamicSort("name"))
   }, [question.options])

   const handleOptionChange = useCallback(
      (event) => {
         setFieldValue(inputName, event.target.value)
      },
      [inputName, setFieldValue]
   )

   const selectedOption =
      options.find((option) => option.id === question.selectedOptionId) || null

   const optionsWithPlaceholder = [
      ...options,
      { id: "placeholder", name: "Select an option" },
   ]

   return (
      <FormControl fullWidth error={!!errorText} sx={styles.formControl}>
         <BrandedTextField
            key={inputName}
            id={inputName}
            label={question.name}
            value={
               selectedOption?.id ||
               optionsWithPlaceholder.find(
                  (option) => option.id === "placeholder"
               ).id
            }
            select
            SelectProps={{
               native: isMobile,
            }}
            onChange={handleOptionChange}
            sx={[styles.question, !selectedOption && styles.placeholder]}
         >
            {isMobile
               ? optionsWithPlaceholder.map((option) => (
                    <option
                       key={option.id}
                       value={option.id}
                       style={
                          option.id === "placeholder" ? styles.hideOption : {}
                       }
                    >
                       {option.name}
                    </option>
                 ))
               : optionsWithPlaceholder.map((option) => (
                    <MenuItem
                       key={option.id}
                       value={option.id}
                       sx={option.id === "placeholder" ? styles.hideOption : {}}
                    >
                       {option.name}
                    </MenuItem>
                 ))}
         </BrandedTextField>
         <FormHelperText sx={styles.errorText}>{errorText}</FormHelperText>
      </FormControl>
   )
}
export default LivestreamGroupQuestionsSelector
