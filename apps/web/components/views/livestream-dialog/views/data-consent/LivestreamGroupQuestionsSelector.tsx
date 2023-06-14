import React, { Fragment, useCallback, useMemo } from "react"
import {
   FormControl,
   FormHelperText,
   InputLabel,
   MenuItem,
   Select,
   SelectChangeEvent,
   styled,
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
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { sxStyles } from "../../../../../types/commonTypes"
import { ExpandMore } from "@mui/icons-material"

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
})

const StyledSelect = styled(Select)(() => ({
   fontSize: "16px !important",
   "& .MuiSelect-select": {
      paddingLeft: "40px",
      boxShadow: "none",
   },
})) as unknown as typeof Select

const QuestionSelect = ({
   inputName,
   question,
   setFieldValue,
   handleBlur,
   errorText,
}: QuestionSelectProps) => {
   const isMobile = useIsMobile()

   const options = useMemo(() => {
      return convertDictToDocArray(question.options).sort(dynamicSort("name"))
   }, [question.options])

   const handleChange = useCallback(
      (event: SelectChangeEvent) => {
         setFieldValue(inputName, event.target.value)
      },
      [inputName, setFieldValue]
   )

   return (
      <FormControl fullWidth error={!!errorText} sx={styles.formControl}>
         <InputLabel sx={styles.label} id={`${inputName}-label`}>
            {question.name}
         </InputLabel>

         <StyledSelect
            sx={styles.select}
            id={`${inputName}`}
            name={inputName}
            label={question.name}
            onBlur={handleBlur}
            value={question.selectedOptionId || ""}
            onChange={handleChange}
            native={isMobile}
            variant="outlined"
            IconComponent={ExpandMore}
         >
            {isMobile ? <option value="" disabled></option> : null}
            {options.map((option) =>
               isMobile ? (
                  <option key={option.id} value={option.id}>
                     {option.name}
                  </option>
               ) : (
                  <MenuItem
                     sx={styles.menuItem}
                     key={option.id}
                     value={option.id}
                  >
                     {option.name}
                  </MenuItem>
               )
            )}
         </StyledSelect>
         <FormHelperText sx={styles.errorText}>{errorText}</FormHelperText>
      </FormControl>
   )
}
export default LivestreamGroupQuestionsSelector
